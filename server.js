const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const multer = require('multer');
require('dotenv').config();

const User = require('./models/User'); // Make sure this path matches your folder structure!

const app = express();

// Allow requests from your Vercel frontend
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// 1. Configure Multer to hold the image in memory temporarily
const upload = multer({ storage: multer.memoryStorage() });

// 2. The Registration Route
app.post('/api/auth/register', upload.fields([
  { name: 'profileImage', maxCount: 1 } 
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
      profile_pic: profilePicString, // Save the image
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

// 3. The Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;
    
    // Find the user in the database
    const user = await User.findOne({ mobile: mobile });
    
    if (!user) {
      return res.status(400).json({ message: 'User not found. Please register first.' });
    }

    // Check if password matches
    if (user.password !== password) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    // Success! Send the user data back to React
    res.status(200).json({
      message: 'Login successful!',
      user: user
    });

  } catch (error) {
    console.error('Login processing error:', error);
    res.status(500).json({ message: 'Internal server error during login.', error: error.message });
  }
});

// 4. START THE SERVER & DATABASE
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas (uses the environment variable you set in Render)
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fpp_database')
  .then(() => {
    console.log("MongoDB Connected Successfully!");
    
    // Start listening for React
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.log("Database connection failure:", err));