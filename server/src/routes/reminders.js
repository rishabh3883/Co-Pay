const express = require('express');
const { dbStore } = require('../dbStore');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get reminder logs (and trigger simulated scheduled checks)
router.get('/:homeId', authMiddleware, async (req, res) => {
  try {
    const { homeId } = req.params;
    const home = await dbStore.findHomeById(homeId);
    if (!home) return res.status(404).json({ message: 'Home workspace not found.' });

    // --- SIMULATED AUTO-SCHEDULER ROUTINE ---
    // We simulate cron checks based on the monthly billing cycle.
    // Assume monthly bills are due on the 10th of the current month.
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const todayDate = now.getDate();

    const dueDate = new Date(currentYear, currentMonth, 10);
    const dayDiff = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Get current settlement balances to see who owes money
    const expenses = await dbStore.findExpensesByHome(homeId);
    const approved = expenses.filter(e => e.status === 'approved' && e.category !== 'Settlement');

    // Calculate paid map and shared division
    const members = home.members;
    const paidMap = {};
    members.forEach(m => { paidMap[m] = 0; });
    approved.forEach(e => {
      if (paidMap[e.paidBy] !== undefined) {
        paidMap[e.paidBy] += e.amount;
      }
    });

    const totalSpent = approved.reduce((sum, e) => sum + e.amount, 0);
    const share = totalSpent / (members.length || 1);

    // Fetch existing reminders to prevent double-inserting the same scheduled checks
    const existingReminders = await dbStore.findRemindersByHome(homeId);

    // Scan each member
    for (const mId of members) {
      const balance = paidMap[mId] - share;
      if (balance < 0) { // Member owes money
        const debtAmount = Math.abs(Math.round(balance));
        const user = await dbStore.findUserById(mId);
        if (!user) continue;

        // Determine what scheduled reminder fits the current date
        let scheduledType = null;
        if (todayDate === 7) {
          scheduledType = 'Scheduled (3 Days Before Due)';
        } else if (todayDate === 10) {
          scheduledType = 'Scheduled (Due Date)';
        } else if (todayDate > 10 && (todayDate - 10) % 2 === 0) {
          scheduledType = `Scheduled (${todayDate - 10} Days Overdue)`;
        }

        if (scheduledType) {
          // Check if this scheduled log is already registered
          const isLogged = existingReminders.some(r => 
            r.recipient === user.name && 
            r.deliveryStatus === scheduledType &&
            new Date(r.dateTime).getMonth() === currentMonth &&
            new Date(r.dateTime).getFullYear() === currentYear
          );

          if (!isLogged) {
            await dbStore.createReminder({
              homeId,
              recipient: user.name,
              phone: user.phone || 'Unknown',
              expenseTitle: 'Monthly Shared Split Dues',
              amount: debtAmount,
              deliveryStatus: scheduledType,
              dateTime: now.toISOString()
            });
          }
        }
      }
    }

    // Return the updated log list
    const list = await dbStore.findRemindersByHome(homeId);
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Trigger a manual reminder (returns wa.me link & logs)
router.post('/:homeId/send', authMiddleware, async (req, res) => {
  try {
    const { homeId } = req.params;
    const { memberId, amount, title, dueDate } = req.body;

    if (!memberId || !amount || !title) {
      return res.status(400).json({ message: 'Missing fields: memberId, amount, title.' });
    }

    const recipientUser = await dbStore.findUserById(memberId);
    if (!recipientUser) return res.status(404).json({ message: 'Recipient user not found.' });

    const phone = recipientUser.phone || '';
    const formattedPhone = phone.replace(/[^0-9]/g, ''); // strip non-numeric

    const rawMessage = `Hi ${recipientUser.name} 👋\nYour contribution of *₹${amount}* for *${title}* is still pending.\nDue Date: *${dueDate || '10th of this month'}*\nPlease complete your payment to avoid delays.\nThank you! 😊`;
    
    // Log the reminder
    const reminder = await dbStore.createReminder({
      homeId,
      recipient: recipientUser.name,
      phone: phone || 'Not Provided',
      expenseTitle: title,
      amount: Number(amount),
      deliveryStatus: 'Sent',
      dateTime: new Date().toISOString()
    });

    const encodedText = encodeURIComponent(rawMessage);
    const whatsappUrl = formattedPhone 
      ? `https://wa.me/${formattedPhone}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`; // fallback without specific number

    return res.status(201).json({
      message: 'Reminder logged successfully.',
      reminder,
      whatsappUrl
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
