const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');
const feedController = require('../controllers/feed');

router.get('/posts', feedController.getPosts);

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
  postValidators,
  feedController.createPost
);

router.get('/post/:postId', feedController.getPost);

router.put(
  '/post/:postId',
  postValidators,
  feedController.updatePost
);

router.delete('/post/:postId', feedController.deletePost);

module.exports = router;