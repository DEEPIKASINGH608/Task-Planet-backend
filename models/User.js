const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
    default: "" // Stores Base64 string or URL
  },
  bio: {
    type: String,
    default: "Welcome to my planet! 🚀",
    max: 150
  },
  followers: {
    type: Array,
    default: [] // Stores list of usernames/IDs
  },
  following: {
    type: Array,
    default: [] // Stores list of usernames/IDs
  },
  earnings: {
    type: Number,
    default: 0
  },
  xp: {
    type: Number,
    default: 0
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);


