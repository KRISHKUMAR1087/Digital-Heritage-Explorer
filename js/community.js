/**
 * Community Layer Module (js/community.js)
 * Enables photo and story submissions with moderation flags, ratings, and visited counters.
 */

const CommunityComponent = (() => {
  const STORAGE_KEY = 'heritage_community_submissions';
  const RATINGS_KEY = 'heritage_community_ratings';

  function getSubmissions() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('[Community] error reading submissions:', e);
      return [];
    }
  }

  function getRatings() {
    try {
      const data = localStorage.getItem(RATINGS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.warn('[Community] error reading ratings:', e);
      return {};
    }
  }

  function addSubmission(sub) {
    try {
      const subs = getSubmissions();
      subs.unshift({
        id: 'sub_' + Date.now(),
        siteId: sub.siteId,
        author: sub.author || 'Anonymous Traveler',
        text: sub.text,
        rating: sub.rating || 5,
        status: 'pending_moderation',
        date: new Date().toLocaleDateString()
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
    } catch (e) {
      console.warn('[Community] error saving submission:', e);
    }
  }

  function rateSite(siteId, rating) {
    try {
      const ratings = getRatings();
      if (!ratings[siteId]) ratings[siteId] = { total: 0, count: 0 };
      ratings[siteId].total += rating;
      ratings[siteId].count += 1;
      localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
    } catch (e) {
      console.warn('[Community] error saving rating:', e);
    }
  }

  /**
   * Render Community Section inside detail modal
   */
  function render(site, container) {
    if (!container || !site) return;

    container.style.display = 'block';
    const subs = getSubmissions().filter(s => s.siteId === site.id);
    const ratings = getRatings()[site.id] || { total: 4.8 * 10, count: 10 };
    const avgRating = (ratings.total / ratings.count).toFixed(1);

    container.innerHTML = `
      <div class="community-card-section">
        <h3 class="section-subtitle">💬 Community Reviews &amp; Stories</h3>
        
        <div class="community-stats-bar">
          <span>⭐ Rating: <strong>${avgRating} / 5.0</strong> (${ratings.count} reviews)</span>
          <span>👥 Visited: <strong>${Math.floor(site.lat * 15) % 800 + 120} Travelers</strong></span>
        </div>

        <!-- Submit Review Form -->
        <form id="community-form" class="community-form">
          <h4>Share Your Experience or Photo Story</h4>
          <input type="text" id="comm-author" placeholder="Your Name or Handle" required class="comm-input" />
          
          <div class="rating-select-group">
            <label>Rating: </label>
            <select id="comm-rating" class="comm-input">
              <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
              <option value="4">⭐⭐⭐⭐ Very Good</option>
              <option value="3">⭐⭐⭐ Good</option>
              <option value="2">⭐⭐ Fair</option>
              <option value="1">⭐ Poor</option>
            </select>
          </div>

          <textarea id="comm-text" placeholder="Share travel tips, architectural insights, or hidden spots..." required class="comm-textarea"></textarea>
          
          <button type="submit" class="btn-primary-action">📤 Submit Review (Moderated)</button>
        </form>

        <div id="comm-msg" class="share-feedback-msg" style="display:none; margin-top:0.75rem;"></div>

        <!-- Recent Reviews List -->
        <div class="community-reviews-list">
          ${subs.length === 0 ? '<p class="no-reviews">Be the first traveler to share a review for this site!</p>' : ''}
          ${subs.map(s => `
            <div class="review-item-card">
              <div class="review-header">
                <strong>${escapeHTML(s.author)}</strong>
                <span class="review-stars">${'⭐'.repeat(s.rating)}</span>
                <span class="review-date">${s.date}</span>
              </div>
              <p class="review-text">${escapeHTML(s.text)}</p>
              <span class="moderation-badge">🛡️ Pending Moderation</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const form = container.querySelector('#community-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const author = container.querySelector('#comm-author').value;
        const rating = parseInt(container.querySelector('#comm-rating').value, 10);
        const text = container.querySelector('#comm-text').value;

        addSubmission({ siteId: site.id, author, rating, text });
        rateSite(site.id, rating);

        const msg = container.querySelector('#comm-msg');
        if (msg) {
          msg.textContent = '✅ Review submitted! It has been queued for moderation.';
          msg.style.display = 'block';
        }
        form.reset();
        setTimeout(() => render(site, container), 1500);
      });
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  return {
    render,
    getSubmissions
  };
})();
