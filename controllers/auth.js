const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secretKey = require('../config').jwtSecretKey;
const User = require('../models/user');

exports.signUp = async (req, res, next) => {
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

  try {
    const hashedPw = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email,
      password: hashedPw,
    });

    await user.save();

    res
      .status(201)
      .json({
        message: 'User created successfully',
        userId: user._id
      })
  } catch (err) {
    next(err);
  }
}

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  let loadedUser;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error('Incorrect password or email');
      error.statusCode = 401;
      throw error;
    }

    const passwordEqual = await bcrypt.compare(password, user.password);

    if (!passwordEqual) {
      const error = new Error('Incorrect password or email');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({
        email: user.email,
        userId: user._id.toString()
      },
      secretKey,
      { expiresIn: '1h' }
    );

    res
      .status(200)
      .json({
        token,
        userId: user._id.toString()
      });
  } catch (err) {
    next(err);
  }
}