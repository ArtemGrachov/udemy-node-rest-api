const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');
const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

router.get(
  '/posts',
  isAuth,
  feedController.getPosts
);

const postValidators = [
  body('title')
    .trim()
    .isLength({ min: 5 }),
  body('content')
    .trim()
    .isLength({ min: 5 })
];

router.post(
  '/post',
  isAuth,
  postValidators,
  feedController.createPost
);

router.get(
  '/post/:postId',
  isAuth,
  feedController.getPost
);

router.put(
  '/post/:postId',
  isAuth,
  postValidators,
  feedController.updatePost
);

router.delete(
  '/post/:postId',
  isAuth,
  feedController.deletePost
);

module.exports = router;