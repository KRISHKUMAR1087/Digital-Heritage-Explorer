/**
 * Shareable Postcard Generator Module (HTML5 Canvas 1200x800)
 * Draws cover photo, site name, location, summary, and stamp seal onto a 1200x800 canvas and triggers PNG download.
 */
const PostcardComponent = (() => {
  
  /**
   * Generate and download a 1200x800 PNG Digital Heritage Postcard for a site.
   * @param {Object} site - Heritage site object.
   */
  function generatePostcard(site) {
    if (!site) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Background Fill & Vintage Border
    ctx.fillStyle = '#FAF5EC'; // Warm cream
    ctx.fillRect(0, 0, 1200, 800);

    // Outer Decorative Border
    ctx.strokeStyle = '#3B2A1A';
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, 1160, 760);

    ctx.strokeStyle = '#C9A36B'; // Sandstone Gold
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 32, 1136, 736);

    // Load Cover Photo
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Draw Hero Cover Photo inside upper frame
      const imgX = 50;
      const imgY = 50;
      const imgW = 1100;
      const imgH = 430;

      ctx.save();
      // Draw shadow under photo frame
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = '#3B2A1A';
      ctx.fillRect(imgX, imgY, imgW, imgH);
      ctx.restore();

      ctx.drawImage(img, imgX, imgY, imgW, imgH);

      // Category Pill Badge over photo
      ctx.fillStyle = '#B5502F'; // Terracotta
      ctx.fillRect(70, 70, 180, 38);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText((site.category || 'HERITAGE').toUpperCase(), 90, 95);

      // 2. Text Content Details
      const textYStart = 520;

      // Site Title
      ctx.fillStyle = '#3B2A1A';
      ctx.font = 'bold 38px Georgia, serif';
      const title = site.name || 'Heritage Site';
      ctx.fillText(title, 60, textYStart);

      // Location & Period Subtitle
      ctx.fillStyle = '#B5502F';
      ctx.font = 'bold 20px sans-serif';
      const subtitle = `📍 ${site.city}, Gujarat, India  •  ${site.period || 'Historical Era'}`;
      ctx.fillText(subtitle, 60, textYStart + 36);

      // Divider Line
      ctx.strokeStyle = '#C9A36B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, textYStart + 55);
      ctx.lineTo(820, textYStart + 55);
      ctx.stroke();

      // Short Summary Wrapped Text
      ctx.fillStyle = '#4A3B2C';
      ctx.font = '20px sans-serif';
      const summaryText = site.summary || site.description || '';
      wrapText(ctx, summaryText, 60, textYStart + 90, 760, 28);

      // 3. Heritage Stamp Emblem (Right Side)
      drawStampEmblem(ctx, 980, 620);

      // 4. Bottom Footer Watermark
      ctx.fillStyle = '#8C7A6B';
      ctx.font = '15px sans-serif';
      ctx.fillText('Digital Heritage Explorer  •  Preserving Cultural Treasures', 60, 755);

      // 5. Trigger PNG Download
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${site.id}-digital-postcard.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Failed to trigger postcard download:', err);
        alert('Could not generate postcard download on this browser.');
      }
    };

    img.onerror = () => {
      alert('Could not load site cover image for postcard generation.');
    };

    img.src = site.cover;
  }

  function drawStampEmblem(ctx, cx, cy) {
    ctx.save();

    // Outer Scalloped / Serrated Passport Stamp Circle
    ctx.strokeStyle = '#B5502F';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 75, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#B5502F';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 68, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Text
    ctx.fillStyle = '#B5502F';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PASSPORT STAMP', cx, cy - 25);
    
    ctx.font = '32px sans-serif';
    ctx.fillText('🏵️', cx, cy + 10);

    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('GUJARAT HERITAGE', cx, cy + 38);
    ctx.fillText('OFFICIAL SEAL', cx, cy + 54);

    ctx.restore();
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
        if (currentY > y + lineHeight * 3) break; // Limit to 4 lines max
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  return {
    generatePostcard
  };
})();

window.PostcardComponent = PostcardComponent;
