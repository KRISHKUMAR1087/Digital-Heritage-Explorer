/**
 * Heritage Passport Component Module (Gamification)
 * Allows visitors to stamp sites they have visited, saved in localStorage,
 * and displays a progress counter badge in the header.
 */

const PassportComponent = (() => {
  const STORAGE_KEY = 'heritage_passport_visited_v1';
  let visitedSet = new Set();
  const counterElement = document.getElementById('passport-counter');

  function init() {
    loadVisited();
    updateCounterUI();
  }

  function loadVisited() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        visitedSet = new Set(JSON.parse(data));
      }
    } catch (e) {
      console.error('Error loading passport from localStorage:', e);
    }
  }

  function saveVisited() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(visitedSet)));
    } catch (e) {
      console.error('Error saving passport to localStorage:', e);
    }
  }

  function isVisited(siteId) {
    return visitedSet.has(siteId);
  }

  function toggleVisited(siteId) {
    if (visitedSet.has(siteId)) {
      visitedSet.delete(siteId);
    } else {
      visitedSet.add(siteId);
    }
    saveVisited();
    updateCounterUI();
  }

  function updateCounterUI() {
    if (counterElement) {
      const label = window.I18nComponent ? I18nComponent.t('passportLabel') : 'Passport:';
      const countText = window.I18nComponent ? I18nComponent.t('stampedCount') : 'Stamped';
      counterElement.textContent = `${label} ${visitedSet.size} ${countText} 🏵️`;
    }
  }

  return {
    init,
    isVisited,
    toggleVisited,
    updateCounterUI,
    getVisitedCount: () => visitedSet.size
  };
})();
