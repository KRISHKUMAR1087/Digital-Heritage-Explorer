/**
 * Timeline of Dynasties & Eras Module (js/timeline.js)
 * Horizontal scrollable timeline bar mapping Maurya -> Solanki -> Sultanate -> Gaekwad -> Modern eras.
 * Filters monument cards and pins when a historical era node is clicked.
 */

const TimelineComponent = (() => {
  const DYNASTIES = [
    { id: 'All', name: 'All Eras', period: '3000 BCE – Present', desc: 'Complete chronology' },
    { id: 'Harappan', name: 'Harappan / Indus Valley', period: '2600 – 1900 BCE', desc: 'Ancient urban planning & trade hubs (Lothal, Dholavira)' },
    { id: 'Mauryan', name: 'Mauryan / Gupta Era', period: '300 BCE – 500 AD', desc: 'Early rock-cut edicts & Buddhist caves (Uparkot, Junagadh)' },
    { id: 'Solanki', name: 'Solanki Golden Age', period: '960 – 1244 AD', desc: 'Maru-Gurjara stepwell & sun temple architecture (Modhera, Patan)' },
    { id: 'Sultanate', name: 'Gujarat Sultanate', period: '1407 – 1573 AD', desc: 'Indo-Islamic stone carvings & mosques (Champaner, Sarkhej Roza)' },
    { id: 'Colonial', name: 'Gaekwad & Colonial', period: '1700 – 1947 AD', desc: 'Indo-Saracenic palaces & clock towers (Prag Mahal, Vadodara)' }
  ];

  let selectedEraId = 'All';

  /**
   * Render Horizontal Dynasty Timeline Bar into target container
   * @param {HTMLElement} container 
   * @param {Function} onSelectEra - Callback(eraId)
   */
  function render(container, onSelectEra) {
    if (!container) return;

    container.innerHTML = `
      <div class="dynasty-timeline-bar" role="region" aria-label="Timeline of Gujarat Dynasties">
        <div class="timeline-nodes-scroll">
          ${DYNASTIES.map(d => `
            <button type="button" 
                    class="timeline-dynasty-node ${d.id === selectedEraId ? 'active' : ''}" 
                    data-era-id="${d.id}"
                    aria-pressed="${d.id === selectedEraId}">
              <span class="dynasty-name">${escapeHTML(d.name)}</span>
              <span class="dynasty-period">${escapeHTML(d.period)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.timeline-dynasty-node').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedEraId = btn.dataset.eraId;
        container.querySelectorAll('.timeline-dynasty-node').forEach(b => {
          const isActive = b.dataset.eraId === selectedEraId;
          b.classList.toggle('active', isActive);
          b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        if (onSelectEra) {
          onSelectEra(selectedEraId);
        }
      });
    });
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
    getSelectedEra: () => selectedEraId
  };
})();
