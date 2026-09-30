/**
 * Audio Guide Module (Web Speech API)
 * Multilingual speech synthesis audio guide (EN / GU / HI) with voice detection, fallback handling, and play/pause/stop controls.
 */
const AudioGuideComponent = (() => {
  let container = null;
  let currentSite = null;
  let currentLang = 'en'; // 'en', 'gu', 'hi'
  let currentUtterance = null;
  let isSpeaking = false;
  let isPaused = false;
  let availableVoices = [];

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
    if (!config || availableVoices.length === 0) return true; // Assume true if voice list empty initially

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
      <div class="audio-guide-card" tabindex="0" aria-label="Audio Guide Player">
        <div class="audio-guide-header">
          <div class="audio-title-group">
            <span class="audio-icon">🎧</span>
            <div>
              <h3 class="audio-guide-title">Audio Guide Story</h3>
              <p class="audio-guide-subtitle">Listen to historical narration in your preferred language</p>
            </div>
          </div>

          <!-- Language Selector -->
          <div class="audio-lang-selector" role="radiogroup" aria-label="Audio Language">
            <button type="button" class="lang-chip ${currentLang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
            <button type="button" class="lang-chip ${currentLang === 'gu' ? 'active' : ''}" data-lang="gu">GU</button>
            <button type="button" class="lang-chip ${currentLang === 'hi' ? 'active' : ''}" data-lang="hi">HI</button>
          </div>
        </div>

        <!-- Player Controls -->
        <div class="audio-controls-row">
          <button type="button" class="btn-audio-control btn-play" id="btn-audio-play" aria-label="Play audio narration">
            ${isSpeaking && !isPaused ? '⏸️ Pause' : (isPaused ? '▶️ Resume' : '▶️ Listen')}
          </button>
          <button type="button" class="btn-audio-control btn-stop" id="btn-audio-stop" ${!isSpeaking && !isPaused ? 'disabled' : ''} aria-label="Stop audio narration">
            ⏹️ Stop
          </button>
          <span class="audio-status-badge ${isSpeaking ? 'speaking' : ''}">
            ${isSpeaking ? (isPaused ? 'Paused ⏸️' : 'Playing 🔊...') : 'Ready 🎧'}
          </span>
        </div>

        <!-- Voice Missing Fallback Warning -->
        ${!hasVoice ? `
          <div class="voice-warning-box">
            ⚠️ <em>${langMap[currentLang].name} voice is not installed on this browser/device. Read transcript below:</em>
          </div>
        ` : ''}

        <!-- Audio Story Transcript -->
        <div class="audio-transcript-box">
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

    window.speechSynthesis.cancel();

    const text = currentSite.story[currentLang] || currentSite.story.en || '';
    if (!text) return;

    currentUtterance = new SpeechSynthesisUtterance(text);
    const config = langMap[currentLang];
    currentUtterance.lang = config ? config.code : 'en-IN';

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
      renderLayout();
    };

    currentUtterance.onend = () => {
      isSpeaking = false;
      isPaused = false;
      renderLayout();
    };

    currentUtterance.onerror = () => {
      isSpeaking = false;
      isPaused = false;
      renderLayout();
    };

    window.speechSynthesis.speak(currentUtterance);
  }

  function stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isSpeaking = false;
    isPaused = false;
    currentUtterance = null;
  }

  function setupEvents() {
    if (!container) return;

    const playBtn = container.querySelector('#btn-audio-play');
    if (playBtn) {
      playBtn.addEventListener('click', playSpeech);
    }

    const stopBtn = container.querySelector('#btn-audio-stop');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        stopSpeech();
        renderLayout();
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

  // Initialize voice loading
  init();

  return {
    render,
    stopSpeech
  };
})();

window.AudioGuideComponent = AudioGuideComponent;
