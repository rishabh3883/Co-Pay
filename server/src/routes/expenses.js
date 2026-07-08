const express = require('express');
const { dbStore } = require('../dbStore');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all expenses for a home
router.get('/:homeId', authMiddleware, async (req, res) => {
  try {
    const { homeId } = req.params;
    const home = await dbStore.findHomeById(homeId);
    if (!home) return res.status(404).json({ message: 'Home workspace not found.' });

    if (!home.members.includes(req.userId)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const list = await dbStore.findExpensesByHome(homeId);
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Add new shared expense
router.post('/:homeId', authMiddleware, async (req, res) => {
  try {
    const { homeId } = req.params;
    const { title, category, amount, date, billImage, notes, needsApproval } = req.body;

    if (!title || !category || !amount || !date) {
      return res.status(400).json({ message: 'Missing fields: title, category, amount, date.' });
    }

    const home = await dbStore.findHomeById(homeId);
    if (!home) return res.status(404).json({ message: 'Home workspace not found.' });

    if (!home.members.includes(req.userId)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const status = needsApproval ? 'pending' : 'approved';
    const approvals = needsApproval ? [req.userId] : [];

    const expense = await dbStore.createExpense({
      homeId,
      title,
      category,
      amount: Number(amount),
      paidBy: req.userId,
      date,
      billImage,
      notes,
      status,
      approvals
    });

    const expenses = await dbStore.findExpensesByHome(homeId);
    const approvedExpenses = expenses.filter(e => e.status === 'approved');
    const totalSpent = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);

    let budgetAlert = false;
    if (home.monthlyBudget > 0 && totalSpent > home.monthlyBudget) {
      budgetAlert = true;
    }

    const creator = await dbStore.findUserById(req.userId);
    if (creator) {
      const badges = [...creator.badges];
      if (!badges.includes('Responsible Roommate')) {
        badges.push('Responsible Roommate');
        await dbStore.updateUser(req.userId, { badges });
      }
    }

    return res.status(201).json({ expense, budgetAlert });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Approve a pending expense
router.post('/:expenseId/approve', authMiddleware, async (req, res) => {
  try {
    const { expenseId } = req.params;
    const userId = req.userId;

    const expense = await dbStore.findExpenseById(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found.' });

    const home = await dbStore.findHomeById(expense.homeId);
    if (!home || !home.members.includes(userId)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (expense.status === 'approved') {
      return res.status(400).json({ message: 'Expense is already approved.' });
    }

    if (expense.approvals.includes(userId)) {
      return res.status(400).json({ message: 'You have already approved this expense.' });
    }

    const updatedApprovals = [...expense.approvals, userId];
    const approveThreshold = Math.max(1, Math.ceil(home.members.length / 2));
    const status = updatedApprovals.length >= approveThreshold ? 'approved' : 'pending';

    const updatedExpense = await dbStore.updateExpense(expenseId, {
      approvals: updatedApprovals,
      status
    });

    return res.json(updatedExpense);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Calculate Settlements (Who owes Whom)
router.get('/:homeId/settlement', authMiddleware, async (req, res) => {
  try {
    const { homeId } = req.params;
    const home = await dbStore.findHomeById(homeId);
    if (!home) return res.status(404).json({ message: 'Home workspace not found.' });

    if (!home.members.includes(req.userId)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const members = home.members;
    const expenses = await dbStore.findExpensesByHome(homeId);
    const approved = expenses.filter(e => e.status === 'approved' && e.category !== 'Settlement');

    const paidMap = {};
    members.forEach(m => {
      paidMap[m] = 0;
    });

    approved.forEach(e => {
      if (paidMap[e.paidBy] !== undefined) {
        paidMap[e.paidBy] += e.amount;
      }
    });

    const totalSpent = approved.reduce((sum, e) => sum + e.amount, 0);
    const share = totalSpent / (members.length || 1);

    const balances = members.map(mId => ({
      userId: mId,
      balance: paidMap[mId] - share
    }));

    const debtors = balances.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);
    const creditors = balances.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);

    const transfers = [];
    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];

      const oweAmount = -debtor.balance;
      const creditAmount = creditor.balance;

      const settledAmount = Math.min(oweAmount, creditAmount);
      
      transfers.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(settledAmount * 100) / 100
      });

      debtor.balance += settledAmount;
      creditor.balance -= settledAmount;

      if (Math.abs(debtor.balance) < 0.01) dIdx++;
      if (Math.abs(creditor.balance) < 0.01) cIdx++;
    }

    const populatedTransfers = [];
    for (const t of transfers) {
      const fromUser = await dbStore.findUserById(t.from);
      const toUser = await dbStore.findUserById(t.to);
      populatedTransfers.push({
        fromId: t.from,
        fromName: fromUser ? fromUser.name : 'Unknown Roommate',
        toId: t.to,
        toName: toUser ? toUser.name : 'Unknown Roommate',
        amount: t.amount
      });
    }

    const memberContributions = await Promise.all(members.map(async (mId) => {
      const user = await dbStore.findUserById(mId);
      return {
        userId: mId,
        userName: user ? user.name : 'Unknown Roommate',
        paid: Math.round(paidMap[mId] * 100) / 100,
        share: Math.round(share * 100) / 100,
        netBalance: Math.round((paidMap[mId] - share) * 100) / 100
      };
    }));

    return res.json({
      totalSpent: Math.round(totalSpent * 100) / 100,
      share: Math.round(share * 100) / 100,
      memberContributions,
      transfers: populatedTransfers
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Settle direct transaction
router.post('/:homeId/settle-all', authMiddleware, async (req, res) => {
  try {
    const { homeId } = req.params;
    const { fromId, toId, amount } = req.body;
    if (!fromId || !toId || !amount) {
      return res.status(400).json({ message: 'Missing fields: fromId, toId, amount.' });
    }

    const home = await dbStore.findHomeById(homeId);
    if (!home) return res.status(404).json({ message: 'Home workspace not found.' });

    const fromUser = await dbStore.findUserById(fromId);
    const toUser = await dbStore.findUserById(toId);

    const settlementExpense = await dbStore.createExpense({
      homeId,
      title: `Settled: ${fromUser?.name || 'Debtor'} paid ${toUser?.name || 'Creditor'}`,
      category: 'Settlement',
      amount: Number(amount),
      paidBy: fromId,
      date: new Date().toISOString().split('T')[0],
      notes: `Direct settlement between members.`,
      status: 'approved',
      approvals: []
    });

    if (fromUser) {
      const badges = [...fromUser.badges];
      if (!badges.includes('Early Payer')) {
        badges.push('Early Payer');
      }
      await dbStore.updateUser(fromId, { badges });
    }

    return res.status(201).json(settlementExpense);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Add recurring expense
router.post('/:homeId/recurring', authMiddleware, async (req, res) => {
  try {
    const { homeId } = req.params;
    const { title, category, amount } = req.body;

    const home = await dbStore.findHomeById(homeId);
    if (!home) return res.status(404).json({ message: 'Home workspace not found.' });

    const membersList = home.members || [];
    const memberCount = membersList.length || 1;
    const shareAmount = Math.round((Number(amount) / memberCount) * 100) / 100;

    const createdShared = [];
    for (const memberId of membersList) {
      // 1. Log shared expense share for each member
      const exp = await dbStore.createExpense({
        homeId,
        title: `Recurring: ${title} (${memberId === home.adminId ? 'Admin' : 'Roommate'}'s Share)`,
        category,
        amount: shareAmount,
        paidBy: memberId,
        date: new Date().toISOString().split('T')[0],
        notes: `Automatically divided equal share of monthly recurring bill.`,
        status: 'approved',
        approvals: []
      });
      createdShared.push(exp);

      // 2. Auto-sync to user's personal tracker
      const memberUser = await dbStore.findUserById(memberId);
      if (memberUser) {
        const pExpense = {
          id: Math.random().toString(36).substring(2, 9),
          title: `[Shared] Recurring: ${title} (Your Share)`,
          category,
          amount: shareAmount,
          date: new Date().toISOString().split('T')[0],
          notes: 'Synced from shared ledger.'
        };
        const personalExpenses = [...(memberUser.personalExpenses || []), pExpense];
        await dbStore.updateUser(memberId, { personalExpenses });
      }
    }

    return res.status(201).json(createdShared[0] || {});
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Update an expense
router.put('/:expenseId', authMiddleware, async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { title, category, amount, date, notes } = req.body;
    const userId = req.userId;

    const expense = await dbStore.findExpenseById(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found.' });

    const home = await dbStore.findHomeById(expense.homeId);
    if (!home) return res.status(404).json({ message: 'Home workspace not found.' });

    // Access check: only Admin of the workspace OR the owner who paid the bill can update
    const isWorkspaceAdmin = home.adminId === userId;
    const isBillOwner = expense.paidBy === userId;

    if (!isWorkspaceAdmin && !isBillOwner) {
      return res.status(403).json({ message: 'Permission denied. Only the workspace Admin or the creator of this bill can update it.' });
    }

    const updatedExpense = await dbStore.updateExpense(expenseId, {
      title,
      category,
      amount: Number(amount),
      date,
      notes
    });

    return res.json(updatedExpense);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Delete an expense
router.delete('/:expenseId', authMiddleware, async (req, res) => {
  try {
    const { expenseId } = req.params;
    const userId = req.userId;
    const expense = await dbStore.findExpenseById(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found.' });

    const home = await dbStore.findHomeById(expense.homeId);
    if (!home) return res.status(404).json({ message: 'Home workspace not found.' });

    // Access check: only Admin of the workspace OR the owner who paid the bill can delete
    const isWorkspaceAdmin = home.adminId === userId;
    const isBillOwner = expense.paidBy === userId;

    if (!isWorkspaceAdmin && !isBillOwner) {
      return res.status(403).json({ message: 'Permission denied. Only the workspace Admin or the creator of this bill can delete it.' });
    }

    await dbStore.deleteExpense(expenseId);
    return res.json({ message: 'Expense deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
