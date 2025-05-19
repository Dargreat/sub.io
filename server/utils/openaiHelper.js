const OpenAI = require('openai');
const { sanitizeFilename } = require('./sanitizers');

class OpenAIService {
  constructor(apiKey) {
    this.client = new OpenAI({ apiKey });
  }

  async generateSubtitles(audioPath) {
    try {
      const transcript = await this.client.audio.transcriptions.create({
        file: fs.createReadStream(sanitizeFilename(audioPath)),
        model: "whisper-1",
        response_format: "srt"
      });
      return transcript;
    } catch (error) {
      throw new Error(`Subtitles generation failed: ${error.message}`);
    }
  }

  async generateSocialContent(transcript, platform) {
    const prompt = this.buildPrompt(transcript, platform);
    
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      return this.parseResponse(response);
    } catch (error) {
      throw new Error(`Content generation failed: ${error.message}`);
    }
  }

  buildPrompt(transcript, platform) {
    return `Generate ${platform} content in JSON format with these keys: 
    { "caption": "...", "hashtags": "..." } based on:
    ${transcript.substring(0, 3000)}... [truncated]`;
  }

  parseResponse(response) {
    try {
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      throw new Error('Failed to parse OpenAI response');
    }
  }
}

module.exports = OpenAIService;