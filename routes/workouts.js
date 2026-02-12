const express = require("express");
const {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  updateWorkoutStatus,
  deleteWorkout,
  getWorkoutHistory,
  getProgressStats,
  getAdminSummary
} = require("../controllers/workoutsController");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/", isAuthenticated, getWorkouts);
router.get("/history/list", isAuthenticated, getWorkoutHistory);
router.get("/progress/stats", isAuthenticated, getProgressStats);
router.get("/admin/summary", isAuthenticated, authorizeRoles("admin"), getAdminSummary);
router.get("/:id", isAuthenticated, getWorkoutById);

router.post("/", isAuthenticated, createWorkout);
router.patch("/:id/status", isAuthenticated, updateWorkoutStatus);
router.put("/:id", isAuthenticated, updateWorkout);
router.delete("/:id", isAuthenticated, deleteWorkout);

module.exports = router;
