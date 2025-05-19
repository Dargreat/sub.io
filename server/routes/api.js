const express = require('express');
const router = express.Router();
const { processVideo } = require('../utils/videoProcessor');
const multer = require('multer');

const upload = multer({
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed'));
    }
    cb(null, true);
  }
});

router.post('/process', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) throw new Error('No video uploaded');
    
    const result = await processVideo({
      file: req.file,
      platform: req.body.platform,
      style: JSON.parse(req.body.style)
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
