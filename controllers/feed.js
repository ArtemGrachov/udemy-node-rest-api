const { validationResult } = require('express-validator/check');
const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
  res
    .status(200)
    .json({
      posts: [{
        title: 'First post',
        content: 'This is the first post',
        imageUrl: 'images/enhanced-buzz-1492-1379411828-15.jpg',
        creator: {
          name: 'John Doe'
        },
        createdAt: new Date(),
        _id: new Date().toISOString()
      }]
    });
};

exports.postPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({
        message: 'Validation failed'
      })
  }

  const title = req.body.title;
  const content = req.body.content;

  const post = new Post({
    title,
    content, 
    creator: {
      name: 'John Doe'
    },
    imageUrl: 'images/enhanced-buzz-1492-1379411828-15.jpg'
  });

  post
    .save()
    .then(post => {
      res
        .status(201)
        .json({
          message: 'Post created successfully',
          post
        })
    })
    .catch(err => console.log(err));
}