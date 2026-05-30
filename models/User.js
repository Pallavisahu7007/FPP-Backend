const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Account
  email: { type: String, required: true },
  password: { type: String, required: true }, // Note: We will encrypt this later!
  mobile: { type: String, required: true, unique: true },
  
  // Profile
  name: { type: String, required: true },
  fatherName: { type: String },
  dob: { type: String },
  gender: { type: String },
  address: { type: String },
  pincode: { type: String },
  
  // Area
  country: { type: String, default: 'India' },
  state: { type: String },
  district: { type: String },
  assembly: { type: String },
  
  // Subscription & KYC
  subscription: { type: String },
  aadhar: { type: String },
  pan: { type: String },
  
  // System Fields
  referral_id: { type: String, unique: true },
  referred_by: { type: String, default: null },
  role: { type: String, default: 'Supporter' },
  wallet_balance: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);