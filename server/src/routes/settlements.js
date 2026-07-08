const express = require('express');
const { dbStore } = require('../dbStore');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get settlement payments list for a home
router.get('/:homeId', authMiddleware, async (req, res) => {
  try {
    const { homeId } = req.params;
    const home = await dbStore.findHomeById(homeId);
    if (!home) return res.status(404).json({ message: 'Home workspace not found.' });

    if (!home.members.includes(req.userId)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const list = await dbStore.findSettlementPaymentsByHome(homeId);
    
    // Populate sender and receiver names
    const populated = await Promise.all(list.map(async (p) => {
      const sender = await dbStore.findUserById(p.senderId);
      const receiver = await dbStore.findUserById(p.receiverId);
      return {
        ...p,
        senderName: sender ? sender.name : 'Unknown Roommate',
        receiverName: receiver ? receiver.name : 'Unknown Roommate'
      };
    }));

    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Post a pending settlement payment
router.post('/:homeId/pay', authMiddleware, async (req, res) => {
  try {
    const { homeId } = req.params;
    const { receiverId, amount, refId } = req.body;

    if (!receiverId || !amount) {
      return res.status(400).json({ message: 'Missing fields: receiverId, amount.' });
    }

    const home = await dbStore.findHomeById(homeId);
    if (!home) return res.status(404).json({ message: 'Home workspace not found.' });

    if (!home.members.includes(req.userId) || !home.members.includes(receiverId)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const payment = await dbStore.createSettlementPayment({
      homeId,
      senderId: req.userId,
      receiverId,
      amount: Number(amount),
      date: new Date().toISOString(),
      refId: refId || '',
      status: 'Pending'
    });

    return res.status(201).json(payment);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Verify a settlement payment (Receiver confirms they received the funds)
router.post('/:paymentId/verify', authMiddleware, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await dbStore.findSettlementPaymentById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Settlement payment record not found.' });

    // Only the recipient/receiver can verify the payment
    if (payment.receiverId !== req.userId) {
      return res.status(403).json({ message: 'Only the recipient can verify this payment.' });
    }

    if (payment.status === 'Verified') {
      return res.status(400).json({ message: 'This payment is already verified.' });
    }

    // Update status to Verified
    const updatedPayment = await dbStore.updateSettlementPayment(paymentId, { status: 'Verified' });

    // Automatically create a shared expense of category 'Settlement' to resolve roommate ledger balances
    const sender = await dbStore.findUserById(payment.senderId);
    const receiver = await dbStore.findUserById(payment.receiverId);

    await dbStore.createExpense({
      homeId: payment.homeId,
      title: `UPI Settlement: ${sender?.name || 'Debtor'} paid ${receiver?.name || 'Creditor'}`,
      category: 'Settlement',
      amount: payment.amount,
      paidBy: payment.senderId,
      date: new Date().toISOString().split('T')[0],
      notes: `Verified Settlement via UPI (Ref: ${payment.refId || 'N/A'}).`,
      status: 'approved',
      approvals: []
    });

    return res.json(updatedPayment);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
