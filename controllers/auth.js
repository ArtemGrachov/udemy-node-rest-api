const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secretKey = require('../config').jwtSecretKey;
const User = require('../models/user');

exports.signUp = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed!');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  bcrypt
    .hash(password, 12)
    .then(hashedPw => {
      const user = new User({
        name,
        email,
        password: hashedPw,
      });
      return user.save();
    })
    .then(user => {
      res
        .status(201)
        .json({
          message: 'User created successfully',
          userId: user._id
        })
    })
    .catch(err => next(err));
}

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  let loadedUser;

  User
    .findOne({ email })
    .then(user => {
      if (!user) {
        const error = new Error('Incorrect password or email');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Incorrect password or email');
        error.statusCode = 401;
        throw error;
      }

      const token = jwt.sign({
          email: loadedUser.email,
          userId: loadedUser._id.toString()
        },
        secretKey,
        { expiresIn: '1h' }
      );

      res
        .status(200)
        .json({
          token,
          userId: loadedUser._id.toString()
        });
    })
    .catch(err => next(err))
}