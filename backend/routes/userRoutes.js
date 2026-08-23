const express = require("express");

const {
  getUserProfile,
  updateUserProfile,
  searchUsers,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// SEARCH MUST COME BEFORE /:id
router.get("/search", searchUsers);

// GET PROFILE
router.get("/:id", getUserProfile);

// UPDATE PROFILE
router.put("/:id", protect, updateUserProfile);

module.exports = router;