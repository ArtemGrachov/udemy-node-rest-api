const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator/check');
const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = (req, res, next) => {
  const currentPage = +req.query.page || 1;
  const postsPerPage = +req.query.postsPerPage || 2;
  let totalItems;
  Post
    .find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Post
        .find()
        .skip((currentPage - 1) * postsPerPage)
        .limit(postsPerPage);
    })
    .then(
      posts => {
        res
          .status(200)
          .json({
            message: 'Posts fetched successfully',
            posts: posts,
            totalItems
          });
      }
    )
    .catch(err => next(err))
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path;

  let creator;
  let newPost;

  const post = new Post({
    title,
    content, 
    imageUrl,
    creator: req.userId
  });

  post
    .save()
    .then(result => {
      return User.findById(req.userId)
    })
    .then(user => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then(result => {
      res
        .status(201)
        .json({
          message: 'Post created successfully',
          post,
          creator: {
            _id: creator._id,
            name: creator.name 
          }
        })
    })
    .catch(err => next(err));
}

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post
    .findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post');
        error.statusCode = 404;
        throw error;
      }
      res
        .status(200)
        .json({
          message: 'Post fetched successfully',
          post
        })
    })
    .catch(err => next(err));
}

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path;
  }

  if (!imageUrl) {
    const error = new Error('No file picked');
    error.statusCode = 422;
    throw error;
  }

  Post
    .findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post');
        error.statusCode = 404;
        throw error;
      }

      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authorized');
        error.statusCode = 403;
        throw error;
      }

      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }

      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;

      return post.save();
    })
    .then(post => {
      res
        .status(200)
        .json({
          message: 'Post updated successfully',
          post
        })
    })
    .catch(err => next(err));
}

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post
    .findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post');
        error.statusCode = 404;
        throw error;
      }

      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authorized');
        error.statusCode = 403;
        throw error;
      }

      clearImage(post.imageUrl);
      return post.remove();
    })
    .then(result => {
      res
        .status(200)
        .json({ message: 'Post removed successfully' });
    })
    .catch(err => next(err));
}

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath);
}