const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../database/mongo");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = getDB();

    const filter = {};
    if (req.query.type) {
      filter.type = req.query.type;
    }

    const sort = {};
    if (req.query.sort) {
      sort[req.query.sort] = 1;
    }

    let projection = {};
    if (req.query.fields) {
      req.query.fields.split(",").forEach(field => {
        projection[field] = 1;
      });
    }

    const workouts = await db
      .collection("workouts")
      .find(filter)
      .project(projection)
      .sort(sort)
      .toArray();

    res.status(200).json(workouts);

  } catch (error) {
    console.error("Error in GET /workouts:", error); 
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = getDB();

    const workout = await db.collection("workouts").findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.status(200).json(workout);

  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// Protected Write Operations
router.post("/", isAuthenticated, async (req, res) => {
  const { title, type, duration, calories, date, difficulty, notes } = req.body;

  if (!title || !type || !duration) {
    return res.status(400).json({ error: "Missing required fields (title, type, duration)" });
  }

  try {
    const db = getDB();

    const result = await db.collection("workouts").insertOne({
      title,
      type,
      duration: Number(duration),
      calories: Number(calories) || 0,
      date: date || new Date().toISOString().split('T')[0],
      difficulty: difficulty || "Medium",
      notes: notes || ""
    });

    res.status(201).json(result);

  } catch (err) {
    console.error("Error creating workout:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const db = getDB();
    const updateData = { ...req.body };
    
    // Ensure numbers are numbers
    if (updateData.duration) updateData.duration = Number(updateData.duration);
    if (updateData.calories) updateData.calories = Number(updateData.calories);
    
    const result = await db.collection("workouts").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.status(200).json({ message: "Workout updated" });

  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const db = getDB();

    const result = await db.collection("workouts").deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.status(200).json({ message: "Workout deleted" });

  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

module.exports = router;