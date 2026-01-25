const express = require("express");
const path = require("path");

const { connectDB } = require("./database/mongo");
const workoutsRoutes = require("./routes/workouts");

const app = express();
const PORT = process.env.PORT || 3000; //3.2

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.static("public"));

app.use("/api/workouts", workoutsRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/workouts", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "workouts.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "about.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "contact.html"));
});
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