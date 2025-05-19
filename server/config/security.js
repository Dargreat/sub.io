const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

module.exports = {
  securityHeaders: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        mediaSrc: ["'self'"]
      }
    }
  }),

  apiLimiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  }),

  sanitizeInput: [
    body('platform').trim().escape(),
    body('font').trim().escape(),
    body('fontSize').isInt({ min: 10, max: 100 }),
    body('fontColor').isHexColor(),
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ],

  validateFile: (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!req.file.mimetype.startsWith('video/')) {
      return res.status(400).json({ error: 'Invalid file type' });
    }
    next();
  }
};