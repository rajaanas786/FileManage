const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Set up storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// File upload route
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  res.json({ message: 'File uploaded successfully', file: req.file });
});

// Get file route
router.get('/:filename', (req, res) => {
  const filePath = `./uploads/${req.params.filename}`;
  res.sendFile(filePath, { root: __dirname });
});

module.exports = router;
