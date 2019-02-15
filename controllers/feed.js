const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator/check');
const Post = require('../models/post');


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

  const post = new Post({
    title,
    content, 
    imageUrl,
    creator: {
      name: 'John Doe'
    }
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