// models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description1: {
    type: String,
    required: [true, 'Please add a primary description'],
    maxlength: [5000, 'Primary description cannot be more than 1000 characters']
  },
  description2: {
    type: String,
    maxlength: [5000, 'Secondary description cannot be more than 1000 characters']
  },
  mainImage: {
    type: String,
    required: [true, 'Please add a main image']
  },
  otherImages: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', projectSchema);