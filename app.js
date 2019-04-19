const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();

let MONGODB_URI;

try {
  const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      cb(null, new Date().getTime() + '-' + file.originalname);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };


  if (process.env.PRODUCTION) {
    const user = process.env.USER;
    const password = process.env.PASSWORD;
    const url = process.env.URL;
    MONGODB_URI = `mongodb+srv://${user}:${password}@${url}`;
  } else {
    MONGODB_URI = 'mongodb://localhost:27017/udemy-rest';
  }


  app.use(bodyParser.json());
  app.use('/images', express.static(path.join(__dirname, 'images')));
  app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
  );

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  })

  const authRoutes = require('./routes/auth');
  const feedRoutes = require('./routes/feed');

  app.use('/auth', authRoutes);
  app.use('/feed', feedRoutes);
  app.use('', (req, res, next) => {
    const error = new Error('Not found');
    error.statusCode = 404;
    next(error)
  })

  app.use((error, req, res, next) => {
    console.log(error);
    res
      .status(error.statusCode || 500)
      .json({
        message: error.message
      })
  })
} catch (err) {
  console.log(err)
};

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true })
  .then(result => {
    const port = process.env.PORT || 8080;
    console.log(`Server launched. Port: ${port}`);
    console.log('Successfully connected to database');
    const server = app.listen(port);
    const io = require('./socket').init(server);
    io.on('connection', socket => {
      console.log('Client connected');
    })
  })
  .catch(err => console.log(err));
