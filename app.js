const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

const MONGODB_URI = 'mongodb://localhost:27017/udemy-rest';

app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
})

const feedRoutes = require('./routes/feed');

app.use('/feed', feedRoutes);

mongoose
  .connect(MONGODB_URI)
  .then(result => app.listen(8080))
  .catch(err => console.log(err));
