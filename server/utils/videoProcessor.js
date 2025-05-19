const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const { temporaryFile } = require('tempy');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const processVideo = async (req) => {
  const { file, body } = req;
  const uniqueId = uuidv4();
  
  try {
    // 1. Convert video to audio safely
    const audioPath = await convertToAudio(file.path, uniqueId);
    
    // 2. Generate subtitles
    const subtitles = await generateSubtitles(audioPath);
    
    // 3. Generate social content
    const { caption, hashtags } = await generateSocialContent(subtitles, body.platform);
    
    // 4. Process video with subtitles
    const outputPath = await burnSubtitles(file.path, subtitles, body);

    return {
      caption,
      hashtags,
      subtitles,
      videoUrl: `/api/download/${path.basename(outputPath)}`
    };
    
  } finally {
    // Cleanup temporary files
    await cleanupFiles([file.path, audioPath, outputPath]);
  }
};

const convertToAudio = (inputPath, uniqueId) => {
  return new Promise((resolve, reject) => {
    const outputPath = temporaryFile({ extension: 'mp3' });
    execFile('ffmpeg', [
      '-i', inputPath,
      '-vn',
      '-acodec', 'libmp3lame',
      '-q:a', '2',
      outputPath
    ], (error) => {
      error ? reject(error) : resolve(outputPath);
    });
  });
};