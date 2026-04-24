// server/routes/memberRoutes.js - SIMPLIFIED
const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const memberController = require('../controllers/memberController');

router.get('/history/:id', memberController.getMemberHistoryById);

// GET all members
router.get('/', memberController.getAllMembers);

// CREATE new member
router.post('/', memberController.createMember);

// UPDATE member
router.put('/:id', memberController.updateMember);

// DELETE member
router.delete('/:id', memberController.deleteMember);

module.exports = router;