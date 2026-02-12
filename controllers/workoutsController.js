const {
  workoutsCollection,
  parseObjectId,
  buildQueryOptions,
  buildWorkoutDocument,
  parseWorkoutUpdate
} = require("../models/workoutModel");

function canManageWorkout(session, workout) {
  if (!session || !session.userId) {
    return false;
  }

  if (session.role === "admin") {
    return true;
  }

  return String(workout.ownerId) === String(session.userId);
}

function withScopeFilter(session, baseFilter = {}) {
  const filter = { ...baseFilter };
  if (session?.role !== "admin") {
    filter.ownerId = session.userId;
    if (session.username) {
      filter.ownerUsername = session.username;
    }
  }
  return filter;
}

function computeStreak(doneWorkouts) {
  const daySet = new Set();
  for (const workout of doneWorkouts) {
    const sourceDate = workout.completedAt || workout.scheduledAt || workout.date;
    const date = new Date(sourceDate);
    if (!Number.isNaN(date.getTime())) {
      daySet.add(date.toISOString().slice(0, 10));
    }
  }

  let streak = 0;
  const current = new Date();
  current.setHours(0, 0, 0, 0);

  while (true) {
    const key = current.toISOString().slice(0, 10);
    if (!daySet.has(key)) {
      break;
    }
    streak += 1;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

async function getWorkouts(req, res) {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const options = buildQueryOptions(req.query);
    options.filter = withScopeFilter(req.session, options.filter);
    const collection = workoutsCollection();

    const [items, total] = await Promise.all([
      collection
        .find(options.filter, options.projection ? { projection: options.projection } : undefined)
        .sort(options.sort)
        .skip(options.skip)
        .limit(options.limit)
        .toArray(),
      collection.countDocuments(options.filter)
    ]);

    const workouts = items.map((workout) => ({
      ...workout,
      isDueConfirmation:
        workout.status === "planned" &&
        workout.scheduledAt &&
        new Date(workout.scheduledAt).getTime() <= Date.now(),
      canManage: canManageWorkout(req.session, workout)
    }));

    return res.status(200).json({
      items: workouts,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / options.limit))
      }
    });
  } catch (error) {
    console.error("Error in GET /workouts:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

async function getWorkoutById(req, res) {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const id = parseObjectId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const workout = await workoutsCollection().findOne({ _id: id });
    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    if (req.session?.role !== "admin") {
      if (!req.session?.userId || String(workout.ownerId) !== String(req.session.userId)) {
        return res.status(403).json({ error: "Forbidden: personal data only" });
      }
    }

    return res.status(200).json({
      ...workout,
      canManage: canManageWorkout(req.session, workout)
    });
  } catch (error) {
    console.error("Error in GET /workouts/:id", error);
    return res.status(500).json({ error: "Server error" });
  }
}

async function createWorkout(req, res) {
  const { title, type, duration } = req.body;
  const allowedTypes = ["strength", "cardio", "yoga"];

  if (!title || !type || duration === undefined || duration === null || duration === "") {
    return res.status(400).json({ error: "Missing required fields (title, type, duration)" });
  }

  if (Number.isNaN(Number(duration)) || Number(duration) <= 0) {
    return res.status(400).json({ error: "Duration must be a positive number" });
  }

  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ error: "Invalid workout type" });
  }

  if (req.body.calories !== undefined) {
    const calories = Number(req.body.calories);
    if (Number.isNaN(calories) || calories < 0) {
      return res.status(400).json({ error: "Calories must be a non-negative number" });
    }
  }

  try {
    const doc = buildWorkoutDocument(req.body, req.session.userId, req.session.username);
    const result = await workoutsCollection().insertOne(doc);
    return res.status(201).json({
      message: "Workout created",
      insertedId: result.insertedId
    });
  } catch (error) {
    console.error("Error creating workout:", error);
    return res.status(500).json({ error: "Database error" });
  }
}

