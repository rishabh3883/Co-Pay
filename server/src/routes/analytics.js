const express = require('express');
const { dbStore } = require('../dbStore');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────
// 🧠 SETTLEMENT ENGINE — Greedy Minimum Transfers
// Takes a list of { userId, balance } and returns
// minimum transfers to zero everyone out.
// ─────────────────────────────────────────────
function computeMinTransfers(memberContributions) {
  const eps = 0.01;

  // Deep clone so we don't mutate
  const debtors  = memberContributions
    .filter(m => m.balance < -eps)
    .map(m => ({ ...m }))
    .sort((a, b) => a.balance - b.balance); // most negative first

  const creditors = memberContributions
    .filter(m => m.balance > eps)
    .map(m => ({ ...m }))
    .sort((a, b) => b.balance - a.balance); // most positive first

  const transfers = [];
  let di = 0, ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const debtor   = debtors[di];
    const creditor = creditors[ci];
    const amt      = Math.min(-debtor.balance, creditor.balance);
    const rounded  = Math.round(amt * 100) / 100;

    if (rounded > 0) {
      transfers.push({
        fromId:   debtor.userId,
        fromName: debtor.userName,
        toId:     creditor.userId,
        toName:   creditor.userName,
        amount:   rounded,
      });
    }

    debtor.balance   += amt;
    creditor.balance -= amt;

    if (Math.abs(debtor.balance)   < eps) di++;
    if (Math.abs(creditor.balance) < eps) ci++;
  }

  return transfers;
}

