/**
 * Shareable Digital Heritage Postcard Generator Module (HTML5 Canvas 1200x800)
 * Provides interactive modal preview, template themes, custom messaging, and reliable PNG downloading.
 */
const PostcardComponent = (() => {

  const TEMPLATES = {
    sandstone: {
      id: 'sandstone',
      bg: '#FAF5EC',
      border: '#3B2A1A',
      innerBorder: '#C9A36B',
      accent: '#B5502F',
      text: '#3B2A1A',
      subtext: '#615042',
      badgeBg: '#B5502F',
      badgeText: '#FAF5EC',
      divider: '#C9A36B'
    },
    terracotta: {
      id: 'terracotta',
      bg: '#3B2A1A',
      border: '#C9A36B',
      innerBorder: '#B5502F',
      accent: '#FFD700',
      text: '#FAF5EC',
      subtext: '#E2D0B5',
      badgeBg: '#B5502F',
      badgeText: '#FAF5EC',
      divider: '#C9A36B'
    },
    royal: {
      id: 'royal',
      bg: '#FFFDF7',
      border: '#856404',
      innerBorder: '#E6B800',
      accent: '#856404',
      text: '#24180E',
      subtext: '#5A4634',
      badgeBg: '#856404',
      badgeText: '#FFFDF7',
      divider: '#E6B800'
    }
  };

  let currentSite = null;
  let currentThemeKey = 'sandstone';
  let modalInitialized = false;

  // DOM elements
  let modalEl = null;
  let closeBtn = null;
  let canvasEl = null;
  let customMsgInput = null;
  let downloadBtn = null;
  let shareBtn = null;
  let statusMsg = null;
  let spinnerEl = null;

  function init() {
    if (modalInitialized) return;

    modalEl = document.getElementById('postcard-modal');
    closeBtn = document.getElementById('postcard-modal-close-btn');
    canvasEl = document.getElementById('postcard-preview-canvas');
    customMsgInput = document.getElementById('postcard-custom-msg');
    downloadBtn = document.getElementById('btn-postcard-download-now');
    shareBtn = document.getElementById('btn-postcard-share-now');
    statusMsg = document.getElementById('postcard-status-msg');
    spinnerEl = document.getElementById('postcard-loading-spinner');

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    if (modalEl) {
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) closeModal();
      });
    }

    // Theme selector buttons
    const themeBtns = document.querySelectorAll('.postcard-theme-btn');
    themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentThemeKey = btn.dataset.theme || 'sandstone';
        renderPostcardPreview();
      });
    });

    // Custom message input with live preview
    if (customMsgInput) {
      let debounce = null;
      customMsgInput.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          renderPostcardPreview();
        }, 150);
      });
    }

    // Action buttons
    if (downloadBtn) {
      downloadBtn.addEventListener('click', triggerDownload);
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', triggerShare);
    }

    modalInitialized = true;
  }

  /**
   * Open Postcard Preview & Generator Modal
   * @param {Object} site 
   */
  function openModal(site) {
    init();
    if (!site) return;
    currentSite = site;

    if (!modalEl) {
      // Fallback: direct download if modal markup not present
      generatePostcard(site);
      return;
    }

    // Reset input
    if (customMsgInput) {
      customMsgInput.value = '';
    }
    if (statusMsg) {
      statusMsg.textContent = '';
      statusMsg.className = 'postcard-status-hint';
    }

    modalEl.classList.add('active');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    renderPostcardPreview();
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove('active');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /**
   * Render the postcard onto the canvas
   */
  function renderPostcardPreview(onReadyCallback) {
    if (!currentSite || !canvasEl) return;

    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    if (spinnerEl) spinnerEl.style.display = 'flex';

    const theme = TEMPLATES[currentThemeKey] || TEMPLATES.sandstone;
    const customMessage = customMsgInput ? customMsgInput.value.trim() : '';

    // Draw background and borders immediately
    drawBaseCard(ctx, theme, currentSite, customMessage);

    // Load site cover image
    const img = new Image();

    // Only set crossOrigin if URL is remote HTTP(S) to prevent taint on local relative paths
    if (currentSite.cover && (currentSite.cover.startsWith('http://') || currentSite.cover.startsWith('https://'))) {
      img.crossOrigin = 'anonymous';
    }

    const onImageDrawn = () => {
      if (spinnerEl) spinnerEl.style.display = 'none';
      if (typeof onReadyCallback === 'function') onReadyCallback();
    };

    img.onload = () => {
      drawPostcardPhoto(ctx, img, theme, currentSite);
      // Re-draw text & emblem over photo area if needed
      drawPostcardText(ctx, theme, currentSite, customMessage);
      onImageDrawn();
    };

    img.onerror = () => {
      // Draw elegant artistic gradient banner fallback
      drawFallbackBanner(ctx, theme, currentSite);
      drawPostcardText(ctx, theme, currentSite, customMessage);
      onImageDrawn();
    };

    img.src = currentSite.cover || '';
  }

  function drawBaseCard(ctx, theme, site, message) {
    ctx.clearRect(0, 0, 1200, 800);

    // 1. Background Fill
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, 1200, 800);

    // 2. Outer vintage double border
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 14;
    ctx.strokeRect(18, 18, 1164, 764);

    ctx.strokeStyle = theme.innerBorder;
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 32, 1136, 736);

    // 3. Photo frame placeholder
    ctx.fillStyle = theme.innerBorder;
    ctx.fillRect(48, 48, 1104, 434);

    drawPostcardText(ctx, theme, site, message);
  }

  function drawPostcardPhoto(ctx, img, theme, site) {
    const x = 50;
    const y = 50;
    const w = 1100;
    const h = 430;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, w, h);
    ctx.restore();

    // Maintain aspect ratio cover fill
    const imgRatio = img.width / img.height;
    const targetRatio = w / h;
    let sWidth = img.width;
    let sHeight = img.height;
    let sx = 0;
    let sy = 0;

    if (imgRatio > targetRatio) {
      sWidth = img.height * targetRatio;
      sx = (img.width - sWidth) / 2;
    } else {
      sHeight = img.width / targetRatio;
      sy = (img.height - sHeight) / 2;
    }

    try {
      ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
    } catch (e) {
      // In case of drawImage error, fill with solid color
      ctx.fillStyle = theme.accent;
      ctx.fillRect(x, y, w, h);
    }

    // Photo Category Badge
    const category = (site.category || 'HERITAGE').toUpperCase();
    ctx.save();
    ctx.fillStyle = theme.badgeBg;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 6;
    ctx.fillRect(66, 66, 170, 36);
    ctx.restore();

    ctx.fillStyle = theme.badgeText;
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(category, 151, 90);
    ctx.textAlign = 'left';
  }

  function drawFallbackBanner(ctx, theme, site) {
    const x = 50;
    const y = 50;
    const w = 1100;
    const h = 430;

    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, '#3B2A1A');
    grad.addColorStop(0.5, '#B5502F');
    grad.addColorStop(1, '#C9A36B');

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = '#FAF5EC';
    ctx.font = 'bold 36px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(site.name || 'Gujarat Heritage Site', 600, 250);
    ctx.font = '20px sans-serif';
    ctx.fillText(`📍 ${site.city || 'Gujarat'}, India`, 600, 290);
    ctx.textAlign = 'left';
  }

  function drawPostcardText(ctx, theme, site, customMessage) {
    const textYStart = 525;

    // Site Title
    ctx.fillStyle = theme.text;
    ctx.font = 'bold 38px Georgia, serif';
    const siteTitle = site.name || 'Gujarat Heritage Monument';
    ctx.fillText(siteTitle, 55, textYStart);

    // Location Subtitle
    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    const subtitle = `📍 ${site.city || 'Gujarat'}, India  •  ${site.period || 'Historical Era'}`;
    ctx.fillText(subtitle, 55, textYStart + 35);

    // Ornamental Divider Line
    ctx.strokeStyle = theme.divider;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(55, textYStart + 52);
    ctx.lineTo(840, textYStart + 52);
    ctx.stroke();

    // Summary / Personal Message
    ctx.fillStyle = theme.subtext;
    ctx.font = customMessage ? 'italic 21px Georgia, serif' : '19px system-ui, -apple-system, sans-serif';
    const displayText = customMessage ? `"${customMessage}"` : (site.summary || site.description || 'A timeless jewel of Gujarat cultural heritage.');
    wrapText(ctx, displayText, 55, textYStart + 86, 780, 28);

    // Heritage Stamp Emblem
    drawStampEmblem(ctx, 990, 625, theme);

    // Watermark / Brand Footer
    ctx.fillStyle = theme.subtext;
    ctx.globalAlpha = 0.8;
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.fillText('🏛️ Digital Heritage Explorer  •  Preserving Gujarat Cultural Heritage', 55, 755);
    ctx.globalAlpha = 1.0;
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
        if (currentY > y + lineHeight * 3) {
          ctx.fillText(line.trim() + '...', x, currentY);
          return;
        }
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  function drawStampEmblem(ctx, x, y, theme) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.12);

    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 72, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 65, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GUJARAT HERITAGE', 0, -32);
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('🏵️', 0, 8);
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText('VERIFIED POSTCARD', 0, 42);

    ctx.restore();
  }

  /**
   * Trigger PNG Download directly from canvas
   */
  function triggerDownload() {
    if (!canvasEl || !currentSite) return;

    if (downloadBtn) {
      downloadBtn.textContent = '⏳ Preparing Download...';
      downloadBtn.disabled = true;
    }

    const fileName = `heritage-postcard-${currentSite.id || 'monument'}.png`;

    try {
      // 1. First attempt toBlob
      canvasEl.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, fileName);
          onDownloadSuccess();
        } else {
          // Fallback to dataURL
          fallbackDataUrlDownload(fileName);
        }
      }, 'image/png');
    } catch (err) {
      console.warn('[Postcard] toBlob failed, attempting toDataURL fallback:', err.message);
      fallbackDataUrlDownload(fileName);
    }
  }

  function fallbackDataUrlDownload(fileName) {
    try {
      const dataUrl = canvasEl.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onDownloadSuccess();
    } catch (e) {
      console.error('[Postcard] Download failed:', e);
      if (statusMsg) {
        statusMsg.textContent = '⚠️ Could not generate image file. Please right-click the preview above and choose "Save image as".';
        statusMsg.className = 'postcard-status-hint error';
      }
      resetDownloadBtn();
    }
  }

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }

  function onDownloadSuccess() {
    if (statusMsg) {
      statusMsg.textContent = '✅ Postcard downloaded successfully!';
      statusMsg.className = 'postcard-status-hint success';
    }
    resetDownloadBtn();
  }

  function resetDownloadBtn() {
    if (downloadBtn) {
      downloadBtn.textContent = '📥 Download Postcard (PNG)';
      downloadBtn.disabled = false;
    }
  }

  /**
   * Trigger Web Share API
   */
  async function triggerShare() {
    if (!canvasEl || !currentSite) return;

    if (!navigator.share) {
      triggerDownload();
      return;
    }

    try {
      canvasEl.toBlob(async (blob) => {
        if (!blob) {
          triggerDownload();
          return;
        }

        const file = new File([blob], `${currentSite.id}-postcard.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Postcard from ${currentSite.name}`,
            text: `Check out this digital postcard from ${currentSite.name} in ${currentSite.city}, Gujarat!`,
            files: [file]
          });
        } else {
          await navigator.share({
            title: `Postcard from ${currentSite.name}`,
            text: `Check out this digital postcard from ${currentSite.name} in ${currentSite.city}, Gujarat!`,
            url: window.location.href
          });
        }
      }, 'image/png');
    } catch (err) {
      console.warn('[Postcard] Web Share cancelled or unsupported:', err);
    }
  }

  /**
   * Backward compatible direct download method
   */
  function generatePostcard(site, templateKey = 'sandstone', customMessage = '') {
    currentSite = site;
    currentThemeKey = templateKey;
    openModal(site);
  }

  return {
    init,
    openModal,
    closeModal,
    generatePostcard
  };
})();

