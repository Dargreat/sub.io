const sanitize = require('sanitize-filename');

module.exports = {
  sanitizeFilename: (path) => {
    const cleanName = sanitize(path.replace(/^.*[\\\/]/, ''));
    if (!cleanName) throw new Error('Invalid filename');
    return cleanName;
  },
  
  sanitizePlatform: (platform) => {
    const allowed = ['tiktok', 'instagram', 'youtube', 'twitter'];
    return allowed.includes(platform) ? platform : 'general';
  }
};