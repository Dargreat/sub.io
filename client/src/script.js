class CaptionGenerator {
  constructor() {
    this.initializeEventListeners();
    this.setupServiceWorker();
  }

  initializeEventListeners() {
    // Video upload handler
    document.getElementById('videoUpload').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const videoPreview = document.getElementById('videoPreview');
        videoPreview.src = URL.createObjectURL(file);
      }
    });

    // Generate caption handler
    document.getElementById('generatePromo').addEventListener('click', async () => {
      try {
        this.toggleLoading(true);
        const results = await this.processVideo();
        this.updateUI(results);
      } catch (error) {
        this.showError(error.message);
      } finally {
        this.toggleLoading(false);
      }
    });

    // Style controls
    ['fontSelect', 'fontSize', 'fontColor'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => {
        this.updateCaptionStyle();
      });
    });
  }

  async processVideo() {
    const formData = new FormData();
    const videoFile = document.getElementById('videoUpload').files[0];
    
    if (!videoFile) throw new Error('Please upload a video first');
    
    formData.append('video', videoFile);
    formData.append('platform', document.getElementById('platformSelect').value);
    formData.append('style', JSON.stringify(this.getCurrentStyle()));

    const response = await fetch('/api/process', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  }

  updateCaptionStyle() {
    const overlay = document.getElementById('captionOverlay');
    overlay.style.fontFamily = document.getElementById('fontSelect').value;
    overlay.style.fontSize = `${document.getElementById('fontSize').value}px`;
    overlay.style.color = document.getElementById('fontColor').value;
  }

  getCurrentStyle() {
    return {
      font: document.getElementById('fontSelect').value,
      size: document.getElementById('fontSize').value,
      color: document.getElementById('fontColor').value
    };
  }

  updateUI({ caption, hashtags, subtitles, videoUrl }) {
    document.getElementById('viralCaption').textContent = caption;
    document.getElementById('hashtagList').textContent = hashtags;
    document.getElementById('captionOverlay').textContent = caption;

    // Create download links
    this.createDownloadLink('downloadSubtitles', subtitles, 'subtitles.srt');
    this.createVideoDownload('downloadWithCaptions', videoUrl);
  }

  createDownloadLink(buttonId, content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    document.getElementById(buttonId).onclick = () => {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    };
  }

  createVideoDownload(buttonId, videoUrl) {
    document.getElementById(buttonId).onclick = async () => {
      try {
        this.toggleLoading(true);
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'video_with_captions.mp4';
        a.click();
      } catch (error) {
        this.showError('Failed to download video');
      } finally {
        this.toggleLoading(false);
      }
    };
  }

  toggleLoading(show) {
    document.getElementById('loading').hidden = !show;
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    document.body.prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }
}

// Initialize app
new CaptionGenerator();
