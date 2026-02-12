const { ObjectId } = require("mongodb");
const { getDB } = require("../database/mongo");

const ALLOWED_SORT_FIELDS = [
  "duration",
  "calories",
  "date",
  "title",
  "difficulty",
  "scheduledAt",
  "completedAt",
  "status"
];
const ALLOWED_PROJECTION_FIELDS = [
  "title",
  "type",
  "duration",
  "calories",
  "date",
  "difficulty",
  "notes",
  "scheduledAt",
  "status",
  "completedAt",
  "confirmationRequestedAt",
  "ownerId",
  "ownerUsername",
  "createdAt",
  "updatedAt"
];

function workoutsCollection() {
  return getDB().collection("workouts");
}

function parseObjectId(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  return new ObjectId(id);
}

function normalizePositiveInt(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(parsed, min), max);
}

function buildQueryOptions(query) {
  const filter = {};
  if (query.type) {
    filter.type = query.type;
  }
  if (query.status) {
    filter.status = query.status;
  }

  const sort = { createdAt: -1 };
  if (query.sort && ALLOWED_SORT_FIELDS.includes(query.sort)) {
    const order = query.order === "desc" ? -1 : 1;
    sort[query.sort] = order;
  }

  const page = normalizePositiveInt(query.page, 1, 1, 1000000);
  const limit = normalizePositiveInt(query.limit, 10, 1, 100);
  const skip = (page - 1) * limit;

  let projection = null;
  if (query.fields) {
    projection = { _id: 1 };
    query.fields
      .split(",")
      .map((field) => field.trim())
      .filter((field) => ALLOWED_PROJECTION_FIELDS.includes(field))
      .forEach((field) => {
        projection[field] = 1;
      });
    projection.ownerId = 1;
    projection.ownerUsername = 1;
  }

  return { filter, sort, projection, page, limit, skip };
}

function buildWorkoutDocument(body, ownerId, ownerUsername) {
  const now = new Date();
  const hasScheduledAt = Boolean(body.scheduledAt);
  const scheduledAt = hasScheduledAt ? new Date(body.scheduledAt) : null;

  return {
    title: body.title,
    type: body.type,
    duration: Number(body.duration),
    calories: Number(body.calories) || 0,
    date: body.date || new Date().toISOString().split("T")[0],
    difficulty: body.difficulty || "Medium",
    notes: body.notes || "",
    scheduledAt: hasScheduledAt && !Number.isNaN(scheduledAt.getTime()) ? scheduledAt : null,
    status: "planned",
    completedAt: null,
    confirmationRequestedAt: null,
    ownerId,
    ownerUsername,
    createdAt: now,
    updatedAt: now
  };
}

function parseWorkoutUpdate(body) {
  const allowedFields = ["title", "type", "duration", "calories", "date", "difficulty", "notes", "scheduledAt"];
  const updateData = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      updateData[field] = body[field];
    }
  }

  if (Object.prototype.hasOwnProperty.call(updateData, "duration")) {
    updateData.duration = Number(updateData.duration);
  }

  if (Object.prototype.hasOwnProperty.call(updateData, "calories")) {
    updateData.calories = Number(updateData.calories);
  }
  if (Object.prototype.hasOwnProperty.call(updateData, "scheduledAt")) {
    if (!updateData.scheduledAt) {
      updateData.scheduledAt = null;
    } else {
      updateData.scheduledAt = new Date(updateData.scheduledAt);
    }
  }

  updateData.updatedAt = new Date();
  return updateData;
}

module.exports = {
  workoutsCollection,
  parseObjectId,
  buildQueryOptions,
  buildWorkoutDocument,
  parseWorkoutUpdate
};
