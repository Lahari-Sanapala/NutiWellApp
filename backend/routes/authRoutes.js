const express = require("express");
const router = express.Router();
const User = require("../models/User");
const UserDetails = require("../models/UserDetails");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;


const baseURL = process.env.BASE_URL || '10.33.15.69:3000';

// Sign up
router.post("/signup", async (req, res) => {
  console.log("🔹 [DEBUG] Signup request received:", req.body);
  const { fullName, email, password } = req.body;

  try {
    console.log("🔹 [DEBUG] Checking if user exists...");
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("❌ [DEBUG] Email already registered:", email);
      return res.status(400).json({ message: "Email already registered" });
    }

    console.log("🔹 [DEBUG] Hashing password...");
    const hashed = await bcrypt.hash(password, 10);

    console.log("🔹 [DEBUG] Creating new User document...");
    const newUser = new User({ fullName, email, password: hashed });

    console.log("🔹 [DEBUG] Saving User to DB...");
    await newUser.save();
    console.log("✅ [DEBUG] User saved successfully. ID:", newUser._id);

    console.log("🔹 [DEBUG] Creating UserDetails document...");
    const newDetails = new UserDetails({
      _id: newUser._id,   // 💡 Assign same _id
      userId: newUser._id, // Optional, but if you’re using it in code
      // You can also initialize default fields here
    });

    console.log("🔹 [DEBUG] Saving UserDetails to DB...");
    await newDetails.save();
    console.log("✅ [DEBUG] UserDetails saved successfully.");

    res.status(201).json({ message: "Signup successful", user: newUser });
  } catch (err) {
    console.error("❌ [DEBUG] Signup Error:", err);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const userdetails = await UserDetails.findOne({ userId: user._id });
    //console.log("all user details", userdetails);

    if (!userdetails) {
      return res.status(404).json({ message: "User details not found" });
    }

    return res.json({
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        details: userdetails,
      },
      token: "Asiya786",
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


// Get user basic info (name, email) by userId
router.get('/:userId/basic-info', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Fetch user
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch user details
    const userDetails = await UserDetails.findOne({ userId }).lean();

    // Return combined info
    res.json({
      fullName: user.fullName,
      email: user.email,
      userId: user._id,
      activityLevel: userDetails?.activityLevel || null,
      activityMultiplier: userDetails?.activityMultiplier || null,
      tdee: userDetails?.tdee || null
    });

  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// Forgot password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email not found' });

    const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("\n==================================");
      console.log("⚠️  EMAIL CREDENTIALS MISSING! ⚠️");
      console.log("Instead of sending an email, here is your reset link:");
      console.log(`http://${baseURL}/api/auth/reset-password/${resetToken}`);
      console.log("==================================\n");
      
      return res.status(200).json({ message: 'Test mode: Reset link shown in server console' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `You requested a password reset. Click here to reset: http://${baseURL}/api/auth/reset-password/${resetToken}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET: Serve the HTML page for users who clicked the email link
router.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  
  const htmlForm = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reset Password</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: -apple-system, sans-serif; background-color: #f8ede1; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .container { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 100%; max-width: 350px; }
        h2 { color: #2F4F4F; text-align: center; margin-top: 0; }
        input { width: 100%; padding: 12px; margin: 15px 0; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box; }
        button { width: 100%; padding: 14px; background: #2F4F4F; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Reset Password</h2>
        <form action="/api/auth/reset-password/${token}" method="POST">
          <input type="password" name="newPassword" placeholder="Enter new password" required minlength="6">
          <button type="submit">Update Password</button>
        </form>
      </div>
    </body>
    </html>
  `;
  res.send(htmlForm);
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // After success, show a nice success page or redirect to app
    res.status(200).send("<html><body style='text-align:center; padding: 50px; font-family:sans-serif;'><h2>Password reset successfully!</h2><p>You can now return to the app and log in.</p></body></html>");
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(400).send("<html><body style='text-align:center; padding: 50px; font-family:sans-serif; color:red;'><h2>Error!</h2><p>Invalid or expired link. Please request a new one.</p></body></html>");
  }
});

module.exports = router; // Make sure this is at the end