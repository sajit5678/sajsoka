// server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('./User'); // Adjust the path based on your project structure

// User Schema

// const userSchema = new mongoose.Schema({
    // email: {
        // type: String,
        // required: true,
        // unique: true,
    // },
    // password: {
        // type: String,
        // required: true,
    // },
    // createdAt: {
        // type: Date,
        // default: Date.now,
    // },
    // isAdmin: {
        // type: Boolean,
        // default: false, // Default value for new documents
    // },
// });


// const User = mongoose.model('User', userSchema);

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
	console.error('Sign up:', email);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
		console.log('User already exist');
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword
    });

    await user.save();
	console.log('User created successfully');
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
	// console.error('Login up:', email);

	

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
	
	// console.log('Start');
	// debugger; // Execution will pause here
	// console.log('End');
	console.log('User from login:', user);
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
	
	req.session.user = { email };
    // res.redirect('/profile');

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  // Destroy the session and redirect to the login page
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Failed to log out' });
    }

    res.clearCookie('connect.sid'); // Clear the session cookie
    res.redirect('/'); // Redirect to login page or home
  });
});

module.exports = router;