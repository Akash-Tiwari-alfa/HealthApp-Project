console.log("--- INITIALIZING SERVER (VERSION 3 DEBUG) ---");
// --- END DEBUG CODE ---

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json()); 
app.use(cors()); // This line allows Cross-Origin Requests

// --- 1. Connect to MongoDB ---
// !! REMEMBER TO PUT YOUR MONGO_URI STRING HERE !!
// !! Use your SIMPLE password (no special characters) !!
const MONGO_URI = "mongodb+srv://healthappuser:at123456at@healthcluster.780dstp.mongodb.net/?appName=HealthCluster";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas!"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// --- 2. Health Check Endpoint (NEW DEBUG CODE) ---
// This lets us test if the server is running the new code
app.get("/", (req, res) => {
  console.log("HEALTH CHECK / ROUTE HIT!");
  res.status(200).send("Hello from your HealthApp Backend (Version 3)! The server is running and this route is working.");
});

// --- 2.5 Define the User "Schema" ---
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  personal: {
    name: String,
    age: Number
  },
  health: {
    height: Number,
    weight: Number,
    conditions: String
  },
  analysisResult: { type: String, default: null }, 
  lastUpdated: Date,
  followups: [{
    text: String,
    timestamp: { type: Date, default: Date.now }
  }]
});

const User = mongoose.model('User', UserSchema);

// --- 3. Authentication Endpoints ---
const JWT_SECRET = "your_super_secret_key_12345";

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      email: email, 
      password: hashedPassword,
      personal: {}, 
      health: {},
      followups: [],
      analysisResult: null 
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    if (error.code === 11000) { 
      return res.status(400).json({ message: "Email already exists." });
    }
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' } 
    );
    res.status(200).json({ 
      message: "Login successful!", 
      token: token,
      userId: user._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// --- 4. Auth Middleware ---
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; 
    next();
  });
};

// --- 5. Data Endpoints ---

// Get user profile data
app.get("/api/user/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password'); 
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile data
app.post("/api/user/profile", authMiddleware, async (req, res) => {
  try {
    const { personal, health } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { personal, health, lastUpdated: new Date() },
      { new: true } 
    ).select('-password');
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ message: "Profile updated successfully!", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Save analysis
app.post("/api/user/analysis", authMiddleware, async (req, res) => {
  try {
    const { analysisResult } = req.body;
    if (!['vata', 'pitta', 'kapha'].includes(analysisResult)) {
      return res.status(400).json({ message: "Invalid analysis result." });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { analysisResult: analysisResult },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ message: "Analysis saved!", user });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get followups
app.get("/api/user/followups", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    const sortedFollowups = user.followups.sort((a, b) => b.timestamp - a.timestamp);
    res.status(200).json(sortedFollowups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add followup
app.post("/api/user/followups", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Feedback text is required." });
    const newFollowup = { text: text, timestamp: new Date() };
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $push: { followups: newFollowup } }, 
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(201).json(user.followups[user.followups.length - 1]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// --- 6. Start the Server ---
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

