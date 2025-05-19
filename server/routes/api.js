const express = require('express');
const multer = require('multer');
const { validateFile, validatePlatform } = require('../middleware/validation');
const { processVideo } = require('../utils/videoProcessor');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed'));
    }
    cb(null, true);
  }
});

router.post('/process', 
  upload.single('video'),
  validateFile,
  validatePlatform,
  async (req, res, next) => {
    try {
      const result = await processVideo(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;