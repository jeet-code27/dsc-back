// projectRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  createProject, 
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const uploadFields = upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'otherImages', maxCount: 25 }
]);

// Routes
router.route('/')
  .post(uploadFields, createProject)
  .get(getProjects);

router.route('/:id')
  .get(getProjectById)
  .put(uploadFields, updateProject)
  .delete(deleteProject);

module.exports = router;