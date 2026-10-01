/**
 * 3D & 360° Heritage Street View Explorer Module
 * Interactive 360° Virtual Street View Tour with Hotspots + 3D Architectural Orbit Model (WebGL / 3D Canvas).
 */
const ThreeDExplorerComponent = (() => {
  let container = null;
  let currentSite = null;

  // View state
  let currentMode = '360'; // '360' or '3d'
  let yaw = 0; // 0 to 360 degrees
  let pitch = 0; // -45 to 45 degrees
  let zoom = 1.0; // 1.0 to 2.5
  let rotX = 20; // 3D Orbit Rotations
  let rotY = 45;
  let isAutoRotate = true;
  let isWireframe = false;
  let animationFrameId = null;
  let activeHotspot = null;

  function render(site, targetEl) {
    container = targetEl;
    if (!container) return;

    if (!site || !site.threeD) {
      container.style.display = 'none';
      container.innerHTML = '';
      stopAnimation();
      return;
    }

    currentSite = site;
    yaw = 0;
    pitch = 0;
    zoom = 1.0;
    rotX = 20;
    rotY = 45;
    activeHotspot = null;

    container.style.display = 'block';
    renderLayout();
  }

  function stopAnimation() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  function renderLayout() {
    if (!container || !currentSite) return;

    const threeD = currentSite.threeD;

    container.innerHTML = `
      <div class="threed-card" tabindex="0" aria-label="3D & 360 Street View Explorer">
        <div class="threed-header">
          <div class="threed-title-group">
            <span class="threed-icon">🌐</span>
            <div>
              <h3 class="threed-title">3D &amp; 360° Heritage Street View Explorer</h3>
              <p class="threed-subtitle">Interactive 360° virtual tour and 3D architectural model viewer</p>
            </div>
          </div>

          <!-- Mode Switcher -->
          <div class="threed-mode-tabs" role="tablist">
            <button type="button" class="threed-tab ${currentMode === '360' ? 'active' : ''}" data-mode="360" role="tab">
              🔄 360° Street View Tour
            </button>
            <button type="button" class="threed-tab ${currentMode === '3d' ? 'active' : ''}" data-mode="3d" role="tab">
              🧊 3D Architectural Model
            </button>
          </div>
        </div>

        <!-- 3D / 360° Viewer Canvas Stage -->
        <div class="threed-stage-wrapper" id="threed-stage-wrapper">
          <canvas id="threed-canvas" class="threed-canvas" width="680" height="360"></canvas>

          <!-- Top-Right Controls Overlay -->
          <div class="threed-overlay-controls">
            <button type="button" class="ctrl-btn" id="btn-zoom-in" title="Zoom In (+)">➕</button>
            <button type="button" class="ctrl-btn" id="btn-zoom-out" title="Zoom Out (-)">➖</button>
            <button type="button" class="ctrl-btn" id="btn-reset-view" title="Reset View">🏠</button>

            ${currentMode === '3d' ? `
              <button type="button" class="ctrl-btn ${isAutoRotate ? 'active' : ''}" id="btn-toggle-autorotate" title="Toggle Auto-Rotation">🔄</button>
              <button type="button" class="ctrl-btn ${isWireframe ? 'active' : ''}" id="btn-toggle-wireframe" title="Toggle Wireframe Mode">🌐</button>
            ` : ''}
          </div>

          <span class="threed-hint">
            ${currentMode === '360' ? '👈 Click & drag mouse/touch to look 360° around. Click pins for details.' : '👈 Drag to orbit 3D model. Scroll to zoom.'}
          </span>
        </div>

        <!-- Hotspot Info Details Banner -->
        ${activeHotspot ? `
          <div class="threed-hotspot-card">
            <div class="hotspot-header">
              <span class="hotspot-badge">📍 360° Landmark Point</span>
              <h4 class="hotspot-title">${escapeHTML(activeHotspot.title)}</h4>
            </div>
            <p class="hotspot-desc">${escapeHTML(activeHotspot.desc)}</p>
          </div>
        ` : ''}
      </div>
    `;

    setupCanvas();
    setupEvents();
  }

  function setupCanvas() {
    stopAnimation();
    const canvas = container.querySelector('#threed-canvas');
    if (!canvas) return;

    if (currentMode === '360') {
      draw360Panorama(canvas);
    } else {
      start3DOrbitLoop(canvas);
    }
  }

  // ----------------------------------------------------
  // MODE 1: 360° Panoramic Street View Renderer
  // ----------------------------------------------------
  function draw360Panorama(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      render360Frame(ctx, canvas, img);
    };

    img.src = currentSite.cover;
  }

  function render360Frame(ctx, canvas, img) {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Normalize Yaw (0 - 360)
    let normYaw = ((yaw % 360) + 360) % 360;
    const pitchOffset = (pitch / 45) * 80;

    // Draw panoramic image repeated horizontally for continuous 360 loop
    const subW = w * zoom;
    const subH = h * zoom;

    const offsetX = (normYaw / 360) * subW;
    const drawY = (h - subH) / 2 + pitchOffset;

    // Draw left & right continuous pan slices
    ctx.drawImage(img, -offsetX, drawY, subW, subH);
    ctx.drawImage(img, subW - offsetX, drawY, subW, subH);
    ctx.drawImage(img, -subW - offsetX, drawY, subW, subH);

    // Render 360° Hotspot Pins
    if (currentSite.threeD && currentSite.threeD.hotspots) {
      currentSite.threeD.hotspots.forEach(hotspot => {
        let diffYaw = hotspot.yaw - normYaw;
        while (diffYaw < -180) diffYaw += 360;
        while (diffYaw > 180) diffYaw -= 360;

        // Map Yaw (-180 to 180) -> Canvas X (0 to w)
        const pinX = (w / 2) + (diffYaw / (180 / zoom)) * (w / 2);
        const pinY = (h / 2) + (hotspot.pitch / 45) * (h / 3) + pitchOffset;

        if (pinX >= 20 && pinX <= w - 20 && pinY >= 20 && pinY <= h - 20) {
          drawHotspotPin(ctx, pinX, pinY, hotspot);
        }
      });
    }
  }

  function drawHotspotPin(ctx, x, y, hotspot) {
    const isSelected = activeHotspot && activeHotspot.title === hotspot.title;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, isSelected ? 12 : 9, 0, Math.PI * 2);
    ctx.fillStyle = isSelected ? '#FFD700' : '#B5502F';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Icon
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📍', x, y);

    // Label tag
    ctx.fillStyle = isSelected ? '#3B2A1A' : 'rgba(36, 24, 14, 0.85)';
    ctx.fillRect(x - 45, y - 28, 90, 18);
    ctx.fillStyle = isSelected ? '#FFD700' : '#FFFFFF';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(escapeHTML(hotspot.title.substring(0, 14)), x, y - 19);

    ctx.restore();
  }

  // ----------------------------------------------------
  // MODE 2: 3D Architectural Orbit Model Renderer (Canvas 3D Engine)
  // ----------------------------------------------------
  function start3DOrbitLoop(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function renderLoop() {
      if (currentMode !== '3d') return;

      if (isAutoRotate) {
        rotY = (rotY + 0.8) % 360;
      }

      draw3DModelFrame(ctx, canvas);
      animationFrameId = requestAnimationFrame(renderLoop);
    }

    stopAnimation();
    renderLoop();
  }

  function draw3DModelFrame(ctx, canvas) {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Dark heritage grid background
    ctx.fillStyle = '#1A120B';
    ctx.fillRect(0, 0, w, h);

    // Draw 3D floor grid
    draw3DFloorGrid(ctx, w, h);

    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;

    // Get 3D Vertices for site model type
    const modelType = (currentSite.threeD && currentSite.threeD.modelType) || 'temple';
    const meshData = getMonument3DMesh(modelType);

    // Project 3D points -> 2D Canvas
    const projectedPoints = meshData.vertices.map(v => project3Dto2D(v, radX, radY, zoom, w, h));

    // Draw 3D Polygons / Faces with depth sorting
    const sortedFaces = meshData.faces.map(face => {
      let avgZ = 0;
      face.indices.forEach(idx => {
        avgZ += projectedPoints[idx].z;
      });
      avgZ /= face.indices.length;
      return { face, avgZ };
    }).sort((a, b) => b.avgZ - a.avgZ);

    sortedFaces.forEach(item => {
      const face = item.face;
      ctx.beginPath();
      const p0 = projectedPoints[face.indices[0]];
      ctx.moveTo(p0.x, p0.y);

      for (let i = 1; i < face.indices.length; i++) {
        const pt = projectedPoints[face.indices[i]];
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();

      if (isWireframe) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      } else {
        ctx.fillStyle = face.color || '#C9A36B';
        ctx.fill();
        ctx.strokeStyle = '#3B2A1A';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  }

  function draw3DFloorGrid(ctx, w, h) {
    ctx.strokeStyle = 'rgba(201, 163, 107, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, h - 60);
      ctx.lineTo(x + (x - w/2) * 0.4, h);
      ctx.stroke();
    }
  }

  function project3Dto2D(v, radX, radY, scale, w, h) {
    // 3D Matrix Rotation
    let x = v[0];
    let y = v[1];
    let z = v[2];

    // Rotate Y (Yaw)
    let x1 = x * Math.cos(radY) + z * Math.sin(radY);
    let z1 = -x * Math.sin(radY) + z * Math.cos(radY);

    // Rotate X (Pitch)
    let y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
    let z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

    // Perspective Projection
    const distance = 400;
    const fovFactor = distance / (distance + z2 + 200);

    const projX = (w / 2) + x1 * fovFactor * scale * 1.4;
    const projY = (h / 2) - y2 * fovFactor * scale * 1.4;

    return { x: projX, y: projY, z: z2 };
  }

  function getMonument3DMesh(type) {
    if (type === 'stepwell') {
      // 7-Storey subterranean inverted pyramid mesh
      const vertices = [
        // Level 1 top
        [-120, 80, -80], [120, 80, -80], [120, 80, 80], [-120, 80, 80],
        // Level 3 mid
        [-90, 20, -60], [90, 20, -60], [90, 20, 60], [-90, 20, 60],
        // Level 5 deep
        [-60, -40, -40], [60, -40, -40], [60, -40, 40], [-60, -40, 40],
        // Well shaft bottom
        [-30, -100, -30], [30, -100, -30], [30, -100, 30], [-30, -100, 30]
      ];

      const faces = [
        { indices: [0, 1, 2, 3], color: '#E6C280' },
        { indices: [4, 5, 6, 7], color: '#C9A36B' },
        { indices: [8, 9, 10, 11], color: '#A8824A' },
        { indices: [12, 13, 14, 15], color: '#1E90FF' }, // Water
        // Walls
        { indices: [0, 1, 5, 4], color: '#B5502F' },
        { indices: [1, 2, 6, 5], color: '#8C3D21' },
        { indices: [4, 5, 9, 8], color: '#994426' },
        { indices: [8, 9, 13, 12], color: '#662D19' }
      ];
      return { vertices, faces };
    } else {
      // Sun Temple 3D Sanctum, Shikhara Pyramid & Sabha Mandapa
      const vertices = [
        // Base
        [-100, -60, -100], [100, -60, -100], [100, -60, 100], [-100, -60, 100],
        // Guda Mandapa (Sanctum)
        [-80, 30, -80], [0, 30, -80], [0, 30, 0], [-80, 30, 0],
        // Shikhara Spire Top
        [-40, 110, -40],
        // Sabha Mandapa
        [10, 20, -70], [90, 20, -70], [90, 20, 70], [10, 20, 70],
        // Surya Kunda Tank Base
        [100, -60, -60], [160, -60, -60], [160, -60, 60], [100, -60, 60],
        [110, -90, -40], [150, -90, -40], [150, -90, 40], [110, -90, 40]
      ];

      const faces = [
        { indices: [0, 1, 2, 3], color: '#D2B48C' },
        { indices: [4, 5, 6, 7], color: '#C9A36B' },
        // Spire Pyramid
        { indices: [4, 5, 8], color: '#B5502F' },
        { indices: [5, 6, 8], color: '#8C3D21' },
        { indices: [6, 7, 8], color: '#B5502F' },
        { indices: [7, 4, 8], color: '#8C3D21' },
        // Sabha Mandapa
        { indices: [9, 10, 11, 12], color: '#FFD700' },
        // Tank Water
        { indices: [16, 17, 18, 19], color: '#4169E1' }
      ];
      return { vertices, faces };
    }
  }

  function setupEvents() {
    if (!container) return;

    // Mode tabs
    const modeTabs = container.querySelectorAll('.threed-tab');
    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        currentMode = tab.getAttribute('data-mode');
        renderLayout();
      });
    });

    // Control overlay buttons
    const btnZoomIn = container.querySelector('#btn-zoom-in');
    if (btnZoomIn) btnZoomIn.addEventListener('click', () => { zoom = Math.min(2.5, zoom + 0.25); setupCanvas(); });

    const btnZoomOut = container.querySelector('#btn-zoom-out');
    if (btnZoomOut) btnZoomOut.addEventListener('click', () => { zoom = Math.max(0.8, zoom - 0.25); setupCanvas(); });

    const btnReset = container.querySelector('#btn-reset-view');
    if (btnReset) btnReset.addEventListener('click', () => { yaw = 0; pitch = 0; zoom = 1.0; rotX = 20; rotY = 45; setupCanvas(); });

    const btnAutoRot = container.querySelector('#btn-toggle-autorotate');
    if (btnAutoRot) btnAutoRot.addEventListener('click', () => { isAutoRotate = !isAutoRotate; setupCanvas(); });

    const btnWire = container.querySelector('#btn-toggle-wireframe');
    if (btnWire) btnWire.addEventListener('click', () => { isWireframe = !isWireframe; setupCanvas(); });

    // Drag / Orbit Touch & Mouse Interaction
    const wrapper = container.querySelector('#threed-stage-wrapper');
    const canvas = container.querySelector('#threed-canvas');

    let isDragging = false;
    let startX = 0;
    let startY = 0;

    if (wrapper && canvas) {
      wrapper.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        // Check if hotspot clicked in 360 mode
        if (currentMode === '360') {
          checkHotspotClick(e.clientX, e.clientY, canvas);
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        startX = e.clientX;
        startY = e.clientY;

        if (currentMode === '360') {
          yaw += dx * 0.4;
          pitch = Math.max(-45, Math.min(45, pitch + dy * 0.3));
          draw360Panorama(canvas);
        } else {
          rotY = (rotY + dx * 0.5) % 360;
          rotX = Math.max(-60, Math.min(60, rotX - dy * 0.5));
        }
      });

      window.addEventListener('mouseup', () => {
        isDragging = false;
      });

      // Touch drag
      wrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          isDragging = true;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches.length > 0) {
          const dx = e.touches[0].clientX - startX;
          const dy = e.touches[0].clientY - startY;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;

          if (currentMode === '360') {
            yaw += dx * 0.4;
            pitch = Math.max(-45, Math.min(45, pitch + dy * 0.3));
            draw360Panorama(canvas);
          } else {
            rotY = (rotY + dx * 0.5) % 360;
            rotX = Math.max(-60, Math.min(60, rotX - dy * 0.5));
          }
        }
      }, { passive: true });

      window.addEventListener('touchend', () => {
        isDragging = false;
      });
    }
  }

  function checkHotspotClick(clientX, clientY, canvas) {
    if (!currentSite.threeD || !currentSite.threeD.hotspots) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const w = canvas.width;
    const h = canvas.height;

    let normYaw = ((yaw % 360) + 360) % 360;
    const pitchOffset = (pitch / 45) * 80;

    let clicked = null;

    currentSite.threeD.hotspots.forEach(hotspot => {
      let diffYaw = hotspot.yaw - normYaw;
      while (diffYaw < -180) diffYaw += 360;
      while (diffYaw > 180) diffYaw -= 360;

      const pinX = (w / 2) + (diffYaw / (180 / zoom)) * (w / 2);
      const pinY = (h / 2) + (hotspot.pitch / 45) * (h / 3) + pitchOffset;

      const dist = Math.hypot(clickX - pinX, clickY - pinY);
      if (dist <= 25) {
        clicked = hotspot;
      }
    });

    if (clicked) {
      activeHotspot = clicked;
      renderLayout();
    }
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
    render
  };
})();

window.ThreeDExplorerComponent = ThreeDExplorerComponent;
