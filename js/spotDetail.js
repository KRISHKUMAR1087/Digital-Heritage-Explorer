/**
 * Spot the Heritage Detail — Interactive Visual Identification Game Module
 * Educational gamification feature for Digital Heritage Explorer (HeritageHub).
 */

const SpotDetailGame = (() => {
  // LocalStorage Keys
  const STORAGE_POINTS_KEY = 'heritage_spot_detail_points_v1';
  const STORAGE_STREAK_KEY = 'heritage_spot_detail_streak_v1';
  const STORAGE_HIGHSCORE_KEY = 'heritage_spot_detail_highscore_v1';

  // Game State
  let questionsData = [];
  let currentRound = [];
  let currentIndex = 0;
  let currentDifficulty = 'All'; // All, Easy, Medium, Expert
  let sessionScore = 0;
  let sessionCorrect = 0;
  let currentStreak = 0;
  let bestStreak = 0;
  let totalHeritagePoints = 0;
  let isAnswered = false;
  let teaserQuestion = null;
  let teaserAnswered = false;

  // DOM Elements
  let modalEl = null;
  let teaserContainer = null;
  let headerBtn = null;

  function init() {
    loadSavedStats();
    fetchQuestions();
    setupRouting();
  }

  function loadSavedStats() {
    try {
      const p = localStorage.getItem(STORAGE_POINTS_KEY);
      if (p) totalHeritagePoints = parseInt(p, 10) || 0;

      const s = localStorage.getItem(STORAGE_STREAK_KEY);
      if (s) currentStreak = parseInt(s, 10) || 0;
    } catch (e) {
      console.error('Error loading Spot the Detail stats:', e);
    }
  }

  function saveStats() {
    try {
      localStorage.setItem(STORAGE_POINTS_KEY, totalHeritagePoints.toString());
      localStorage.setItem(STORAGE_STREAK_KEY, currentStreak.toString());
    } catch (e) {
      console.error('Error saving Spot the Detail stats:', e);
    }
  }

  function fetchQuestions() {
    fetch('data/heritageDetails.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        questionsData = data;
        renderHomepageTeaser();
        bindUIEvents();
        checkUrlHash();
      })
      .catch(err => {
        console.error('Failed to load heritage details dataset:', err);
      });
  }

  function setupRouting() {
    window.addEventListener('hashchange', checkUrlHash);
  }

  function checkUrlHash() {
    const hash = window.location.hash;
    if (hash === '#heritage-detail' || hash === '#spot-detail') {
      openGameModal();
    }
  }

  function bindUIEvents() {
    headerBtn = document.getElementById('btn-open-spot-detail');
    if (headerBtn) {
      headerBtn.addEventListener('click', () => {
        window.location.hash = 'heritage-detail';
        openGameModal();
      });
    }

    modalEl = document.getElementById('spot-detail-modal');
    if (modalEl) {
      const closeBtn = document.getElementById('spot-detail-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeGameModal);
      }

      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) closeGameModal();
      });
    }
  }

  // ==========================================
  // 1. Homepage Teaser Feature
  // ==========================================
  function renderHomepageTeaser() {
    teaserContainer = document.getElementById('homepage-spot-detail-teaser');
    if (!teaserContainer || !questionsData || questionsData.length === 0) return;

    // Pick a random question for the teaser
    teaserQuestion = questionsData[Math.floor(Math.random() * questionsData.length)];
    teaserAnswered = false;

    const html = `
      <div class="teaser-card-wrapper">
        <div class="teaser-badge">🔥 SPOT THE HERITAGE DETAIL</div>
        <h2 class="teaser-title">Look closer. Discover the story hidden in Gujarat’s heritage.</h2>
        <p class="teaser-subtitle">Can you identify this architectural element from Gujarat's monuments?</p>

        <div class="teaser-content-grid">
          <div class="teaser-img-box">
            <img src="${teaserQuestion.image}" alt="Gujarat Heritage Detail Teaser" class="teaser-img" />
            <span class="teaser-img-tag">${teaserQuestion.detailTag}</span>
          </div>

          <div class="teaser-quiz-box">
            <h3 class="teaser-question">${teaserQuestion.question}</h3>
            <div class="teaser-options-grid" id="teaser-options">
              ${teaserQuestion.options.map((opt, i) => `
                <button type="button" class="teaser-option-btn" data-index="${i}">
                  <span class="option-prefix">${String.fromCharCode(65 + i)}.</span> ${opt}
                </button>
              `).join('')}
            </div>

            <div id="teaser-feedback" class="teaser-feedback" style="display: none;"></div>

            <div class="teaser-action-row">
              <button type="button" class="btn-play-full-challenge" id="btn-teaser-play-now">
                🎮 Play Full Challenge (+Points &amp; Badges) →
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    teaserContainer.innerHTML = html;

    // Bind options in teaser
    const optionBtns = teaserContainer.querySelectorAll('.teaser-option-btn');
    optionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (teaserAnswered) return;
        teaserAnswered = true;
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        handleTeaserSubmit(idx, teaserQuestion, optionBtns);
      });
    });

    const playNowBtn = teaserContainer.querySelector('#btn-teaser-play-now');
    if (playNowBtn) {
      playNowBtn.addEventListener('click', () => {
        window.location.hash = 'heritage-detail';
        openGameModal();
      });
    }
  }

  function handleTeaserSubmit(selectedIdx, q, optionBtns) {
    const feedbackEl = document.getElementById('teaser-feedback');
    const isCorrect = selectedIdx === q.correctAnswer;

    optionBtns.forEach((b, i) => {
      if (i === q.correctAnswer) {
        b.classList.add('correct');
      } else if (i === selectedIdx && !isCorrect) {
        b.classList.add('incorrect');
      }
    });

    if (isCorrect) {
      totalHeritagePoints += 10;
      saveStats();
      updatePointsUI();

      if (feedbackEl) {
        feedbackEl.style.display = 'block';
        feedbackEl.className = 'teaser-feedback teaser-correct';
        feedbackEl.innerHTML = `
          <strong>🎉 Correct! +10 Heritage Points</strong>
          <p>${q.explanation}</p>
        `;
      }
    } else {
      if (feedbackEl) {
        feedbackEl.style.display = 'block';
        feedbackEl.className = 'teaser-feedback teaser-incorrect';
        feedbackEl.innerHTML = `
          <strong>Not quite!</strong>
          <p>${q.explanation}</p>
        `;
      }
    }
  }

  // ==========================================
  // 2. Full Game Modal & Gameplay Logic
  // ==========================================
  function openGameModal(difficulty = 'All') {
    if (!modalEl) return;
    modalEl.classList.add('active');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    startNewRound(difficulty);
  }

  function closeGameModal() {
    if (!modalEl) return;
    modalEl.classList.remove('active');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (window.location.hash === '#heritage-detail' || window.location.hash === '#spot-detail') {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
  }

  function startNewRound(difficulty = 'All') {
    currentDifficulty = difficulty;
    currentIndex = 0;
    sessionScore = 0;
    sessionCorrect = 0;
    bestStreak = 0;
    isAnswered = false;

    // Filter questions by difficulty
    let pool = [...questionsData];
    if (difficulty !== 'All' && difficulty !== 'Random') {
      pool = questionsData.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
      if (pool.length === 0) pool = [...questionsData];
    }

    // Shuffle pool
    pool.sort(() => Math.random() - 0.5);

    // Select 10 questions for the round (or all if < 10)
    currentRound = pool.slice(0, 10);

    renderGameUI();
    renderQuestionIndex(currentIndex);
  }

  function renderGameUI() {
    if (!modalEl) return;

    const modalBody = modalEl.querySelector('.modal-container');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <button type="button" class="modal-close-btn" id="spot-detail-close-btn" aria-label="Close detail game modal">✕</button>
      
      <!-- Top Stats Bar -->
      <div class="game-header-bar">
        <div class="game-header-title-box">
          <h2 class="game-title">🔥 Spot the Heritage Detail</h2>
          <span class="game-subtitle">Test your eyes. Discover Gujarat’s hidden heritage.</span>
        </div>

        <div class="game-stats-pill-group">
          <span class="game-stat-pill score-pill" id="game-points-display">
            🏆 Heritage Points: <strong>${totalHeritagePoints}</strong>
          </span>
          <span class="game-stat-pill streak-pill" id="game-streak-display">
            🔥 Streak: <strong>${currentStreak}</strong>
          </span>
        </div>
      </div>

      <!-- Difficulty Selector Bar -->
      <div class="difficulty-tab-bar" role="tablist" aria-label="Select Game Difficulty">
        <button type="button" class="diff-tab ${currentDifficulty === 'All' ? 'active' : ''}" data-diff="All">🎲 Random Challenge</button>
        <button type="button" class="diff-tab ${currentDifficulty === 'Easy' ? 'active' : ''}" data-diff="Easy">🟢 Easy</button>
        <button type="button" class="diff-tab ${currentDifficulty === 'Medium' ? 'active' : ''}" data-diff="Medium">🟡 Medium</button>
        <button type="button" class="diff-tab ${currentDifficulty === 'Expert' ? 'active' : ''}" data-diff="Expert">🔴 Expert</button>
      </div>

      <!-- Progress Indicator Bar -->
      <div class="progress-bar-container">
        <div class="progress-label-row">
          <span class="progress-q-text" id="progress-q-text">Question 1 / ${currentRound.length}</span>
          <span class="progress-difficulty-tag" id="progress-diff-tag">🟢 Easy</span>
        </div>
        <div class="progress-dots-row" id="progress-dots">
          <!-- Dots rendered dynamically -->
        </div>
      </div>

      <!-- Main Question & Explanation View Container -->
      <div id="game-question-viewport">
        <!-- Rendered dynamically -->
      </div>
    `;

    // Re-bind close button and tabs
    const closeBtn = modalBody.querySelector('#spot-detail-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeGameModal);

    const diffTabs = modalBody.querySelectorAll('.diff-tab');
    diffTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const d = tab.getAttribute('data-diff');
        startNewRound(d);
      });
    });
  }

  function renderQuestionIndex(index) {
    const viewport = document.getElementById('game-question-viewport');
    if (!viewport || index >= currentRound.length) {
      renderResultsScreen();
      return;
    }

    isAnswered = false;
    const q = currentRound[index];

    // Update Progress Indicator
    const qText = document.getElementById('progress-q-text');
    if (qText) qText.textContent = `Question ${index + 1} / ${currentRound.length}`;

    const diffTag = document.getElementById('progress-diff-tag');
    if (diffTag) {
      const diffEmoji = q.difficulty === 'Expert' ? '🔴' : q.difficulty === 'Medium' ? '🟡' : '🟢';
      diffTag.textContent = `${diffEmoji} ${q.difficulty}`;
    }

    renderProgressDots(index);

    viewport.innerHTML = `
      <div class="game-question-card">
        
        <!-- Large Close-up Image Container -->
        <div class="game-img-wrapper" title="Hover to magnify detail">
          <img src="${q.image}" alt="Gujarat Heritage Detail Question ${index + 1}" class="game-detail-img" />
          <span class="game-detail-badge">${q.detailTag}</span>
          <div class="zoom-hint">🔍 Hover / Touch to Inspect Detail</div>
        </div>

        <!-- Question Title -->
        <h3 class="game-question-title">${q.question}</h3>

        <!-- Options Buttons Grid -->
        <div class="game-options-grid" id="game-options-container">
          ${q.options.map((opt, i) => `
            <button type="button" class="game-option-btn" data-index="${i}" aria-label="Option ${String.fromCharCode(65 + i)}: ${opt}">
              <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
              <span class="opt-text">${opt}</span>
            </button>
          `).join('')}
        </div>

        <!-- Dynamic Answer Feedback & Heritage Story Card -->
        <div id="answer-feedback-container" class="answer-feedback-container" style="display: none;"></div>

      </div>
    `;

    // Bind Option Click Handlers
    const optionBtns = viewport.querySelectorAll('.game-option-btn');
    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (isAnswered) return;
        isAnswered = true;
        const selectedIdx = parseInt(btn.getAttribute('data-index'), 10);
        handleAnswerSubmission(selectedIdx, q, optionBtns);
      });
    });
  }

  function renderProgressDots(activeIdx) {
    const dotsContainer = document.getElementById('progress-dots');
    if (!dotsContainer) return;

    let dotsHtml = '';
    for (let i = 0; i < currentRound.length; i++) {
      if (i < activeIdx) {
        dotsHtml += `<span class="progress-dot completed">●</span>`;
      } else if (i === activeIdx) {
        dotsHtml += `<span class="progress-dot active">🟠</span>`;
      } else {
        dotsHtml += `<span class="progress-dot pending">○</span>`;
      }
    }
    dotsContainer.innerHTML = dotsHtml;
  }

  function handleAnswerSubmission(selectedIdx, q, optionBtns) {
    const feedbackContainer = document.getElementById('answer-feedback-container');
    const isCorrect = selectedIdx === q.correctAnswer;

    // Calculate Points
    const basePoints = q.difficulty === 'Expert' ? 20 : 10;
    let earnedPoints = 0;

    optionBtns.forEach((b, i) => {
      b.classList.add('disabled');
      if (i === q.correctAnswer) {
        b.classList.add('correct');
      } else if (i === selectedIdx && !isCorrect) {
        b.classList.add('incorrect');
      }
    });

    if (isCorrect) {
      sessionCorrect++;
      currentStreak++;
      if (currentStreak > bestStreak) bestStreak = currentStreak;

      earnedPoints = basePoints;

      // 3-Streak Bonus
      let bonusMsg = '';
      if (currentStreak % 3 === 0) {
        earnedPoints += 10;
        bonusMsg = ' 🔥 +10 STREAK BONUS!';
      }

      sessionScore += earnedPoints;
      totalHeritagePoints += earnedPoints;

      saveStats();
      updatePointsUI();
    } else {
      currentStreak = 0;
      saveStats();
      updatePointsUI();
    }

    // Render Heritage Story Explanation Card
    if (feedbackContainer) {
      feedbackContainer.style.display = 'block';

      // Check if site link exists in sites.json
      const siteExists = typeof window.allSites !== 'undefined'
        ? window.allSites.some(s => s.id === q.heritageSiteId)
        : true;

      feedbackContainer.innerHTML = `
        <div class="feedback-banner ${isCorrect ? 'banner-correct' : 'banner-incorrect'}">
          ${isCorrect ? `🎉 Correct! +${earnedPoints} Heritage Points` : 'Not quite!'}
        </div>

        <!-- 📖 Heritage Story Card -->
        <div class="heritage-story-card">
          <div class="story-header">
            <span class="story-icon">📖</span>
            <div>
              <h4 class="story-title">Heritage Story</h4>
              <span class="story-name-tag">${q.options[q.correctAnswer]}</span>
            </div>
          </div>

          <p class="story-explanation">${q.explanation}</p>

          <div class="story-meta-row">
            <span class="meta-item">📍 <strong>Location:</strong> ${q.location}</span>
            <span class="meta-item">🏛️ <strong>Heritage Type:</strong> ${q.heritageType}</span>
            <span class="meta-item">🕰️ <strong>Period:</strong> ${q.period}</span>
          </div>

          <!-- 💡 Did You Know? Card -->
          <div class="did-you-know-card">
            <span class="dyk-icon">💡</span>
            <div>
              <strong>Did You Know?</strong>
              <p>${q.didYouKnow}</p>
            </div>
          </div>

          <!-- Action Links Row -->
          <div class="story-actions-row">
            ${siteExists ? `
              <button type="button" class="btn-explore-monument" id="btn-explore-site-link">
                🏛️ Explore This Heritage Site →
              </button>
            ` : ''}

            <button type="button" class="btn-next-question" id="btn-next-question">
              ${currentIndex < currentRound.length - 1 ? 'Next Question ➔' : 'See Challenge Results 🏆'}
            </button>
          </div>

          ${q.source ? `
            <div class="story-source-footer">
              ℹ️ Source: ${q.source}
            </div>
          ` : ''}
        </div>
      `;

      // Scroll smoothly to feedback
      feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Bind explore site link
      const exploreBtn = feedbackContainer.querySelector('#btn-explore-site-link');
      if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
          closeGameModal();
          if (window.GalleryComponent && typeof GalleryComponent.openModal === 'function') {
            GalleryComponent.openModal(q.heritageSiteId);
          }
        });
      }

      // Bind next question button
      const nextBtn = feedbackContainer.querySelector('#btn-next-question');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          currentIndex++;
          renderQuestionIndex(currentIndex);
        });
      }
    }
  }

  // ==========================================
  // 3. Final Results Screen
  // ==========================================
  function renderResultsScreen() {
    const viewport = document.getElementById('game-question-viewport');
    if (!viewport) return;

    // Challenge Completion Bonus
    const completionBonus = 25;
    totalHeritagePoints += completionBonus;
    saveStats();
    updatePointsUI();

    // Determine Achievement Badge
    const percentage = Math.round((sessionCorrect / currentRound.length) * 100);
    let badgeTitle = '🌱 Heritage Beginner';
    let badgeDesc = 'Great start! Keep exploring Gujarat’s monuments to deepen your knowledge.';

    if (percentage >= 90) {
      badgeTitle = '👑 Heritage Expert';
      badgeDesc = 'Outstanding mastery! You have an extraordinary eye for Gujarat’s finest architectural details.';
    } else if (percentage >= 70) {
      badgeTitle = '🔥 Heritage Enthusiast';
      badgeDesc = 'Impressive job! Your passion for Gujarati culture and craftsmanship shines through.';
    } else if (percentage >= 40) {
      badgeTitle = '🏛️ Heritage Explorer';
      badgeDesc = 'Good effort! You are well on your way to becoming a Gujarat heritage scholar.';
    }

    viewport.innerHTML = `
      <div class="results-screen-card">
        <div class="results-header-banner">
          <div class="results-confetti-icon">🎉</div>
          <h2 class="results-title">Heritage Challenge Complete!</h2>
          <p class="results-subtitle">Congratulations on exploring the hidden details of Gujarat!</p>
        </div>

        <!-- Score Overview Grid -->
        <div class="results-stats-grid">
          <div class="res-stat-box highlight-box">
            <span class="res-stat-label">Your Round Score</span>
            <span class="res-stat-val">${sessionScore} / ${currentRound.length * 10}</span>
          </div>

          <div class="res-stat-box">
            <span class="res-stat-label">Points Earned</span>
            <span class="res-stat-val text-gold">+${sessionScore + completionBonus} 🏆</span>
            <small>(includes +25 completion bonus)</small>
          </div>

          <div class="res-stat-box">
            <span class="res-stat-label">Accuracy</span>
            <span class="res-stat-val">${sessionCorrect} / ${currentRound.length} (${percentage}%)</span>
          </div>

          <div class="res-stat-box">
            <span class="res-stat-label">Best Streak</span>
            <span class="res-stat-val text-fire">${bestStreak} 🔥</span>
          </div>
        </div>

        <!-- Achievement Badge Display -->
        <div class="achievement-badge-card">
          <div class="badge-icon-large">${badgeTitle.split(' ')[0]}</div>
          <div>
            <h3 class="badge-title">${badgeTitle}</h3>
            <p class="badge-desc">${badgeDesc}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="results-actions-group">
          <button type="button" class="btn-res-action btn-play-again" id="btn-results-play-again">
            🔄 Play Again
          </button>
          <button type="button" class="btn-res-action btn-explore-more" id="btn-results-explore">
            🗺️ Explore More Heritage
          </button>
          <button type="button" class="btn-res-action btn-view-passport" id="btn-results-passport">
            🏆 View My Heritage Passport
          </button>
        </div>
      </div>
    `;

    // Bind results buttons
    const playAgainBtn = viewport.querySelector('#btn-results-play-again');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        startNewRound(currentDifficulty);
      });
    }

    const exploreBtn = viewport.querySelector('#btn-results-explore');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', () => {
        closeGameModal();
        const cardsSec = document.getElementById('cards-grid');
        if (cardsSec) cardsSec.scrollIntoView({ behavior: 'smooth' });
      });
    }

    const passportBtn = viewport.querySelector('#btn-results-passport');
    if (passportBtn) {
      passportBtn.addEventListener('click', () => {
        closeGameModal();
        if (window.PassportComponent && typeof PassportComponent.updateCounterUI === 'function') {
          PassportComponent.updateCounterUI();
        }
      });
    }
  }

  function updatePointsUI() {
    const gamePtsEl = document.getElementById('game-points-display');
    if (gamePtsEl) {
      gamePtsEl.innerHTML = `🏆 Heritage Points: <strong>${totalHeritagePoints}</strong>`;
    }

    const gameStreakEl = document.getElementById('game-streak-display');
    if (gameStreakEl) {
      gameStreakEl.innerHTML = `🔥 Streak: <strong>${currentStreak}</strong>`;
    }

    // Sync with main app Passport counter if PassportComponent exists
    if (window.PassportComponent && typeof PassportComponent.updateCounterUI === 'function') {
      PassportComponent.updateCounterUI();
    }
  }

  return {
    init,
    openGameModal,
    closeGameModal,
    getTotalPoints: () => totalHeritagePoints,
    getCurrentStreak: () => currentStreak
  };
})();

// Auto-initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  SpotDetailGame.init();
});
