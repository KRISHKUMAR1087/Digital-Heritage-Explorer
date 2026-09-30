/**
 * Cards Component Module
 * Handles rendering the info cards grid, highlighting, and card click interactions.
 */

const CardsComponent = (() => {
  const cardsContainer = document.getElementById('cards-grid');
  const countIndicator = document.getElementById('results-count');

  /**
   * Render the list of site cards into the container.
   * @param {Array} sites - Array of site objects.
   * @param {Function} onCardClick - Callback when card is clicked (syncs to map).
   * @param {Function} onDetailsClick - Callback when "View Details" button is clicked.
   */
  function render(sites, onCardClick, onDetailsClick) {
    if (!cardsContainer) return;
    cardsContainer.innerHTML = '';

    // Update results counter
    if (countIndicator) {
      countIndicator.textContent = `${sites.length} ${sites.length === 1 ? 'heritage site' : 'heritage sites'} found`;
    }

    if (sites.length === 0) {
      renderEmptyState();
      return;
    }

    sites.forEach(site => {
      const card = document.createElement('article');
      card.className = 'site-card';
      card.dataset.siteId = site.id;
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `View ${site.name} details`);

      card.innerHTML = `
        <div class="card-media">
          <img src="${site.cover}" alt="${site.name} cover photo" loading="lazy" width="400" height="225" />
          <span class="card-badge">${escapeHTML(site.category)}</span>
        </div>
        <div class="card-content">
          <span class="card-location">${escapeHTML(site.city)}</span>
          <h3 class="card-title">${escapeHTML(site.name)}</h3>
          <p class="card-summary">${escapeHTML(site.summary)}</p>
          <div class="card-footer">
            <button class="btn-details" aria-label="View details for ${escapeHTML(site.name)}">
              View details
            </button>
          </div>
        </div>
      `;

      // Event listener for main card click (Sync with Map)
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-details')) {
          e.stopPropagation();
          if (typeof onDetailsClick === 'function') {
            onDetailsClick(site);
          }
        } else {
          if (typeof onCardClick === 'function') {
            onCardClick(site);
          }
        }
      });

      // Keyboard Accessibility for Cards
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (e.target.classList.contains('btn-details')) {
            if (typeof onDetailsClick === 'function') onDetailsClick(site);
          } else {
            if (typeof onCardClick === 'function') onCardClick(site);
          }
        }
      });

      cardsContainer.appendChild(card);
    });
  }

  /**
   * Render an empty state view when search returns zero results.
   */
  function renderEmptyState() {
    cardsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon" aria-hidden="true">🏛️</div>
        <h3 class="empty-title">No Heritage Sites Found</h3>
        <p class="empty-desc">We couldn't find any sites matching your search criteria. Try adjusting your search query or selecting a different category filter.</p>
      </div>
    `;
  }

  /**
   * Highlight a specific card and scroll it into view.
   * @param {string} siteId - ID of the site to highlight.
   */
  function highlightCard(siteId) {
    if (!cardsContainer) return;
    const allCards = cardsContainer.querySelectorAll('.site-card');
    allCards.forEach(card => card.classList.remove('highlighted'));

    const targetCard = cardsContainer.querySelector(`.site-card[data-site-id="${siteId}"]`);
    if (targetCard) {
      targetCard.classList.add('highlighted');
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Escape HTML helper to prevent XSS.
   */
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
    render,
    highlightCard
  };
})();