async function updateWorkout(req, res) {
  try {
    const allowedTypes = ["strength", "cardio", "yoga"];
    const id = parseObjectId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const collection = workoutsCollection();
    const workout = await collection.findOne({ _id: id });
    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    if (!canManageWorkout(req.session, workout)) {
      return res.status(403).json({ error: "Forbidden: you can only modify your own data" });
    }

    const updateData = parseWorkoutUpdate(req.body);
    if (Object.keys(updateData).length <= 1) {
      return res.status(400).json({ error: "No valid fields provided for update" });
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "duration")) {
      if (Number.isNaN(updateData.duration) || updateData.duration <= 0) {
        return res.status(400).json({ error: "Duration must be a positive number" });
      }
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "calories")) {
      if (Number.isNaN(updateData.calories) || updateData.calories < 0) {
        return res.status(400).json({ error: "Calories must be a non-negative number" });
      }
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "type")) {
      if (!allowedTypes.includes(updateData.type)) {
        return res.status(400).json({ error: "Invalid workout type" });
      }
    }
    if (Object.prototype.hasOwnProperty.call(updateData, "scheduledAt")) {
      if (updateData.scheduledAt !== null && Number.isNaN(updateData.scheduledAt.getTime())) {
        return res.status(400).json({ error: "Invalid scheduledAt datetime" });
      }
    }

    await collection.updateOne({ _id: id }, { $set: updateData });
    return res.status(200).json({ message: "Workout updated" });
  } catch (error) {
    console.error("Error updating workout:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

async function updateWorkoutStatus(req, res) {
  try {
    const id = parseObjectId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const action = String(req.body.action || "").toLowerCase();
    if (!["done", "missed", "planned"].includes(action)) {
      return res.status(400).json({ error: "Invalid action. Use done, missed, or planned" });
    }

    const collection = workoutsCollection();
    const workout = await collection.findOne({ _id: id });
    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    if (!canManageWorkout(req.session, workout)) {
      return res.status(403).json({ error: "Forbidden: you can only modify your own data" });
    }

    const now = new Date();
    const statusPatch = {
      status: action,
      confirmationRequestedAt: now,
      updatedAt: now
    };
    if (action === "done") {
      statusPatch.completedAt = now;
    } else if (action === "planned") {
      statusPatch.completedAt = null;
    } else {
      statusPatch.completedAt = null;
    }

    await collection.updateOne({ _id: id }, { $set: statusPatch });
    return res.status(200).json({ message: `Workout marked as ${action}` });
  } catch (error) {
    console.error("Error updating workout status:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

async function getWorkoutHistory(req, res) {
  try {
    const collection = workoutsCollection();
    const limitRaw = Number.parseInt(req.query.limit, 10);
    const limit = Number.isNaN(limitRaw) ? 30 : Math.min(Math.max(limitRaw, 1), 100);
    const filter = withScopeFilter(req.session, {});
    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      filter.status = { $in: ["done", "missed"] };
    }

    const items = await collection
      .find(filter)
      .sort({ completedAt: -1, scheduledAt: -1, updatedAt: -1 })
      .limit(limit)
      .toArray();

    return res.status(200).json({ items });
  } catch (error) {
    console.error("Error loading workout history:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

async function getProgressStats(req, res) {
  try {
    const collection = workoutsCollection();
    const baseFilter = withScopeFilter(req.session, {});
    const now = new Date();
    const last7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [allItems, doneByType] = await Promise.all([
      collection.find(baseFilter).toArray(),
      collection
        .aggregate([
          { $match: { ...baseFilter, status: "done" } },
          { $group: { _id: "$type", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
        .toArray()
    ]);

    const total = allItems.length;
    const doneItems = allItems.filter((item) => item.status === "done");
    const missedItems = allItems.filter((item) => item.status === "missed");
    const plannedItems = allItems.filter((item) => item.status === "planned");
    const weeklyDone = doneItems.filter((item) => {
      const d = new Date(item.completedAt || item.scheduledAt || item.date);
      return !Number.isNaN(d.getTime()) && d >= last7 && d <= now;
    }).length;
    const monthlyDone = doneItems.filter((item) => {
      const d = new Date(item.completedAt || item.scheduledAt || item.date);
      return !Number.isNaN(d.getTime()) && d >= last30 && d <= now;
    }).length;

    const totalDurationDone = doneItems.reduce((acc, item) => acc + (Number(item.duration) || 0), 0);
    const totalCaloriesDone = doneItems.reduce((acc, item) => acc + (Number(item.calories) || 0), 0);
    const completionRate = total === 0 ? 0 : Math.round((doneItems.length / total) * 100);

    return res.status(200).json({
      totalWorkouts: total,
      done: doneItems.length,
      missed: missedItems.length,
      planned: plannedItems.length,
      completionRate,
      weeklyDone,
      monthlyDone,
      totalDurationDone,
      totalCaloriesDone,
      streakDays: computeStreak(doneItems),
      doneByType
    });
  } catch (error) {
    console.error("Error loading progress stats:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

async function deleteWorkout(req, res) {
  try {
    const id = parseObjectId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const collection = workoutsCollection();
    const workout = await collection.findOne({ _id: id });
    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    if (!canManageWorkout(req.session, workout)) {
      return res.status(403).json({ error: "Forbidden: you can only delete your own data" });
    }

    await collection.deleteOne({ _id: id });
    return res.status(200).json({ message: "Workout deleted" });
  } catch (error) {
    console.error("Error deleting workout:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

async function getAdminSummary(req, res) {
  try {
    const collection = workoutsCollection();
    const [totalWorkouts, byType, byOwner] = await Promise.all([
      collection.countDocuments(),
      collection
        .aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }, { $sort: { count: -1 } }])
        .toArray(),
      collection
        .aggregate([
          { $group: { _id: "$ownerUsername", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ])
        .toArray()
    ]);

    return res.status(200).json({ totalWorkouts, byType, byOwner });
  } catch (error) {
    console.error("Error loading admin summary:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  updateWorkoutStatus,
  deleteWorkout,
  getWorkoutHistory,
  getProgressStats,
  getAdminSummary
};
