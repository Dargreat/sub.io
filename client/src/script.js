class CaptionGenerator {
  constructor() {
    this.initializeEventListeners();
    this.setupServiceWorker();
  }

  initializeEventListeners() {
    // Existing event listeners with enhanced error handling
    document.getElementById('generatePromo').addEventListener('click', 
      this.handleGenerateClick.bind(this));
    
    // Add input validation for file upload
    document.getElementById('videoUpload').addEventListener('change', e => {
      const file = e.target.files[0];
      if (file && !file.type.startsWith('video/')) {
        this.showError('Please upload a valid video file');
        e.target.value = '';
      }
    });
  }

  async handleGenerateClick() {
    try {
      this.toggleLoading(true);
      const { caption, hashtags, subtitles, videoUrl } = await this.processVideo();
      this.updateUI(caption, hashtags);
      this.setupDownloads(subtitles, videoUrl);
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.toggleLoading(false);
    }
  }

  async processVideo() {
    const formData = new FormData();
    // Add validation and error handling
    const videoFile = document.getElementById('videoUpload').files[0];
    if (!videoFile) throw new Error('Please select a video file');
    
    formData.append('video', videoFile);
    formData.append('platform', document.getElementById('platformSelect').value);
    formData.append('font', document.getElementById('fontSelect').value);
    formData.append('fontSize', document.getElementById('fontSize').value);
    formData.append('fontColor', document.getElementById('fontColor').value);

    const response = await fetch('/api/process', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  }

  // Add other helper methods with error handling
}
// script.js
document.getElementById('videoUpload').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const videoPreview = document.getElementById('videoPreview');
  const videoUrl = URL.createObjectURL(file);
  
  // Explicitly load video
  videoPreview.src = videoUrl;
  videoPreview.load();
  
  // Handle autoplay restrictions
  videoPreview.muted = true;
  videoPreview.play().catch(error => {
    console.log('Autoplay blocked:', error);
  });
});
