const express = require("express");
const path = require("path");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
require("dotenv").config();

const { connectDB } = require("./database/mongo");
const workoutsRoutes = require("./routes/workouts");
const authRoutes = require("./routes/auth");
const consultationsRoutes = require("./routes/consultations");

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is required in environment variables");
}

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required in environment variables");
}

const app = express();
const PORT = process.env.PORT || 3000;
app.set("trust proxy", 1); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions"
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    }
  })
);

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.static("public"));

app.use("/api/auth", authRoutes);
app.use("/api/workouts", workoutsRoutes);
app.use("/api/consultations", consultationsRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/workouts", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "workouts.html"));
});

app.get("/consultations", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "consultations.html"));
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

app.use((req, res) => {
  if (req.url.startsWith("/api")) {
    return res.status(404).json({ error: "API route not found" });
  }

  return res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
