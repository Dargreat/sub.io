const fs = require('fs').promises;
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const MAX_FILE_AGE = 3600000; // 1 hour

async function cleanupOldFiles() {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtimeMs > MAX_FILE_AGE) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.error('File cleanup error:', error);
  }
}