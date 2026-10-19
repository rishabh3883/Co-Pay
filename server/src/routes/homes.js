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
    const populated = await Promise.all(list.map(async h => {
      const memberIds = Array.isArray(h.members) ? h.members : [];
      const membersDetail = [];
      for (const mId of memberIds) {
        const u = await dbStore.findUserById(mId);
        if (u) {
          membersDetail.push({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            upiId: u.upiId || '',
            streaks: u.streaks || 1,
            badges: u.id === h.adminId ? ['Creator'] : (u.badges || ['Roommate'])
          });
        }
      }
      return { ...h, members: membersDetail };
    }));
    return res.json(populated);
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

    const memberIds = Array.isArray(home.members) ? home.members : [];
    let updatedMembers = [...memberIds];
    if (!updatedMembers.includes(req.userId)) {
      updatedMembers.push(req.userId);
    }

    const updated = await dbStore.updateHome(home.id, { members: updatedMembers });

    // Populate all members
    const membersDetail = [];
    for (const mId of updatedMembers) {
      const u = await dbStore.findUserById(mId);
      if (u) {
        membersDetail.push({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || '',
          upiId: u.upiId || '',
          streaks: u.streaks || 1,
          badges: u.id === home.adminId ? ['Creator'] : (u.badges || ['Roommate'])
        });
      }
    }

    return res.json({
      ...(updated || home),
      members: membersDetail
    });
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

    const memberIds = Array.isArray(home.members) ? home.members : [];
    const isMember = memberIds.some(m => {
      if (!m) return false;
      if (typeof m === 'string') return m === req.userId;
      return m.id === req.userId || m._id === req.userId;
    });

    if (home.adminId !== req.userId && !isMember) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Populate all members including admin
    const allMemberIds = Array.isArray(home.members) ? [...home.members] : [];
    if (home.adminId && !allMemberIds.includes(home.adminId)) {
      allMemberIds.unshift(home.adminId);
    }

    const membersDetail = [];
    for (const memberId of allMemberIds) {
      const cleanId = (typeof memberId === 'object' && memberId !== null) ? (memberId.id || memberId._id) : memberId;
      const user = await dbStore.findUserById(cleanId);
      if (user) {
        membersDetail.push({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          whatsapp: user.phone || '',
          upiId: user.upiId || '',
          streaks: user.streaks || 1,
          badges: user.id === home.adminId ? ['Creator'] : (user.badges || ['Roommate'])
        });
      } else if (typeof memberId === 'object' && memberId !== null) {
        membersDetail.push(memberId);
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

// Add member to home
router.post('/:homeId/members', authMiddleware, async (req, res) => {
  try {
    const { homeId } = req.params;
    const { name, email, phone, upiId } = req.body;
    const home = await dbStore.findHomeById(homeId);
    if (!home) return res.status(404).json({ message: 'Home not found' });

    let memberId = 'usr_' + Math.random().toString(36).substring(2, 9);
    if (email) {
      const existingUser = await dbStore.findUserByEmail(email);
      if (existingUser) memberId = existingUser.id;
    }
    const currentMembers = Array.isArray(home.members) ? home.members : [];
    if (!currentMembers.includes(memberId)) {
      currentMembers.push(memberId);
      await dbStore.updateHome(homeId, { members: currentMembers });
    }
    return res.json({ success: true, memberId });
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
