/**
 * Shareable Postcard Generator Module (HTML5 Canvas 1200x800)
 * Upgraded with template choices, custom message field, image chain fallbacks, and Web Share API support.
 */
const PostcardComponent = (() => {

  const TEMPLATES = {
    sandstone: { bg: '#FAF5EC', border: '#3B2A1A', accent: '#C9A36B', text: '#3B2A1A' },
    terracotta: { bg: '#3B2A1A', border: '#C9A36B', accent: '#B5502F', text: '#FAF5EC' },
    royal: { bg: '#FFF8E7', border: '#B5502F', accent: '#856404', text: '#3B2A1A' }
  };

  let previousBodyOverflow = '';

  /**
   * Loads candidate images sequentially until one succeeds or all fail.
   * Prevents out-of-order load races.
   */
  async function loadFirstValidImage(candidates) {
    for (const url of candidates) {
      if (!url) continue;
      try {
        const loadedImg = await new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load ${url}`));
          img.src = url;
        });
        return loadedImg;
      } catch (err) {
        // try next candidate
      }
    }
    return null;
  }

  /**
   * Helper to draw text with dynamic font size so long titles shrink to fit width.
   */
  function drawTitleShrinkToFit(ctx, text, x, y, maxWidth, initialFontSize = 38, fontStyle = 'bold Georgia, serif') {
    let fontSize = initialFontSize;
    ctx.font = `${fontSize}px ${fontStyle}`;
    while (ctx.measureText(text).width > maxWidth && fontSize > 18) {
      fontSize -= 2;
      ctx.font = `${fontSize}px ${fontStyle}`;
    }
    ctx.fillText(text, x, y);
  }

  /**
   * Generate and download / share a 1200x800 PNG Digital Heritage Postcard for a site.
   */
  async function generatePostcard(site, templateKey = 'sandstone', customMessage = '') {
    if (!site) return;

    const theme = TEMPLATES[templateKey] || TEMPLATES.sandstone;
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Background Fill & Vintage Border
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, 1200, 800);

    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, 1160, 760);

    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 32, 1136, 736);

    // 2. Candidate images chain: cover then every images[].src
    const imageCandidates = [];
    if (site.cover) imageCandidates.push(site.cover);
    if (Array.isArray(site.images)) {
      site.images.forEach(i => {
        const src = typeof i === 'string' ? i : i.src;
        if (src && !imageCandidates.includes(src)) {
          imageCandidates.push(src);
        }
      });
    }

    const loadedImg = await loadFirstValidImage(imageCandidates);

    const imgX = 50;
    const imgY = 50;
    const imgW = 1100;
    const imgH = 430;

    if (loadedImg) {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = theme.border;
      ctx.fillRect(imgX, imgY, imgW, imgH);
      ctx.restore();

      ctx.drawImage(loadedImg, imgX, imgY, imgW, imgH);
    } else {
      // Gradient / Fallback box
      const grad = ctx.createLinearGradient(imgX, imgY, imgX + imgW, imgY + imgH);
      grad.addColorStop(0, theme.accent);
      grad.addColorStop(1, theme.border);
      ctx.fillStyle = grad;
      ctx.fillRect(imgX, imgY, imgW, imgH);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(site.name || 'Gujarat Heritage Site', imgX + imgW / 2, imgY + imgH / 2);
      ctx.textAlign = 'left';
    }

    // Category Badge
    ctx.fillStyle = theme.accent;
    ctx.fillRect(70, 70, 180, 38);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText((site.category || 'HERITAGE').toUpperCase(), 90, 95);

    const textYStart = 520;

    // Site Title (shrinks long titles to fit)
    ctx.fillStyle = theme.text;
    const title = site.name || 'Heritage Site';
    drawTitleShrinkToFit(ctx, title, 60, textYStart, 760, 38, 'Georgia, serif');

    // Location Subtitle
    ctx.fillStyle = '#B5502F';
    ctx.font = 'bold 20px sans-serif';
    const subtitle = `📍 ${site.city || 'Gujarat'}, India  •  ${site.period || 'Historical Era'}`;
    ctx.fillText(subtitle, 60, textYStart + 36);

    // Divider Line
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, textYStart + 55);
    ctx.lineTo(820, textYStart + 55);
    ctx.stroke();

    // Summary or Custom Message
    ctx.fillStyle = theme.text;
    ctx.font = '20px sans-serif';
    const displayText = customMessage ? `"${customMessage}"` : (site.summary || site.description || '');
    wrapText(ctx, displayText, 60, textYStart + 90, 760, 28);

    // Heritage Stamp Emblem
    drawStampEmblem(ctx, 980, 620, theme);

    // Watermark
    ctx.fillStyle = theme.text;
    ctx.globalAlpha = 0.7;
    ctx.font = '15px sans-serif';
    ctx.fillText('Digital Heritage Explorer  •  Preserving Gujarat Cultural Treasures', 60, 755);
    ctx.globalAlpha = 1.0;

    // Trigger Web Share API or PNG Download with iOS open-image fallback
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }

        const filename = `${site.id || 'heritage'}-postcard.png`;
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        let shared = false;
        if (navigator.share && navigator.canShare) {
          try {
            const file = new File([blob], filename, { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: `Postcard from ${site.name}`,
                text: `Exploring ${site.name} in ${site.city}, Gujarat!`,
                files: [file]
              });
              shared = true;
            }
          } catch (e) {
            // Share cancelled or unhandled, proceed to download fallback
          }
        }

        if (!shared) {
          downloadOrOpenImage(blob, filename, isIOS);
        }
        resolve(true);
      }, 'image/png');
    });
  }

  function downloadOrOpenImage(blob, filename, isIOS) {
    const url = URL.createObjectURL(blob);
    if (isIOS) {
      // iOS open-image fallback
      const imgWindow = window.open(url, '_blank');
      if (!imgWindow) {
        window.location.href = url;
      }
    } else {
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    if (!text) return;
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
    ctx.rotate(-0.15);

    ctx.strokeStyle = '#B5502F';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 75, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 68, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#B5502F';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GUJARAT HERITAGE', 0, -35);
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('🏵️', 0, 8);
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('VERIFIED SITE', 0, 42);

    ctx.restore();
  }

  function openModal(site) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    generatePostcard(site);
  }

  function closeModal() {
    document.body.style.overflow = previousBodyOverflow || '';
  }

  return {
    generatePostcard,
    openModal,
    closeModal
  };
})();

window.PostcardComponent = PostcardComponent;
