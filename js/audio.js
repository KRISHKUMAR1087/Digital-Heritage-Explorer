/**
 * Audio Guide Module (Web Speech API)
 * Multilingual speech synthesis audio guide (EN / GU / HI) with voice detection,
 * speed control (0.75x - 1.5x), sleep timer, transcript view, and play/pause/stop controls.
 */
const AudioGuideComponent = (() => {
  let container = null;
  let currentSite = null;
  let currentLang = 'en'; // 'en', 'gu', 'hi'
  let currentUtterance = null;
  let isSpeaking = false;
  let isPaused = false;
  let availableVoices = [];
  let playbackRate = 1.0;
  let sleepTimerMinutes = 0;
  let sleepTimerTimeout = null;

  const langMap = {
    en: { code: 'en-IN', name: 'English', fallbackCode: 'en-US' },
    gu: { code: 'gu-IN', name: 'Gujarati (ગુજરાતી)', fallbackCode: 'gu' },
    hi: { code: 'hi-IN', name: 'Hindi (हिंदी)', fallbackCode: 'hi' }
  };

  function init() {
    if ('speechSynthesis' in window) {
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  function loadVoices() {
    if ('speechSynthesis' in window) {
      availableVoices = window.speechSynthesis.getVoices() || [];
    }
  }

  function render(site, targetEl) {
    container = targetEl;
    if (!container) return;

    if (!site || !site.story) {
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    currentSite = site;
    stopSpeech();
    container.style.display = 'block';
    renderLayout();
  }

  function checkVoiceAvailable(langKey) {
    loadVoices();
    const config = langMap[langKey];
    if (!config || availableVoices.length === 0) return true;

    return availableVoices.some(v => 
      v.lang.toLowerCase().startsWith(config.code.toLowerCase()) || 
      v.lang.toLowerCase().startsWith(config.fallbackCode.toLowerCase()) ||
      (langKey === 'en' && v.lang.toLowerCase().startsWith('en'))
    );
  }

  function renderLayout() {
    if (!container || !currentSite) return;

    const storyText = currentSite.story[currentLang] || currentSite.story.en || '';
    const hasVoice = checkVoiceAvailable(currentLang);

    container.innerHTML = `
      <div class="audio-guide-card" tabindex="0" aria-label="Audio Guide Player with Speed Control and Sleep Timer">
        <div class="audio-guide-header">
          <div class="audio-title-group">
            <span class="audio-icon">🎧</span>
            <div>
              <h3 class="audio-guide-title">Audio Guide Story</h3>
              <p class="audio-guide-subtitle">Listen to historical narration with custom speed and sleep timer</p>
            </div>
          </div>

          <!-- Language Selector -->
          <div class="audio-lang-selector" role="radiogroup" aria-label="Audio Language">
            <button type="button" class="lang-chip ${currentLang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
            <button type="button" class="lang-chip ${currentLang === 'gu' ? 'active' : ''}" data-lang="gu">GU</button>
            <button type="button" class="lang-chip ${currentLang === 'hi' ? 'active' : ''}" data-lang="hi">HI</button>
          </div>
        </div>

        <!-- Player Controls & Speed / Sleep Timer -->
        <div class="audio-controls-row">
          <button type="button" class="btn-audio-control btn-play" id="btn-audio-play" aria-label="Play or pause audio narration">
            ${isSpeaking && !isPaused ? '⏸️ Pause' : (isPaused ? '▶️ Resume' : '▶️ Listen')}
          </button>

          <button type="button" class="btn-audio-control btn-stop" id="btn-audio-stop" ${!isSpeaking && !isPaused ? 'disabled' : ''} aria-label="Stop audio narration">
            ⏹️ Stop
          </button>

          <!-- Speed Controls -->
          <div class="audio-extra-control">
            <label for="select-audio-speed" class="control-sublabel">⚡ Speed:</label>
            <select id="select-audio-speed" class="audio-select-sm" aria-label="Audio playback speed">
              <option value="0.75" ${playbackRate === 0.75 ? 'selected' : ''}>0.75x</option>
              <option value="1.0" ${playbackRate === 1.0 ? 'selected' : ''}>1.0x (Normal)</option>
              <option value="1.25" ${playbackRate === 1.25 ? 'selected' : ''}>1.25x</option>
              <option value="1.5" ${playbackRate === 1.5 ? 'selected' : ''}>1.5x</option>
            </select>
          </div>

          <!-- Sleep Timer -->
          <div class="audio-extra-control">
            <label for="select-sleep-timer" class="control-sublabel">🌙 Sleep Timer:</label>
            <select id="select-sleep-timer" class="audio-select-sm" aria-label="Audio sleep timer">
              <option value="0" ${sleepTimerMinutes === 0 ? 'selected' : ''}>Off</option>
              <option value="5" ${sleepTimerMinutes === 5 ? 'selected' : ''}>5 Mins</option>
              <option value="15" ${sleepTimerMinutes === 15 ? 'selected' : ''}>15 Mins</option>
              <option value="30" ${sleepTimerMinutes === 30 ? 'selected' : ''}>30 Mins</option>
            </select>
          </div>

          <span class="audio-status-badge ${isSpeaking ? 'speaking' : ''}">
            ${isSpeaking ? (isPaused ? 'Paused ⏸️' : `Playing ${playbackRate}x 🔊...`) : 'Ready 🎧'}
          </span>
        </div>

        <!-- Voice Missing Fallback Warning -->
        ${!hasVoice ? `
          <div class="voice-warning-box">
            ⚠️ <em>${langMap[currentLang].name} voice is not installed on this browser/device. Read transcript below:</em>
          </div>
        ` : ''}

        <!-- Audio Story Transcript (Always Available) -->
        <div class="audio-transcript-box">
          <span class="transcript-label">📜 Full Audio Transcript:</span>
          <p class="audio-transcript-text ${isSpeaking && !isPaused ? 'highlight' : ''}">${escapeHTML(storyText)}</p>
        </div>
      </div>
    `;

    setupEvents();
  }

  function playSpeech() {
    if (!('speechSynthesis' in window)) {
      alert('Web Speech API is not supported on this browser.');
      return;
    }

    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      isPaused = false;
      renderLayout();
      return;
    }

    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      isPaused = true;
      renderLayout();
      return;
    }

    stopSpeech();

    const text = currentSite.story[currentLang] || currentSite.story.en || '';
    if (!text) return;

    currentUtterance = new SpeechSynthesisUtterance(text);
    const config = langMap[currentLang];
    currentUtterance.lang = config ? config.code : 'en-IN';
    currentUtterance.rate = playbackRate;

    // Match voice if available
    loadVoices();
    if (availableVoices.length > 0) {
      const match = availableVoices.find(v => 
        v.lang.toLowerCase().startsWith(config.code.toLowerCase()) || 
        v.lang.toLowerCase().startsWith(config.fallbackCode.toLowerCase())
      );
      if (match) currentUtterance.voice = match;
    }

    currentUtterance.onstart = () => {
      isSpeaking = true;
      isPaused = false;

      // Start Sleep Timer if configured
      if (sleepTimerMinutes > 0) {
        clearTimeout(sleepTimerTimeout);
        sleepTimerTimeout = setTimeout(() => {
          stopSpeech();
          renderLayout();
        }, sleepTimerMinutes * 60 * 1000);
      }

      renderLayout();
    };

    currentUtterance.onend = () => {
      isSpeaking = false;
      isPaused = false;
      clearTimeout(sleepTimerTimeout);
      renderLayout();
    };

    currentUtterance.onerror = () => {
      isSpeaking = false;
      isPaused = false;
      clearTimeout(sleepTimerTimeout);
      renderLayout();
    };

    window.speechSynthesis.speak(currentUtterance);
  }

  function stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    clearTimeout(sleepTimerTimeout);
    isSpeaking = false;
    isPaused = false;
    currentUtterance = null;
  }

  function setupEvents() {
    if (!container) return;

    const playBtn = container.querySelector('#btn-audio-play');
    if (playBtn) playBtn.addEventListener('click', playSpeech);

    const stopBtn = container.querySelector('#btn-audio-stop');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        stopSpeech();
        renderLayout();
      });
    }

    const selectSpeed = container.querySelector('#select-audio-speed');
    if (selectSpeed) {
      selectSpeed.addEventListener('change', (e) => {
        playbackRate = parseFloat(e.target.value);
        if (isSpeaking) {
          playSpeech(); // Restart with new speed rate
        }
      });
    }

    const selectSleep = container.querySelector('#select-sleep-timer');
    if (selectSleep) {
      selectSleep.addEventListener('change', (e) => {
        sleepTimerMinutes = parseInt(e.target.value, 10);
      });
    }

    const langChips = container.querySelectorAll('.lang-chip');
    langChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const lang = chip.getAttribute('data-lang');
        if (lang !== currentLang) {
          stopSpeech();
          currentLang = lang;
          renderLayout();
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

  init();

  return {
    render,
    stopSpeech
  };
})();

window.AudioGuideComponent = AudioGuideComponent;
