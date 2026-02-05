const express = require("express");
const bcrypt = require("bcrypt");
const { getDB } = require("../database/mongo");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const db = getDB();
    const existingUser = await db.collection("users").findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.collection("users").insertOne({
      username,
      password: hashedPassword
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const db = getDB();
    const user = await db.collection("users").findOne({ username });

    if (!user) {
      // Generic error message for security
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create session
    req.session.userId = user._id;
    req.session.username = user.username;

    res.status(200).json({ message: "Login successful", username: user.username });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not log out" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logout successful" });
  });
});

// Auth Status
router.get("/status", (req, res) => {
  if (req.session && req.session.userId) {
    return res.status(200).json({ 
      isAuthenticated: true, 
      username: req.session.username 
    });
  }
  res.status(200).json({ isAuthenticated: false });
});

module.exports = router;
