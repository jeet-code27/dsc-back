// server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();

// MongoDB Connection - removed deprecated options
mongoose.connect('mongodb+srv://jeetendrasinghrathore1:B2uqhdlmpbcFv8B4@cluster1.zahwy.mongodb.net/?retryWrites=true&w=majority&appName=cluster1')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/projects', require('./routes/projectRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));