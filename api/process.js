import { OpenAI } from 'openai';
import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
import ffmpegStatic from 'ffmpeg-static';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async (req, res) => {
  try {
    // 1. Validate request
    if (!req.body || !req.files?.video) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    // 2. Process video
    const videoBuffer = req.files.video.data;
    const audioStream = await convertToAudio(videoBuffer);
    
    // 3. Generate subtitles
    const transcript = await openai.audio.transcriptions.create({
      file: audioStream,
      model: "whisper-1",
      response_format: "srt"
    });

    // 4. Generate content
    const content = await generateSocialContent(transcript, req.body.platform);

    // 5. Return response
    res.status(200).json({
      ...content,
      subtitles: transcript,
      videoUrl: await processVideoWithSubtitles(videoBuffer, transcript)
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Helper functions
async function convertToAudio(buffer) {
  return new Promise((resolve, reject) => {
    const stream = Readable.from(buffer);
    const output = [];
    
    ffmpeg(stream)
      .setFfmpegPath(ffmpegStatic)
      .audioCodec('libmp3lame')
      .format('mp3')
      .on('data', chunk => output.push(chunk))
      .on('end', () => resolve(Buffer.concat(output)))
      .on('error', reject)
      .run();
  });
}
