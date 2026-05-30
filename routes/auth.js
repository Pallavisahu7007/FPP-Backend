const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Handle New Member Registration
router.post('/register', async (req, res) => {
  try {
    const { name, mobile, referred_by, state, district, assembly } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) return res.status(400).json({ message: "Mobile number already registered." });

    // 2. Generate a unique referral ID for this new user
    const newReferralId = 'FPP' + Math.floor(100000 + Math.random() * 900000);

    // 3. Save the user
    const newUser = new User({
      name,
      mobile,
      referral_id: newReferralId,
      referred_by: referred_by || null,
      state,
      district,
      assembly
    });

    await newUser.save();

    res.status(201).json({ message: "Registration successful!", user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;