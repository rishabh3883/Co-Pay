const express = require('express');
const bcrypt = require('bcryptjs');
const { dbStore } = require('../dbStore');
const { generateToken, authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing fields: name, email, password.' });
    }

    const existing = await dbStore.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await dbStore.createUser({
      name,
      email,
      passwordHash,
      personalBudget: 10000 // default 10,000 personal budget
    });

    const token = generateToken(user.id);
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        personalBudget: user.personalBudget,
        streaks: user.streaks,
        badges: user.badges
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing fields: email, password.' });
    }

    const user = await dbStore.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Account not found! This email is not registered yet. Please register first.' });
    }

    let isMatch = false;
    if (user.passwordHash && user.passwordHash.startsWith('$2')) {
      try {
        isMatch = await bcrypt.compare(password, user.passwordHash);
      } catch (_) {
        isMatch = false;
      }
    } else {
      isMatch = user.passwordHash === password;
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password! Please check your credentials.' });
    }

    // Increment streaks on login
    const updatedStreaks = (user.streaks || 0) + 1;
    await dbStore.updateUser(user.id, { streaks: updatedStreaks });

    const token = generateToken(user.id);
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        personalBudget: user.personalBudget,
        streaks: updatedStreaks,
        badges: user.badges
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Get profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await dbStore.findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      personalBudget: user.personalBudget,
      phone: user.phone || '',
      upiId: user.upiId || '',
      personalExpenses: user.personalExpenses || [],
      streaks: user.streaks,
      badges: user.badges
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Update profile properties (phone, upiId)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { phone, upiId } = req.body;
    const user = await dbStore.updateUser(req.userId, { phone, upiId });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json({
      phone: user.phone || '',
      upiId: user.upiId || ''
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Update personal budget
router.put('/budget', authMiddleware, async (req, res) => {
  try {
    const { personalBudget } = req.body;
    if (typeof personalBudget !== 'number') {
      return res.status(400).json({ message: 'Invalid personalBudget.' });
    }

    const user = await dbStore.updateUser(req.userId, { personalBudget });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    return res.json({ personalBudget: user.personalBudget });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Add personal expense
router.post('/personal-expense', authMiddleware, async (req, res) => {
  try {
    const { title, category, amount, date, notes } = req.body;
    if (!title || !category || !amount || !date) {
      return res.status(400).json({ message: 'Missing required expense fields.' });
    }

    const user = await dbStore.findUserById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const newExpense = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      category,
      amount: Number(amount),
      date,
      notes
    };

    const personalExpenses = [...(user.personalExpenses || []), newExpense];
    
    // Check and award Saver/Budget Master badges
    const badges = [...(user.badges || [])];
    const totalSpent = personalExpenses.reduce((sum, e) => sum + e.amount, 0);

    await dbStore.updateUser(req.userId, { personalExpenses });
    return res.status(201).json(newExpense);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Delete personal expense
router.delete('/personal-expense/:expenseId', authMiddleware, async (req, res) => {
  try {
    const { expenseId } = req.params;
    const user = await dbStore.findUserById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const personalExpenses = (user.personalExpenses || []).filter(e => e.id !== expenseId);
    await dbStore.updateUser(req.userId, { personalExpenses });
    return res.json({ message: 'Expense deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
