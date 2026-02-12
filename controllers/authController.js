const bcrypt = require("bcrypt");
const { findByUsername, countUsers, createUser, listUsers } = require("../models/userModel");

async function register(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    const existingUser = await findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const usersCount = await countUsers();
    const role = usersCount === 0 ? "admin" : "user";
    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser({
      username,
      password: hashedPassword,
      role,
      createdAt: new Date()
    });

    return res.status(201).json({
      message: "User registered successfully",
      role
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const user = await findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.userId = user._id.toString();
    req.session.username = user.username;
    req.session.role = user.role || "user";

    return res.status(200).json({
      message: "Login successful",
      username: user.username,
      role: req.session.role
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not log out" });
    }

    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logout successful" });
  });
}

function status(req, res) {
  if (req.session && req.session.userId) {
    return res.status(200).json({
      isAuthenticated: true,
      userId: req.session.userId,
      username: req.session.username,
      role: req.session.role || "user"
    });
  }

  return res.status(200).json({
    isAuthenticated: false,
    userId: null,
    role: null
  });
}

async function getUsers(req, res) {
  try {
    const users = await listUsers();
    return res.status(200).json(users);
  } catch (error) {
    console.error("Users list error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  register,
  login,
  logout,
  status,
  getUsers
};
