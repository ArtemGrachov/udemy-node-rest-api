const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');
const authController = require('../controllers/auth');
const User = require('../models/user');

router.post(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom((email, { req }) => {
        return User
          .findOne({ email })
          .then(userDoc => {
            if (userDoc) {
              return Promise.reject('Email address already exists.');
            }
          })
      })
      .normalizeEmail(),
    body('password')
      .isLength({ min: 5 }),
    body('name')
      .trim()
      .not()
      .isEmpty()
  ],
  authController.signUp
);

router.post('/login', authController.login);

module.exports = router;