// ─────────────────────────────────────────────
// 📅  DATE RANGE HELPERS
// ─────────────────────────────────────────────
function getDateRange(period) {
  const now = new Date();
  let start;

  switch (period) {
    case 'daily': {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    }
    case 'weekly': {
      const day  = now.getDay(); // 0=Sun
      const diff = (day + 6) % 7; // Mon=0
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
      break;
    }
    case 'monthly': {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
    case 'lifetime':
    default:
      return null; // no filter
  }
  return start.toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

// ─────────────────────────────────────────────
// 🔢  CORE ANALYTICS CALCULATION
// ─────────────────────────────────────────────
async function buildAnalytics(homeId, period, requestingUserId) {
  const home = await dbStore.findHomeById(homeId);
  if (!home) throw new Error('Home not found');

  const members = home.members; // array of userId strings
  const allExpenses = await dbStore.findExpensesByHome(homeId);

  // Filter by period: only approved, non-settlement
  const startDate = getDateRange(period);
  const approved = allExpenses.filter(e => {
    if (e.status !== 'approved') return false;
    if (e.category === 'Settlement') return false;
    if (startDate && e.date < startDate) return false;
    return true;
  });

  // Tally contribution per member
  const paidMap = {};
  members.forEach(m => { paidMap[m] = 0; });
  approved.forEach(e => {
    if (paidMap[e.paidBy] !== undefined) {
      paidMap[e.paidBy] += e.amount;
    }
  });

  const totalSpent     = approved.reduce((s, e) => s + e.amount, 0);
  const memberCount    = members.length || 1;
  const expectedShare  = totalSpent / memberCount;

  // Build member contribution objects (with names)
  const memberContributions = await Promise.all(members.map(async mId => {
    const u       = await dbStore.findUserById(mId);
    const paid    = Math.round((paidMap[mId] || 0) * 100) / 100;
    const share   = Math.round(expectedShare * 100) / 100;
    const balance = Math.round((paid - expectedShare) * 100) / 100;
    return {
      userId:    mId,
      userName:  u ? u.name : 'Unknown',
      paid,
      share,
      balance,          // + means they overpaid (creditor), - means they owe (debtor)
      netBalance: balance
    };
  }));

  const transfers = computeMinTransfers(memberContributions);

  // Fetch settlement payments for context (all-time, for pending/completed counts)
  const settlementPayments = await dbStore.findSettlementPaymentsByHome(homeId);
  const pending   = settlementPayments.filter(p => p.status === 'Pending').length;
  const completed = settlementPayments.filter(p => p.status === 'Verified').length;

  // Per-member pending receivables/payables from settlement payments
  const pendingPayments = settlementPayments.filter(p => p.status === 'Pending');

  // ──────────────────────────────────────────
  // 🔔 NOTIFICATION BUILDER
  // ──────────────────────────────────────────
  const notifications = await Promise.all(memberContributions.map(async mc => {
    const eps = 0.50; // treat < ₹0.50 as balanced

    if (Math.abs(mc.balance) < eps) {
      return {
        userId:   mc.userId,
        userName: mc.userName,
        type:     'balanced',
        emoji:    '✅',
        headline: `Great, ${mc.userName}!`,
        message:  'Your contribution is perfectly balanced. No payment is required.',
        paid:     mc.paid,
        share:    mc.share,
        balance:  mc.balance,
        actions:  []
      };
    }

    if (mc.balance > 0) {
      // Creditor — should receive money
      const receivables = transfers
        .filter(t => t.toId === mc.userId)
        .map(t => ({ fromId: t.fromId, fromName: t.fromName, amount: t.amount }));

      return {
        userId:    mc.userId,
        userName:  mc.userName,
        type:      'creditor',
        emoji:     '🎉',
        headline:  `Thank you, ${mc.userName}!`,
        message:   `You have contributed ₹${mc.balance.toFixed(2)} more than your fair share. Other members need to settle this amount with you.`,
        paid:      mc.paid,
        share:     mc.share,
        balance:   mc.balance,
        actions:   receivables,    // [{fromId, fromName, amount}]
        actionLabel: 'Pending Receivables'
      };
    }

    // Debtor — must pay someone
    const payables = transfers
      .filter(t => t.fromId === mc.userId)
      .map(t => ({ toId: t.toId, toName: t.toName, amount: t.amount }));

    return {
      userId:    mc.userId,
      userName:  mc.userName,
      type:      'debtor',
      emoji:     '📢',
      headline:  `Hello, ${mc.userName}!`,
      message:   `You have contributed ₹${Math.abs(mc.balance).toFixed(2)} less than your expected share. Please settle your balance.`,
      paid:      mc.paid,
      share:     mc.share,
      balance:   mc.balance,
      actions:   payables,         // [{toId, toName, amount}]
      actionLabel: 'Payment Required'
    };
  }));

  // Find the requesting user's notification
  const myNotification = notifications.find(n => n.userId === requestingUserId) || null;
  const myContrib      = memberContributions.find(m => m.userId === requestingUserId) || null;

  return {
    period,
    totalSpent:       Math.round(totalSpent * 100) / 100,
    expectedShare:    Math.round(expectedShare * 100) / 100,
    memberCount,
    memberContributions,
    transfers,
    pendingSettlements:   pending,
    completedSettlements: completed,
    // Current user's personal summary
    myContribution:  myContrib ? myContrib.paid         : 0,
    myExpectedShare: myContrib ? myContrib.share        : 0,
    myShouldReceive: myContrib && myContrib.balance > 0 ? myContrib.balance : 0,
    myShouldPay:     myContrib && myContrib.balance < 0 ? Math.abs(myContrib.balance) : 0,
    myNotification,
    notifications,
  };
}

// ─────────────────────────────────────────────
// 🚀  ROUTES
// ─────────────────────────────────────────────

// GET /api/analytics/:homeId/daily
router.get('/:homeId/daily', authMiddleware, async (req, res) => {
  try {
    const { homeId } = req.params;
    const home = await dbStore.findHomeById(homeId);
    if (!home) return res.status(404).json({ message: 'Home not found.' });
    if (!home.members.includes(req.userId))
      return res.status(403).json({ message: 'Access denied.' });

    const data = await buildAnalytics(homeId, 'daily', req.userId);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/:homeId/weekly
router.get('/:homeId/weekly', authMiddleware, async (req, res) => {
  try {
    const { homeId } = req.params;
    const home = await dbStore.findHomeById(homeId);
    if (!home) return res.status(404).json({ message: 'Home not found.' });
    if (!home.members.includes(req.userId))
      return res.status(403).json({ message: 'Access denied.' });

    const data = await buildAnalytics(homeId, 'weekly', req.userId);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/:homeId/monthly
router.get('/:homeId/monthly', authMiddleware, async (req, res) => {
  try {
    const { homeId } = req.params;
    const home = await dbStore.findHomeById(homeId);
    if (!home) return res.status(404).json({ message: 'Home not found.' });
    if (!home.members.includes(req.userId))
      return res.status(403).json({ message: 'Access denied.' });

    const data = await buildAnalytics(homeId, 'monthly', req.userId);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/:homeId/lifetime
router.get('/:homeId/lifetime', authMiddleware, async (req, res) => {
  try {
    const { homeId } = req.params;
    const home = await dbStore.findHomeById(homeId);
    if (!home) return res.status(404).json({ message: 'Home not found.' });
    if (!home.members.includes(req.userId))
      return res.status(403).json({ message: 'Access denied.' });

    const data = await buildAnalytics(homeId, 'lifetime', req.userId);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/:homeId/notifications
// Returns all member notifications + personal summary 
router.get('/:homeId/notifications', authMiddleware, async (req, res) => {
  try {
    const { homeId }  = req.params;
    const period      = req.query.period || 'lifetime';
    const home        = await dbStore.findHomeById(homeId);
    if (!home) return res.status(404).json({ message: 'Home not found.' });
    if (!home.members.includes(req.userId))
      return res.status(403).json({ message: 'Access denied.' });

    const data = await buildAnalytics(homeId, period, req.userId);

    return res.json({
      myNotification:   data.myNotification,
      allNotifications: data.notifications,
      transfers:        data.transfers,
      summary: {
        totalSpent:           data.totalSpent,
        expectedShare:        data.expectedShare,
        myContribution:       data.myContribution,
        myShouldReceive:      data.myShouldReceive,
        myShouldPay:          data.myShouldPay,
        pendingSettlements:   data.pendingSettlements,
        completedSettlements: data.completedSettlements,
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
