const express = require("express");
const {
  register,
  login,
  logout,
  status,
  getUsers
} = require("../controllers/authController");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/status", status);
router.get("/users", isAuthenticated, authorizeRoles("admin"), getUsers);

module.exports = router;
