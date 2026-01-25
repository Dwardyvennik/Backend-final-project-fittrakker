const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../database/mongo");

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
router.post("/", async (req, res) => {
  const { title, type, duration, calories, date } = req.body;

  if (!title || !type || !duration) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const db = getDB();

    const result = await db.collection("workouts").insertOne({
      title,
      type,
      duration,
      calories,
      date
    });

    res.status(201).json(result);

  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const db = getDB();

    const result = await db.collection("workouts").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.status(200).json({ message: "Workout updated" });

  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

router.delete("/:id", async (req, res) => {
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
