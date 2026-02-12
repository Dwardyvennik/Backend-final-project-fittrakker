const express = require("express");
const {
  getConsultants,
  createConsultation,
  getMyConsultations,
  updateConsultationStatus
} = require("../controllers/consultationsController");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.get("/consultants", isAuthenticated, getConsultants);
router.get("/my", isAuthenticated, getMyConsultations);
router.post("/", isAuthenticated, createConsultation);
router.patch("/:id/status", isAuthenticated, updateConsultationStatus);

module.exports = router;
