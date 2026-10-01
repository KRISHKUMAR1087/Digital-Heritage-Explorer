/**
 * Landing Page Component Module (js/landing.js)
 * Controls hero landing page interactions, smooth scroll navigation to explorer sections,
 * quick CTA triggers for Trails, Trip Planner, AI Landmark Photo Identification, and Hero Banner toggling.
 */

const LandingComponent = (() => {

  /**
   * Initialize Landing Page Event Listeners
   */
  function init() {
    const btnExplore = document.getElementById('btn-hero-explore');
    const btnTrails = document.getElementById('btn-hero-trails');
    const btnPlanner = document.getElementById('btn-hero-planner');
    const btnIdentify = document.getElementById('btn-hero-identify');
    const toggleHeroBtn = document.getElementById('btn-toggle-hero');
    const heroSection = document.getElementById('landing-hero');

    // Smooth scroll to main explorer section
    if (btnExplore) {
      btnExplore.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToExplorer();
      });
    }

    // Heritage Trails CTA
    if (btnTrails) {
      btnTrails.addEventListener('click', () => {
        scrollToExplorer();
        const trailsRow = document.getElementById('trails-container');
        if (trailsRow) {
          trailsRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }

    // Trip Planner CTA
    if (btnPlanner) {
      btnPlanner.addEventListener('click', () => {
        if (window.PlannerComponent) {
          PlannerComponent.openModal();
        }
      });
    }

    // AI Landmark Recognition CTA
    if (btnIdentify) {
      btnIdentify.addEventListener('click', () => {
        const btnIdentifyHeader = document.getElementById('btn-identify-site');
        if (btnIdentifyHeader) {
          btnIdentifyHeader.click();
        }
      });
    }

    // Collapsible Hero Banner Toggle
    if (toggleHeroBtn && heroSection) {
      toggleHeroBtn.addEventListener('click', () => {
        const isCollapsed = heroSection.classList.toggle('collapsed');
        toggleHeroBtn.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
        toggleHeroBtn.innerHTML = isCollapsed ? '🔽 Show Landing Hero' : '🔼 Compact Hero';
      });
    }

    // Featured Showcase Quick Cards Click
    document.querySelectorAll('.landing-featured-card').forEach(card => {
      card.addEventListener('click', () => {
        const siteId = card.dataset.siteId;
        if (siteId) {
          window.location.hash = `#/site/${siteId}`;
        }
      });
    });
  }

  /**
   * Smooth scroll down to main explorer section
   */
  function scrollToExplorer() {
    const explorerTarget = document.getElementById('explorer-section') || document.getElementById('main-filter-container');
    if (explorerTarget) {
      explorerTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return {
    init,
    scrollToExplorer
  };
})();

// Auto initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', LandingComponent.init);
} else {
  LandingComponent.init();
}
