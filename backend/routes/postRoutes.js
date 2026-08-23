const express = require("express");

const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
} = require("../controllers/postController");

const protect = require("../middleware/authMiddleware");

const {
  postValidation,
  commentValidation,
} = require("../middleware/validators");

const router = express.Router();

// READ
router.get("/", getPosts);
router.get("/:id", getPost);

// CREATE
router.post("/", protect, postValidation, createPost);

// UPDATE
router.put("/:id", protect, postValidation, updatePost);

// DELETE
router.delete("/:id", protect, deletePost);

// LIKE / UNLIKE
router.put("/:id/like", protect, toggleLike);

// COMMENT
router.post("/:id/comments", protect, commentValidation, addComment);

module.exports = router;