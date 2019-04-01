const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator/check');
const Post = require('../models/post');
const User = require('../models/user');
const io = require('../socket');

exports.getPosts = async (req, res, next) => {
  const currentPage = +req.query.page || 1;
  const postsPerPage = +req.query.postsPerPage || 2;

  try {
    const totalItems = await Post.find().countDocuments();

    const posts = await Post.find()
      .skip((currentPage - 1) * postsPerPage)
      .sort({ createdAt: -1 })
      .limit(postsPerPage)
      .populate('creator');

    res
      .status(200)
      .json({
        message: 'Posts fetched successfully',
        posts: posts,
        totalItems
      });
  } catch (err) {
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
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

    const post = await new Post({
      title,
      content, 
      imageUrl,
      creator: req.userId
    }).save();

    const creator = await User.findById(req.userId);
    creator.posts.push(post._id);

    const result = await creator.save();

    post.creator = result;

    io.getIO().emit('posts', { action: 'create', post })

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
  } catch (err) {
    next(err);
  }
}

exports.getPost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);

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
  } catch (err) {
    next(err);
  }
}

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path;
  }

  try {
    const post = await Post.findById(postId).populate('creator');

    if (!post) {
      const error = new Error('Could not find post');
      error.statusCode = 404;
      throw error;
    }

    if (post.creator._id.toString() !== req.userId) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }

    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }

    if (title) post.title = title;
    if (imageUrl) post.imageUrl = imageUrl;
    if (content) post.content = content;

    const result = await post.save();

    io.getIO().emit('posts', { action: 'update', post: result });

    res
      .status(200)
      .json({
        message: 'Post updated successfully',
        post
      })
  } catch (err) {
    next(err);
  }
}

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;

  let postCreatorId;

  try {
    const post = await Post.findById(postId);

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

    postCreatorId = post.creator;

    await post.remove();

    const user = await User.findById(postCreatorId);
    user.posts.pull(postId);
    await user.save();

    io.getIO().emit('posts', { action: 'delete', postId: postId });

    res
      .status(200)
      .json({ message: 'Post removed successfully' });
  } catch (err) {
    next(err);
  }
}

const clearImage = filePath => {
  try {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath);
  } catch (err) { }
}