import express from 'express';
import Group from '../models/Group.js';
import prisma from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Local helper moved to top to avoid hoisting issues
const calculateAge = (dob) => {
  if (!dob) return 25;
  const diff = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

// Create a group
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const userId = parseInt(req.user.userId);
    const { name, handle, description } = req.body;

    if (!name || !handle) {
      return res.status(400).json({ success: false, message: 'Name and Handle are required' });
    }

    const existingGroup = await Group.findOne({ handle: handle.toLowerCase() });
    if (existingGroup) {
      return res.status(400).json({ success: false, message: 'Group handle already taken' });
    }

    const group = new Group({
      name,
      handle: handle.toLowerCase(),
      description,
      createdBy: userId,
      members: [userId]
    });

    await group.save();
    res.status(201).json({ success: true, group });
  } catch (error) { next(error); }
});

// Search and list groups (trending on top)
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { q } = req.query;
    let query = {};
    
    if (q) {
      query = { 
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { handle: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ]
      };
    }

    const groups = await Group.find(query)
      .sort({ memberCount: -1 })
      .limit(20);

    res.json({ success: true, groups });
  } catch (error) { next(error); }
});

// Get group details and members
router.get('/:handle', verifyToken, async (req, res, next) => {
  try {
    const { handle } = req.params;
    const group = await Group.findOne({ handle: handle.toLowerCase() });
    
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Fetch member profiles from Postgres
    const users = await prisma.user.findMany({
      where: { id: { in: group.members }, profile: { isNot: null } },
      include: { profile: true }
    });

    const members = users.map(u => ({
      id: u.id.toString(),
      name: u.profile.preferredName || u.fullName.split(' ')[0],
      photos: u.profile.photos,
      city: u.profile.city || u.profile.location,
      age: calculateAge(u.profile.dob)
    }));

    res.json({ success: true, group, members });
  } catch (error) { next(error); }
});

// Join/Leave group
router.post('/:handle/join', verifyToken, async (req, res, next) => {
  try {
    const userId = parseInt(req.user.userId);
    const { handle } = req.params;
    
    const group = await Group.findOne({ handle: handle.toLowerCase() });
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const isMember = group.members.includes(userId);
    
    if (isMember) {
      // Leave
      group.members = group.members.filter(id => id !== userId);
    } else {
      // Join
      group.members.push(userId);
    }

    await group.save();
    res.json({ success: true, isMember: !isMember, group });
  } catch (error) { next(error); }
});

// Local helper moved to top


export default router;
