const Project = require('../models/Project');
const fs = require('fs').promises;
const path = require('path');

// Utility function to delete file with extra safety checks
const deleteFile = async (filename) => {
  if (filename) {
    try {
      const filePath = path.join('uploads', filename);
      // Check if file exists before attempting to delete
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      if (fileExists) {
        await fs.unlink(filePath);
      }
    } catch (error) {
      console.error(`Error handling file ${filename}:`, error);
    }
  }
};

// Utility function to delete multiple files
const deleteFiles = async (files) => {
  if (Array.isArray(files) && files.length > 0) {
    for (const file of files) {
      await deleteFile(file);
    }
  }
};

const createProject = async (req, res) => {
  try {
    // Create a base project object with default values
    let projectData = {
      title: req.body.title || 'Untitled Project',
      description1: req.body.description1 || '',
      description2: req.body.description2 || '',
      projectType: req.body.projectType || 'Other',
      projectArea: req.body.projectArea || 'Not specified',
      projectLocation: req.body.projectLocation || 'Not specified'
    };

    // Handle file uploads if they exist
    if (req.files) {
      if (req.files['mainImage']) {
        projectData.mainImage = req.files['mainImage'][0].filename;
      }
      
      if (req.files['otherImages']) {
        projectData.otherImages = req.files['otherImages'].map(file => file.filename);
      }
    }

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    // Only delete files if they were uploaded and there was an error
    if (req.files) {
      try {
        if (req.files['mainImage']) {
          await deleteFile(req.files['mainImage'][0].filename);
        }
        if (req.files['otherImages']) {
          await deleteFiles(req.files['otherImages'].map(file => file.filename));
        }
      } catch (deleteError) {
        console.error('Error cleaning up files:', deleteError);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Error creating project'
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
      error: error.message || 'Error fetching projects'
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
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching project'
    });
  }
};

const updateProject = async (req, res) => {
  try {
    // Find project first
    let project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Store old image paths
    const oldMainImage = project.mainImage;
    const oldOtherImages = [...(project.otherImages || [])];

    // Prepare update data with existing values as fallback
    const updateData = {
      title: req.body.title || project.title,
      description1: req.body.description1 || project.description1,
      description2: req.body.description2 || project.description2,
      projectType: req.body.projectType || project.projectType,
      projectArea: req.body.projectArea || project.projectArea,
      projectLocation: req.body.projectLocation || project.projectLocation
    };

    // Handle file uploads if they exist
    if (req.files) {
      if (req.files['mainImage']) {
        updateData.mainImage = req.files['mainImage'][0].filename;
      }
      
      if (req.files['otherImages']) {
        updateData.otherImages = req.files['otherImages'].map(file => file.filename);
      }
    }

    // Update project
    project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: false // Disabled validators for more flexibility
      }
    );

    // Delete old files only if new ones were uploaded successfully
    if (req.files) {
      try {
        if (req.files['mainImage'] && oldMainImage) {
          await deleteFile(oldMainImage);
        }
        if (req.files['otherImages'] && oldOtherImages.length > 0) {
          await deleteFiles(oldOtherImages);
        }
      } catch (deleteError) {
        console.error('Error cleaning up old files:', deleteError);
      }
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    // If update fails, try to clean up any newly uploaded files
    if (req.files) {
      try {
        if (req.files['mainImage']) {
          await deleteFile(req.files['mainImage'][0].filename);
        }
        if (req.files['otherImages']) {
          await deleteFiles(req.files['otherImages'].map(file => file.filename));
        }
      } catch (deleteError) {
        console.error('Error cleaning up files after failed update:', deleteError);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Error updating project'
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

    // Delete associated files with extra safety
    try {
      if (project.mainImage) {
        await deleteFile(project.mainImage);
      }
      if (project.otherImages && project.otherImages.length > 0) {
        await deleteFiles(project.otherImages);
      }
    } catch (deleteError) {
      console.error('Error deleting project files:', deleteError);
    }

    // Delete project from database
    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error deleting project'
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