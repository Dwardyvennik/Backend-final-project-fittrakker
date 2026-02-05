const express = require("express");
const path = require("path");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
require("dotenv").config();

const { connectDB } = require("./database/mongo");
const workoutsRoutes = require("./routes/workouts");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;
app.set("trust proxy", 1);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretkey", // Change in production
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" // true only if https/production
  }
}));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.static("public"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/workouts", workoutsRoutes);

// HTML Views
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/workouts", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "workouts.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "about.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "contact.html"));
});

// 404 Handler
app.use((req, res) => {
  if (req.url.startsWith("/api")) {
    res.status(404).json({ error: "API route not found" });
  } else {
    res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
  }
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
