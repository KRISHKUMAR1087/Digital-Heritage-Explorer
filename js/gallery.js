/**
 * Gallery & Detail Modal Component Module
 * Handles displaying site details, image thumbnails, lightbox gallery, keyboard controls, and focus trapping.
 */

const GalleryComponent = (() => {
  // Modal Elements
  const detailModal = document.getElementById('detail-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalHeroImg = document.getElementById('modal-hero-img');
  const modalCategory = document.getElementById('modal-category');
  const modalCity = document.getElementById('modal-city');
  const modalTitle = document.getElementById('modal-title');
  const factPeriod = document.getElementById('fact-period');
  const factTimings = document.getElementById('fact-timings');
  const factEntryFee = document.getElementById('fact-entry-fee');
  const factBestTime = document.getElementById('fact-best-time');
  const modalDescription = document.getElementById('modal-description');
  const thumbnailStrip = document.getElementById('thumbnail-strip');
  const btnDirections = document.getElementById('btn-directions');

  // Lightbox Elements
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCloseBtn = document.getElementById('lightbox-close');
  const lightboxPrevBtn = document.getElementById('lightbox-prev');
  const lightboxNextBtn = document.getElementById('lightbox-next');

  // Lightbox State
  let currentImages = [];
  let currentImageIndex = 0;
  let previouslyFocusedElement = null;

  /**
   * Initialize modal and lightbox event listeners.
   */
  function init() {
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeDetailModal);
    }
    if (detailModal) {
      detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) closeDetailModal();
      });
    }

    if (lightboxCloseBtn) {
      lightboxCloseBtn.addEventListener('click', closeLightbox);
    }
    if (lightboxPrevBtn) {
      lightboxPrevBtn.addEventListener('click', showPrevImage);
    }
    if (lightboxNextBtn) {
      lightboxNextBtn.addEventListener('click', showNextImage);
    }
    if (lightboxModal) {
      lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) closeLightbox();
      });
    }

    // Global Keydown Handler (Esc & Arrow Keys)
    document.addEventListener('keydown', handleGlobalKeydown);
  }

  /**
   * Open site detail modal dialog.
   * @param {Object} site - Selected site object.
   */
  function openDetailModal(site) {
    if (!detailModal) return;
    previouslyFocusedElement = document.activeElement;

    modalHeroImg.src = site.cover;
    modalHeroImg.alt = `${site.name} cover image`;
    modalCategory.textContent = site.category;
    modalCity.textContent = site.city;
    modalTitle.textContent = site.name;
    factPeriod.textContent = site.period || 'Historical';
    factTimings.textContent = site.timings || 'Daylight Hours';
    factEntryFee.textContent = site.entryFee || 'Free / Standard Ticket';
    factBestTime.textContent = site.bestTime || 'October – March';
    modalDescription.textContent = site.description;

    // Directions Link (Google Maps Directions URL)
    if (btnDirections) {
      btnDirections.href = `https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}`;
      btnDirections.target = '_blank';
      btnDirections.rel = 'noopener noreferrer';
    }

    // Render Image Gallery Thumbnail Strip
    currentImages = site.images && site.images.length > 0 ? site.images : [{ src: site.cover, alt: site.name }];
    renderThumbnailStrip(currentImages);

    // Show modal & set focus
    detailModal.classList.add('active');
    detailModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      if (modalCloseBtn) modalCloseBtn.focus();
    }, 100);
  }

  /**
   * Close detail modal dialog.
   */
  function closeDetailModal() {
    if (!detailModal) return;
    detailModal.classList.remove('active');
    detailModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
      previouslyFocusedElement.focus();
    }
  }

  /**
   * Render image thumbnails into the detail modal.
   * @param {Array} images - Array of {src, alt} objects.
   */
  function renderThumbnailStrip(images) {
    if (!thumbnailStrip) return;
    thumbnailStrip.innerHTML = '';

    images.forEach((imgObj, index) => {
      const thumbBtn = document.createElement('button');
      thumbBtn.className = 'thumb-item';
      thumbBtn.setAttribute('type', 'button');
      thumbBtn.setAttribute('aria-label', `View photo ${index + 1}: ${imgObj.alt || ''}`);

      thumbBtn.innerHTML = `
        <img src="${imgObj.src}" alt="${escapeHTML(imgObj.alt || '')}" loading="lazy" />
      `;

      thumbBtn.addEventListener('click', () => {
        openLightbox(index);
      });

      thumbnailStrip.appendChild(thumbBtn);
    });
  }

  /**
   * Open full-screen Lightbox.
   * @param {number} index - Index of starting image.
   */
  function openLightbox(index) {
    if (!lightboxModal || currentImages.length === 0) return;
    currentImageIndex = index;
    updateLightboxImage();

    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      if (lightboxCloseBtn) lightboxCloseBtn.focus();
    }, 100);
  }

  /**
   * Close full-screen Lightbox.
   */
  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');

    if (detailModal && detailModal.classList.contains('active')) {
      if (modalCloseBtn) modalCloseBtn.focus();
    }
  }

  /**
   * Update lightbox image and caption.
   */
  function updateLightboxImage() {
    if (!currentImages[currentImageIndex]) return;
    const imgData = currentImages[currentImageIndex];
    lightboxImg.src = imgData.src;
    lightboxImg.alt = imgData.alt || 'Gallery photo';
    lightboxCaption.textContent = imgData.alt || `Photo ${currentImageIndex + 1} of ${currentImages.length}`;
  }

  /**
   * Navigate to previous image in lightbox.
   */
  function showPrevImage() {
    if (currentImages.length === 0) return;
    currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    updateLightboxImage();
  }

  /**
   * Navigate to next image in lightbox.
   */
  function showNextImage() {
    if (currentImages.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    updateLightboxImage();
  }

  /**
   * Handle Escape key and Arrow navigation.
   */
  function handleGlobalKeydown(e) {
    const isLightboxActive = lightboxModal && lightboxModal.classList.contains('active');
    const isDetailActive = detailModal && detailModal.classList.contains('active');

    if (isLightboxActive) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showPrevImage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        showNextImage();
      } else if (e.key === 'Tab') {
        trapFocus(e, lightboxModal);
      }
    } else if (isDetailActive) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDetailModal();
      } else if (e.key === 'Tab') {
        trapFocus(e, detailModal);
      }
    }
  }

  /**
   * Focus Trap Helper for Modal Accessibility.
   */
  function trapFocus(e, modalContainer) {
    const focusables = modalContainer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusables.length === 0) return;

    const firstEl = focusables[0];
    const lastEl = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
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
    init,
    openDetailModal,
    closeDetailModal
  };
})();
