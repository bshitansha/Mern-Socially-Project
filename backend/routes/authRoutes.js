const express = require("express");

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const {
  registerValidation,
  loginValidation,
} = require("../middleware/validators");

const router = express.Router();

router.post("/register", registerValidation, registerUser);

router.post("/login", loginValidation, loginUser);

module.exports = router;