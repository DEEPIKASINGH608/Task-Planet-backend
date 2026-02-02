const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: String, required: true },
  handle: String, // e.g., @josephverm
  content: { type: String },
  imageUrl: { type: String },
  likes: { type: Array, default: [] }, // Array of User IDs [cite: 23]
  comments: [{
    username: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);

