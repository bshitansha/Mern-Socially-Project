const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }

  next();
};

const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must contain at least 6 characters."),
  handleValidationErrors,
];

const loginValidation = [
  body("username").trim().notEmpty().withMessage("Username is required."),
  body("password").notEmpty().withMessage("Password is required."),
  handleValidationErrors,
];

const postValidation = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Post content is required.")
    .isLength({ max: 1000 })
    .withMessage("Post content cannot exceed 1000 characters."),
  handleValidationErrors,
];

const commentValidation = [
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Comment cannot be empty.")
    .isLength({ max: 500 })
    .withMessage("Comment cannot exceed 500 characters."),
  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
  postValidation,
  commentValidation,
};