const express = require('express');
const { dbStore } = require('../dbStore');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Create home workspace
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, monthlyBudget } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Home name is required.' });
    }

    const home = await dbStore.createHome(name, req.userId, Number(monthlyBudget || 0));
    return res.status(201).json(home);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Get user's homes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const list = await dbStore.findUserHomes(req.userId);
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Join home workspace by invite code
router.post('/join', authMiddleware, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) {
      return res.status(400).json({ message: 'Invite code is required.' });
    }

    const home = await dbStore.findHomeByInviteCode(inviteCode);
    if (!home) {
      return res.status(404).json({ message: 'Invalid invite code.' });
    }

    if (home.members.includes(req.userId)) {
      return res.status(400).json({ message: 'You are already a member of this home.' });
    }

    const updatedMembers = [...home.members, req.userId];
    const updated = await dbStore.updateHome(home.id, { members: updatedMembers });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Get home details (members, config, etc.)
router.get('/:homeId', authMiddleware, async (req, res) => {
  try {
    const { homeId } = req.params;
    const home = await dbStore.findHomeById(homeId);
    if (!home) {
      return res.status(404).json({ message: 'Home workspace not found.' });
    }

    if (!home.members.includes(req.userId)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Populate members
    const membersDetail = [];
    for (const memberId of home.members) {
      const user = await dbStore.findUserById(memberId);
      if (user) {
        membersDetail.push({
          id: user.id,
          name: user.name,
          email: user.email,
          streaks: user.streaks,
          badges: user.badges
        });
      }
    }

    return res.json({
      ...home,
      members: membersDetail
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Update home budget
router.put('/:homeId/budget', authMiddleware, async (req, res) => {
  try {
    const { homeId } = req.params;
    const { monthlyBudget } = req.body;

    const home = await dbStore.findHomeById(homeId);
    if (!home) return res.status(404).json({ message: 'Home not found.' });

    // Check if the requester is the admin
    if (home.adminId !== req.userId) {
      return res.status(403).json({ message: 'Only workspace admin can change the budget.' });
    }

    const updated = await dbStore.updateHome(homeId, { monthlyBudget: Number(monthlyBudget || 0) });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
