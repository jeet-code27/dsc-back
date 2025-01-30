// models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters'] // Increased max length
  },
  description1: {
    type: String,
    maxlength: [10000, 'Primary description cannot be more than 10000 characters'] // Increased max length
  },
  description2: {
    type: String,
    maxlength: [10000, 'Secondary description cannot be more than 10000 characters'] // Increased max length
  },
  projectType: {
    type: String,
    trim: true,
    default: 'Other' // Added default value
  },
  projectArea: {
    type: String,
    trim: true,
    default: 'Not specified' // Added default value
  },
  projectLocation: {
    type: String,
    trim: true,
    default: 'Not specified' // Added default value
  },
  mainImage: {
    type: String,
    default: null // Made optional
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