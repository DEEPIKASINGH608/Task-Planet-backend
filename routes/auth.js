const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// SIGNUP ROUTE
router.post('/signup', async (req, res) => {
    try {
        // Normalize: trim and lowercase
        const email = req.body.email.trim().toLowerCase();
        const { name, password } = req.body;

        // 1. Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already exists" });
        }

        // 2. Hash and Save
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
    try {
        const email = req.body.email.trim().toLowerCase();
        const { password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({ token: "your_jwt_token_here", user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;



