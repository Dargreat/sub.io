require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const apiRouter = require('./routes/api');
const { cleanupOldFiles } = require('./utils/fileCleaner');

const app = express();

// Security middleware
app.use(helmet());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use('/api/', apiLimiter);

// Routes
app.use('/api', apiRouter);

// File cleanup job
setInterval(cleanupOldFiles, 3600000); // Cleanup every hour

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});