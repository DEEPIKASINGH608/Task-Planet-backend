require('dotenv').config();

const mongoURI = process.env.MONGO_URI;
// Use mongoURI in your mongoose.connect() function


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// --- 1. CONFIGURATION & MIDDLEWARE ---
// FIX: Increased limits to 50mb to prevent the "Image too large" error
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// --- 2. DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'socialplanet_secret_key';

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected: SocialPlanet Database"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// --- 3. DATABASE MODELS ---

const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}));

const Post = mongoose.model('Post', new mongoose.Schema({
  username: String,
  content: String,
  imageUrl: String,
  likes: { type: [String], default: [] },
  comments: [{ 
    username: String, 
    text: String, 
    createdAt: { type: Date, default: Date.now } 
  }],
  createdAt: { type: Date, default: Date.now }
}));

// --- 4. AUTHENTICATION ROUTES ---

// SIGNUP with Auto-Login
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashedPassword });

    const token = jwt.sign({ id: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, username: newUser.username });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// LOGIN via Email
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, username: user.username });
    } else {
      res.status(400).json({ error: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// --- 5. SOCIAL FEED ROUTES ---

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch posts" });
  }
});

// Create Post (Handles Large Base64 Images)
app.post('/api/posts', async (req, res) => {
  try {
    const post = await Post.create(req.body);
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: "Failed to create post. Data too large." });
  }
});


// profile update
app.put('/api/posts/profile/update/:username', async (req, res) => {
  try {
    const { bio, profilePic } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.username },
      { $set: { bio, profilePic } },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Add this to handle the 404 errors shown in your console
app.put('/api/users/update/:username', async (req, res) => {
  try {
    const { bio, profilePic } = req.body;
    
    // This finds the user by the name in the URL (e.g., 'deepika') and updates them
    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.username },
      { $set: { bio, profilePic } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Like/Unlike Toggle
app.put('/api/posts/like/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const { username } = req.body;
    post.likes.includes(username) ? post.likes = post.likes.filter(u => u !== username) : post.likes.push(username);
    await post.save();
    res.json(post);
  } catch (err) { res.status(500).json({ error: "Like failed" }); }
});

// Add Comment
app.put('/api/posts/comment/:id', async (req, res) => {
  try {
    const { username, text } = req.body;
    const post = await Post.findById(req.params.id);
    post.comments.push({ username, text });
    await post.save();
    res.json(post);
  } catch (err) { res.status(500).json({ error: "Comment failed" }); }
});

// Delete Post (For the Three-Dot Menu)
app.delete('/api/posts/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

// --- 6. SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 SocialPlanet Backend live on port ${PORT}`));

