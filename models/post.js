const path = require('path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    require: true
  },
  content: {
    type: String,
    required: true
  },
  creator: {
    type: Object,
    required: true
  }
}, {
  timestamps: true
});

postSchema.pre('save', function () {
  if (this.isModified('imageUrl')) {
    this.imageUrl = this.imageUrl.split(path.sep).join('/')
  }
})

module.exports = mongoose.model('Post', postSchema);