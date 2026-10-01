/**
 * Shareable Postcard Generator Module (HTML5 Canvas 1200x800)
 * Upgraded with template choices, custom message field, and Web Share API support.
 */
const PostcardComponent = (() => {

  const TEMPLATES = {
    sandstone: { bg: '#FAF5EC', border: '#3B2A1A', accent: '#C9A36B', text: '#3B2A1A' },
    terracotta: { bg: '#3B2A1A', border: '#C9A36B', accent: '#B5502F', text: '#FAF5EC' },
    royal: { bg: '#FFF8E7', border: '#B5502F', accent: '#856404', text: '#3B2A1A' }
  };

  /**
   * Generate and download / share a 1200x800 PNG Digital Heritage Postcard for a site.
   * @param {Object} site - Heritage site object.
   * @param {string} [templateKey='sandstone']
   * @param {string} [customMessage='']
   */
  function generatePostcard(site, templateKey = 'sandstone', customMessage = '') {
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

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const imgX = 50;
      const imgY = 50;
      const imgW = 1100;
      const imgH = 430;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = theme.border;
      ctx.fillRect(imgX, imgY, imgW, imgH);
      ctx.restore();

      ctx.drawImage(img, imgX, imgY, imgW, imgH);

      // Category Badge
      ctx.fillStyle = theme.accent;
      ctx.fillRect(70, 70, 180, 38);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText((site.category || 'HERITAGE').toUpperCase(), 90, 95);

      const textYStart = 520;

      // Site Title
      ctx.fillStyle = theme.text;
      ctx.font = 'bold 38px Georgia, serif';
      const title = site.name || 'Heritage Site';
      ctx.fillText(title, 60, textYStart);

      // Location Subtitle
      ctx.fillStyle = '#B5502F';
      ctx.font = 'bold 20px sans-serif';
      const subtitle = `📍 ${site.city}, Gujarat, India  •  ${site.period || 'Historical Era'}`;
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

      // Trigger Web Share API or PNG Download
      canvas.toBlob((blob) => {
        if (!blob) return;

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'postcard.png', { type: 'image/png' })] })) {
          const file = new File([blob], `${site.id}-postcard.png`, { type: 'image/png' });
          navigator.share({
            title: `Postcard from ${site.name}`,
            text: `Exploring ${site.name} in ${site.city}, Gujarat!`,
            files: [file]
          }).catch(() => downloadBlob(blob, site.id));
        } else {
          downloadBlob(blob, site.id);
        }
      }, 'image/png');
    };

    img.onerror = () => {
      ctx.fillStyle = theme.accent;
      ctx.fillRect(50, 50, 1100, 430);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(site.name, 100, 250);
    };

    img.src = site.cover;
  }

  function downloadBlob(blob, siteId) {
    const link = document.createElement('a');
    link.download = `heritage-postcard-${siteId}.png`;
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return {
    generatePostcard
  };
})();
