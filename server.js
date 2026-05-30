const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Only declare this once!
const multer = require('multer');
require('dotenv').config();

const User = require('./models/User'); 

const app = express();

// Allow requests from all domains
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// 1. Configure Multer to hold the image in memory temporarily
const upload = multer({ storage: multer.memoryStorage() });

// 2. The Registration Route
app.post('/api/auth/register', upload.fields([
  { name: 'profileImage', maxCount: 1 } // Removed kycDocument since we don't need it
]), async (req, res) => {
  try {
    // Check if the mobile number is already taken
    const existingUser = await User.findOne({ mobile: req.body.mobile });
    if (existingUser) {
      return res.status(400).json({ message: 'Mobile number already registered!' });
    }

    // Generate a clean, random Referral ID
    const generatedReferralId = 'FPP' + Math.floor(100000 + Math.random() * 900000);

    // Convert the Multer image file into a Base64 string so MongoDB can save it
    let profilePicString = '';
    if (req.files && req.files['profileImage']) {
        const file = req.files['profileImage'][0];
        profilePicString = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    // Save the User profile into MongoDB
    const newUser = new User({
      ...req.body,
      referral_id: generatedReferralId,
      used_referral: req.body.referralId || '', // Capture who referred them
      profile_pic: profilePicString, // Save the image!
      wallet_balance: 0 
    });

    await newUser.save();

    res.status(201).json({
      message: 'Registration data saved successfully!',
      user: newUser
    });

  } catch (error) {
    console.error('Registration processing error:', error);
    res.status(500).json({ message: 'Internal server error processing registration.', error: error.message });
  }
});

// ... Keep your existing login and mongoose connection logic below ...

// 4. START THE SERVER & DATABASE (This is what keeps it awake!)
const PORT = process.env.PORT || 5000;

// Connect to your local database
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fpp_database')
  .then(() => {
    console.log("MongoDB Connected Successfully!");
    
    // Start listening for React
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.log("Database connection failure:", err));
  
  
  
