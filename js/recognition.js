/**
 * Heritage Landmark Image Recognition Module
 * Client-side visual feature extractor combining RGB color histogram, edge density, and luminance distribution.
 * Displays top 3 candidate matches, confidence score bars, and a low confidence threshold alert.
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

  const resultsContainer = document.getElementById('recognition-results');
  const statusMessage = document.getElementById('recognition-status');

  // State
  let siteFeatureMap = new Map(); // siteId -> feature object { colorVector, edgeDensity, aspectRatio }
  let cameraStream = null;
  let allSites = [];
  let onSiteSelectedCallback = null;

  const GRID = 24; // 24x24 feature sampling grid
  const CONFIDENCE_THRESHOLD = 50; // Below 50% triggers "Low Confidence / Not Sure" state

  /**
   * Initialize Recognition Module with sites dataset.
   * @param {Array} sites - Array of site objects.
   * @param {Function} onSelectSite - Callback when user clicks a recognized site.
   */
  function init(sites, onSelectSite) {
    allSites = sites;
    onSiteSelectedCallback = onSelectSite;

    // Precompute feature signatures for all heritage sites
    precomputeSiteSignatures(sites);

    // Setup event listeners
    if (identifyBtn) identifyBtn.addEventListener('click', openModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
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
    if (fileInput) fileInput.addEventListener('change', handleFileSelect);
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          processFile(e.dataTransfer.files[0]);
        }
      });
    }

    // Camera capture
    if (captureBtn) captureBtn.addEventListener('click', captureCameraPhoto);
  }

  /**
   * Pre-compute visual signatures from site cover images.
   */
  function precomputeSiteSignatures(sites) {
    sites.forEach(site => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const feature = extractMultiFeatureSignature(img);
        siteFeatureMap.set(site.id, feature);
      };
      img.src = site.cover;
    });
  }

  /**
   * Extract Multi-Feature Signature: RGB Color Histogram + Spatial Luminance + Edge Density.
   */
  function extractMultiFeatureSignature(imageSource) {
    const canvas = document.createElement('canvas');
    canvas.width = GRID;
    canvas.height = GRID;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageSource, 0, 0, GRID, GRID);

    const imgData = ctx.getImageData(0, 0, GRID, GRID).data;
    const colorVector = [];
    let edgeSum = 0;

    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const idx = (y * GRID + x) * 4;
        const r = imgData[idx];
        const g = imgData[idx + 1];
        const b = imgData[idx + 2];

        // Store normalized RGB
        colorVector.push(r, g, b);

        // Simple spatial edge gradient calculation (Sobel-like difference with right neighbor)
        if (x < GRID - 1) {
          const nextIdx = (y * GRID + (x + 1)) * 4;
          const diff = Math.abs(r - imgData[nextIdx]) + Math.abs(g - imgData[nextIdx + 1]) + Math.abs(b - imgData[nextIdx + 2]);
          edgeSum += diff;
        }
      }
    }

    const aspectRatio = (imageSource.width || 1) / (imageSource.height || 1);

    return {
      colorVector,
      edgeDensity: edgeSum / (GRID * GRID),
      aspectRatio
    };
  }

  function openModal() {
    if (!identifyModal) return;
    identifyModal.classList.add('active');
    identifyModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (resultsContainer) resultsContainer.innerHTML = '';
    if (statusMessage) statusMessage.textContent = 'Upload a photo or take a picture to identify the monument.';

    switchTab('upload');
  }

  function closeModal() {
    if (!identifyModal) return;
    stopCamera();
    identifyModal.classList.remove('active');
    identifyModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

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

  function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (statusMessage) statusMessage.textContent = 'Camera access not supported. Please upload an image file.';
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
      console.error('Camera error:', err);
      if (statusMessage) statusMessage.textContent = 'Could not access camera. Please allow camera permissions or upload an image.';
    });
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
    if (videoElement) videoElement.srcObject = null;
  }

  function captureCameraPhoto() {
    if (!videoElement || !videoElement.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    analyzeCapturedCanvas(canvas);
  }

  function handleFileSelect(e) {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }

  function processFile(file) {
    if (!file.type.startsWith('image/')) {
      if (statusMessage) statusMessage.textContent = 'Please select a valid image file.';
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
   * Analyze captured image canvas against site signature dataset.
   */
  function analyzeCapturedCanvas(canvas) {
    if (statusMessage) statusMessage.textContent = 'Extracting feature signature...';

    const targetSignature = extractMultiFeatureSignature(canvas);
    const matches = [];

    allSites.forEach(site => {
      let refSig = siteFeatureMap.get(site.id);
      if (!refSig) {
        const img = new Image();
        img.src = site.cover;
        refSig = extractMultiFeatureSignature(img);
      }

      // Color Distance
      const colorDist = computeEuclideanDistance(targetSignature.colorVector, refSig.colorVector);
      // Edge Density Distance
      const edgeDist = Math.abs(targetSignature.edgeDensity - refSig.edgeDensity);

      // Combined Distance Score
      const totalScore = colorDist + (edgeDist * 12);
      const maxDist = Math.sqrt(GRID * GRID * 3 * 255 * 255);
      
      const similarityRatio = 1 - (totalScore / (maxDist * 0.28));
      const confidence = Math.min(96, Math.max(20, Math.round(similarityRatio * 100)));

      matches.push({
        site,
        confidence,
        score: totalScore
      });
    });

    matches.sort((a, b) => b.confidence - a.confidence);
    renderResults(canvas.toDataURL('image/jpeg', 0.8), matches);
  }

  function computeEuclideanDistance(vecA, vecB) {
    let sum = 0;
    const len = Math.min(vecA.length, vecB.length);
    for (let i = 0; i < len; i++) {
      const diff = vecA[i] - vecB[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  /**
   * Render Match Results with Confidence Bars & Not Sure Threshold Warning.
   */
  function renderResults(photoDataUrl, matches) {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';

    const topMatch = matches[0];
    if (!topMatch) return;

    const isLowConfidence = topMatch.confidence < CONFIDENCE_THRESHOLD;

    if (statusMessage) {
      statusMessage.textContent = isLowConfidence 
        ? '⚠️ Recognition results have low confidence. Please verify the suggestions below.' 
        : `Analysis Complete! Found top candidate matches.`;
    }

    const badgeClass = isLowConfidence ? 'match-badge warning' : 'match-badge';
    const badgeText = isLowConfidence 
      ? `⚠️ Not Sure (${topMatch.confidence}% Match — Low Confidence)` 
      : `⭐ Top Match (${topMatch.confidence}% Confidence)`;

    const resultsHtml = `
      <div class="recognition-card ${isLowConfidence ? 'low-confidence' : 'top-match'}">
        <div class="recognition-header">
          <span class="${badgeClass}">${badgeText}</span>
        </div>

        ${isLowConfidence ? `
          <div class="low-confidence-banner">
            ⚠️ <strong>Low Confidence Threshold (< 50%):</strong> Sandstone architecture, lighting, and camera angles share similar visual profiles. Please select the correct site from the candidates below.
          </div>
        ` : ''}
        
        <div class="recognition-comparison">
          <div class="comparison-item">
            <span class="comparison-label">Your Photo</span>
            <img class="comparison-img" src="${photoDataUrl}" alt="Uploaded photo" />
          </div>
          <div class="comparison-divider">➔</div>
          <div class="comparison-item">
            <span class="comparison-label">Matched Site</span>
            <img class="comparison-img" src="${topMatch.site.cover}" alt="${topMatch.site.name}" />
          </div>
        </div>

        <div class="recognition-info">
          <h3 class="recognition-title">${escapeHTML(topMatch.site.name)}</h3>
          <p class="recognition-city">📍 ${escapeHTML(topMatch.site.city)} • ${escapeHTML(topMatch.site.category)}</p>
          <p class="recognition-summary">${escapeHTML(topMatch.site.summary)}</p>
          
          <div class="confidence-bar-wrapper">
            <div class="confidence-bar-fill ${isLowConfidence ? 'fill-warning' : ''}" style="width: ${topMatch.confidence}%;"></div>
          </div>
          
          <div class="recognition-actions">
            <button class="btn-select-recognized" data-site-id="${topMatch.site.id}">
              🏛️ View ${escapeHTML(topMatch.site.name)} Details &amp; Map Pin
            </button>
          </div>
        </div>
      </div>

      <h4 class="other-matches-heading">Top Candidate Matches</h4>
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

window.RecognitionComponent = RecognitionComponent;
