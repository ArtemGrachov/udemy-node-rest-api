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
  const title = req.body.title;
  const content = req.body.content;

  res
    .status(201)
    .json({
      message: 'Post created successfully!',
      post: {
        title,
        content,
        creator: {
          name: 'John Doe'
        },
        createdAt: new Date(),
        _id: new Date().toISOString()
      }
    })
}