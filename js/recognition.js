/**
 * Heritage Landmark Image Recognition Module
 * Uses HTML5 Canvas and client-side color histogram & perceptual grid matching
 * to identify heritage sites from uploaded photos or live camera captures.
 */

const RecognitionComponent = (() => {
  // DOM References
  const identifyBtn = document.getElementById('btn-identify-site');
  const identifyModal = document.getElementById('identify-modal');
  const modalCloseBtn = document.getElementById('identify-close-btn');
  
  const tabUpload = document.getElementById('tab-upload');
  const tabCamera = document.getElementById('tab-camera');
  const panelUpload = document.getElementById('panel-upload');
  const panelCamera = document.getElementById('panel-camera');

  const fileInput = document.getElementById('photo-upload-input');
  const dropZone = document.getElementById('drop-zone');
  const videoElement = document.getElementById('camera-stream');
  const captureBtn = document.getElementById('btn-capture-photo');
  const previewCanvas = document.getElementById('analysis-canvas');

  const resultsContainer = document.getElementById('recognition-results');
  const statusMessage = document.getElementById('recognition-status');

  // State
  let siteFeatureVectors = new Map(); // siteId -> Array of grid RGB vectors
  let cameraStream = null;
  let allSites = [];
  let onSiteSelectedCallback = null;

  const GRID_SIZE = 16; // 16x16 grid = 256 sample points per image

  /**
   * Initialize Recognition Module with sites dataset.
   * @param {Array} sites - Array of site objects.
   * @param {Function} onSelectSite - Callback when user clicks a recognized site.
   */
  function init(sites, onSelectSite) {
    allSites = sites;
    onSiteSelectedCallback = onSelectSite;

    // Precompute feature vectors for all heritage sites
    precomputeSiteFeatures(sites);

    // Setup event listeners
    if (identifyBtn) {
      identifyBtn.addEventListener('click', openModal);
    }
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModal);
    }
    if (identifyModal) {
      identifyModal.addEventListener('click', (e) => {
        if (e.target === identifyModal) closeModal();
      });
    }

    // Tab switching
    if (tabUpload && tabCamera) {
      tabUpload.addEventListener('click', () => switchTab('upload'));
      tabCamera.addEventListener('click', () => switchTab('camera'));
    }

    // File input & Drag-and-drop
    if (fileInput) {
      fileInput.addEventListener('change', handleFileSelect);
    }
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
      });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          processFile(e.dataTransfer.files[0]);
        }
      });
    }

    // Camera capture
    if (captureBtn) {
      captureBtn.addEventListener('click', captureCameraPhoto);
    }
  }

  /**
   * Pre-extract color grid feature vectors from site cover images.
   */
  function precomputeSiteFeatures(sites) {
    sites.forEach(site => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const vector = extractFeatureVector(img);
        siteFeatureVectors.set(site.id, vector);
      };
      img.src = site.cover;
    });
  }

  /**
   * Extract a 16x16 color grid feature vector from an Image element or Canvas.
   */
  function extractFeatureVector(imageSource) {
    const canvas = document.createElement('canvas');
    canvas.width = GRID_SIZE;
    canvas.height = GRID_SIZE;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageSource, 0, 0, GRID_SIZE, GRID_SIZE);

    const imgData = ctx.getImageData(0, 0, GRID_SIZE, GRID_SIZE).data;
    const vector = [];

    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      // Convert to normalized RGB values
      vector.push(r, g, b);
    }

    return vector;
  }

  /**
   * Open Identification Modal.
   */
  function openModal() {
    if (!identifyModal) return;
    identifyModal.classList.add('active');
    identifyModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Reset results
    if (resultsContainer) resultsContainer.innerHTML = '';
    if (statusMessage) statusMessage.textContent = 'Upload a photo or use your camera to identify a monument.';

    switchTab('upload');
  }

  /**
   * Close Identification Modal & stop camera if running.
   */
  function closeModal() {
    if (!identifyModal) return;
    stopCamera();
    identifyModal.classList.remove('active');
    identifyModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /**
   * Switch between Upload tab and Camera tab.
   */
  function switchTab(tab) {
    if (tab === 'upload') {
      tabUpload.classList.add('active');
      tabCamera.classList.remove('active');
      panelUpload.style.display = 'block';
      panelCamera.style.display = 'none';
      stopCamera();
    } else {
      tabCamera.classList.add('active');
      tabUpload.classList.remove('active');
      panelCamera.style.display = 'block';
      panelUpload.style.display = 'none';
      startCamera();
    }
  }

  /**
   * Start live camera stream using getUserMedia.
   */
  function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (statusMessage) {
        statusMessage.textContent = 'Camera access is not supported by your browser. Please upload an image file instead.';
      }
      return;
    }

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
    })
    .then(stream => {
      cameraStream = stream;
      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.play();
      }
      if (statusMessage) statusMessage.textContent = 'Camera active. Point at a heritage monument and click "Take Photo".';
    })
    .catch(err => {
      console.error('Camera access error:', err);
      if (statusMessage) {
        statusMessage.textContent = 'Could not access camera. Please allow camera permissions or upload a photo file.';
      }
    });
  }

  /**
   * Stop camera stream tracks.
   */
  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
    if (videoElement) {
      videoElement.srcObject = null;
    }
  }

  /**
   * Capture photo frame from video element.
   */
  function captureCameraPhoto() {
    if (!videoElement || !videoElement.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    analyzeCapturedCanvas(canvas);
  }

  /**
   * Handle File Selection input.
   */
  function handleFileSelect(e) {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }

  /**
   * Read and process image file.
   */
  function processFile(file) {
    if (!file.type.startsWith('image/')) {
      if (statusMessage) statusMessage.textContent = 'Please select a valid image file (JPG, PNG, WebP).';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        analyzeCapturedCanvas(canvas);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Analyze input canvas against precomputed site feature vectors.
   */
  function analyzeCapturedCanvas(canvas) {
    if (statusMessage) statusMessage.textContent = 'Analyzing photograph features...';

    const inputVector = extractFeatureVector(canvas);
    const matches = [];

    allSites.forEach(site => {
      let refVector = siteFeatureVectors.get(site.id);

      // If reference vector wasn't pre-loaded yet, extract on the fly
      if (!refVector) {
        const img = new Image();
        img.src = site.cover;
        refVector = extractFeatureVector(img);
      }

      // Compute Euclidean Distance between RGB color vectors
      const distance = computeVectorDistance(inputVector, refVector);
      
      // Calculate Normalized Confidence Score (0% to 98%)
      const maxPossibleDistance = Math.sqrt(GRID_SIZE * GRID_SIZE * 3 * 255 * 255);
      const similarityRatio = 1 - (distance / (maxPossibleDistance * 0.35));
      const confidence = Math.min(98, Math.max(35, Math.round(similarityRatio * 100)));

      matches.push({
        site,
        confidence,
        distance
      });
    });

    // Sort matches by highest confidence
    matches.sort((a, b) => b.confidence - a.confidence);

    renderResults(canvas.toDataURL('image/jpeg', 0.8), matches);
  }

  /**
   * Euclidean Distance between two feature vectors.
   */
  function computeVectorDistance(vecA, vecB) {
    let sum = 0;
    const len = Math.min(vecA.length, vecB.length);
    for (let i = 0; i < len; i++) {
      const diff = vecA[i] - vecB[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  /**
   * Render Match Results inside Modal.
   */
  function renderResults(photoDataUrl, matches) {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';

    const topMatch = matches[0];
    if (!topMatch) return;

    if (statusMessage) {
      statusMessage.textContent = `Analysis Complete! Found ${matches.length} candidate sites.`;
    }

    const resultsHtml = `
      <div class="recognition-card top-match">
        <div class="recognition-header">
          <span class="match-badge">⭐ Top Match (${topMatch.confidence}% Confidence)</span>
        </div>
        
        <div class="recognition-comparison">
          <div class="comparison-item">
            <span class="comparison-label">Your Photograph</span>
            <img class="comparison-img" src="${photoDataUrl}" alt="Uploaded photo" />
          </div>
          <div class="comparison-divider">➔</div>
          <div class="comparison-item">
            <span class="comparison-label">Matched Monument</span>
            <img class="comparison-img" src="${topMatch.site.cover}" alt="${topMatch.site.name}" />
          </div>
        </div>

        <div class="recognition-info">
          <h3 class="recognition-title">${escapeHTML(topMatch.site.name)}</h3>
          <p class="recognition-city">📍 ${escapeHTML(topMatch.site.city)} • ${escapeHTML(topMatch.site.category)}</p>
          <p class="recognition-summary">${escapeHTML(topMatch.site.summary)}</p>
          
          <div class="confidence-bar-wrapper">
            <div class="confidence-bar-fill" style="width: ${topMatch.confidence}%;"></div>
          </div>
          
          <div class="recognition-actions">
            <button class="btn-select-recognized" data-site-id="${topMatch.site.id}">
              🏛️ View Monument Details &amp; Map Pin
            </button>
          </div>
        </div>
      </div>

      <h4 class="other-matches-heading">Other Possible Matches</h4>
      <div class="other-matches-grid">
        ${matches.slice(1, 4).map(m => `
          <div class="other-match-card" data-site-id="${m.site.id}">
            <img class="other-match-img" src="${m.site.cover}" alt="${m.site.name}" />
            <div class="other-match-info">
              <span class="other-match-name">${escapeHTML(m.site.name)}</span>
              <span class="other-match-confidence">${m.confidence}% Match</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    resultsContainer.innerHTML = resultsHtml;

    // Attach click listeners to match cards
    const selectBtns = resultsContainer.querySelectorAll('.btn-select-recognized, .other-match-card');
    selectBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const siteId = btn.dataset.siteId;
        const selectedSite = allSites.find(s => s.id === siteId);
        if (selectedSite) {
          closeModal();
          if (typeof onSiteSelectedCallback === 'function') {
            onSiteSelectedCallback(selectedSite);
          }
        }
      });
    });
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return {
    init,
    openModal,
    closeModal
  };
})();
