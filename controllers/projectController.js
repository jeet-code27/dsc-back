// projectController.js
const Project = require('../models/Project');
const fs = require('fs').promises;
const path = require('path');

const createProject = async (req, res) => {
  try {
    const { title, description1, description2 } = req.body;
    
    if (!title || !description1) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    // Handle file uploads
    const mainImage = req.files['mainImage'][0].filename;
    const otherImages = req.files['otherImages'] 
      ? req.files['otherImages'].map(file => file.filename)
      : [];

    const project = await Project.create({
      title,
      description1,
      description2,
      mainImage,
      otherImages
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    // Delete uploaded files if project creation fails
    if (req.files) {
      if (req.files['mainImage']) {
        await fs.unlink(path.join('uploads', req.files['mainImage'][0].filename)).catch(console.error);
      }
      if (req.files['otherImages']) {
        for (const file of req.files['otherImages']) {
          await fs.unlink(path.join('uploads', file.filename)).catch(console.error);
        }
      }
    } 

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({}).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { title, description1, description2 } = req.body;
    
    // Find project and check if it exists
    let project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Store old image paths
    const oldMainImage = project.mainImage;
    const oldOtherImages = project.otherImages;

    // Handle file uploads if they exist
    const updateData = {
      title,
      description1,
      description2
    };

    if (req.files) {
      if (req.files['mainImage']) {
        updateData.mainImage = req.files['mainImage'][0].filename;
      }
      
      if (req.files['otherImages']) {
        updateData.otherImages = req.files['otherImages'].map(file => file.filename);
      }
    }

    // Update project with new data
    project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    // Delete old files if they were replaced
    if (req.files['mainImage'] && oldMainImage) {
      await fs.unlink(path.join('uploads', oldMainImage)).catch(console.error);
    }
    
    if (req.files['otherImages'] && oldOtherImages) {
      for (const image of oldOtherImages) {
        await fs.unlink(path.join('uploads', image)).catch(console.error);
      }
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    // Delete new uploaded files if update fails
    if (req.files) {
      if (req.files['mainImage']) {
        await fs.unlink(path.join('uploads', req.files['mainImage'][0].filename)).catch(console.error);
      }
      if (req.files['otherImages']) {
        for (const file of req.files['otherImages']) {
          await fs.unlink(path.join('uploads', file.filename)).catch(console.error);
        }
      }
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Delete associated files
    if (project.mainImage) {
      await fs.unlink(path.join('uploads', project.mainImage)).catch(console.error);
    }
    
    if (project.otherImages && project.otherImages.length > 0) {
      for (const image of project.otherImages) {
        await fs.unlink(path.join('uploads', image)).catch(console.error);
      }
    }

    // Delete project from database
    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project and associated files deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
};
