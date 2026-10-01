/**
 * Virtual 360 Tour / Panorama Viewer Module (js/panorama.js)
 * Lightweight equirectangular 360 viewer with hotspots, full-screen mode, and mobile gyroscope support.
 */

const PanoramaComponent = (() => {
  let isGyroEnabled = false;
  let gyroListener = null;

  /**
   * Request and enable mobile gyroscope / DeviceOrientation controls for 360 views
   * @param {Function} onOrientationChange - Callback(alpha, beta, gamma)
   */
  async function enableGyroscope(onOrientationChange) {
    if (typeof DeviceOrientationEvent === 'undefined') {
      console.warn('[Panorama] DeviceOrientation API not supported on this device');
      return false;
    }

    try {
      // iOS 13+ requires explicit permission request
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== 'granted') {
          console.warn('[Panorama] Gyroscope permission denied');
          return false;
        }
      }

      gyroListener = (event) => {
        if (!event.alpha && !event.beta && !event.gamma) return;
        isGyroEnabled = true;
        onOrientationChange({
          alpha: event.alpha || 0, // Z-axis rotation [0, 360]
          beta: event.beta || 0,   // X-axis tilt [-180, 180]
          gamma: event.gamma || 0  // Y-axis tilt [-90, 90]
        });
      };

      window.addEventListener('deviceorientation', gyroListener, true);
      return true;
    } catch (e) {
      console.warn('[Panorama] Error initializing DeviceOrientation:', e);
      return false;
    }
  }

  /**
   * Disable gyroscope listener
   */
  function disableGyroscope() {
    if (gyroListener) {
      window.removeEventListener('deviceorientation', gyroListener, true);
      gyroListener = null;
    }
    isGyroEnabled = false;
  }

  /**
   * Toggle Fullscreen Mode for 360 panorama stage
   * @param {HTMLElement} stageElement 
   */
  function toggleFullscreen(stageElement) {
    if (!stageElement) return;

    if (!document.fullscreenElement) {
      if (stageElement.requestFullscreen) {
        stageElement.requestFullscreen();
      } else if (stageElement.webkitRequestFullscreen) {
        stageElement.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  return {
    enableGyroscope,
    disableGyroscope,
    toggleFullscreen,
    isGyroActive: () => isGyroEnabled
  };
})();

window.PanoramaComponent = PanoramaComponent;
