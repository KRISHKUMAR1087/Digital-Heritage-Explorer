/**
 * Gallery & Detail Modal Component Module
 * Handles displaying site details, image thumbnails, lightbox gallery, keyboard controls, focus trapping,
 * verified provenance links, and Stepwell Cross-Section Explorer tabs.
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
  
  // Verification / Provenance Elements
  const factVerified = document.getElementById('fact-verified');
  const officialLink = document.getElementById('btn-official-link');
  const stepwellContainer = document.getElementById('stepwell-explorer-container');
  const sunContainer = document.getElementById('sun-simulator-container');
  const audioContainer = document.getElementById('audio-guide-container');
  const compareContainer = document.getElementById('compare-slider-container');
  const livingContainer = document.getElementById('living-heritage-container');
  const threeDContainer = document.getElementById('threeD-explorer-container');
  const weatherContainer = document.getElementById('weather-widget-container');
  const quizContainer = document.getElementById('quiz-container');
  const communityContainer = document.getElementById('community-container');

  // Lightbox Elements
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCredit = document.getElementById('lightbox-credit');
  const lightboxCloseBtn = document.getElementById('lightbox-close');
  const lightboxPrevBtn = document.getElementById('lightbox-prev');
  const lightboxNextBtn = document.getElementById('lightbox-next');

  const btnPostcard = document.getElementById('btn-create-postcard');

  // State
  let currentImages = [];
  let currentImageIndex = 0;
  let previouslyFocusedElement = null;
  let activeSite = null;

  function init() {
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeDetailModal);
    if (detailModal) {
      detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) closeDetailModal();
      });
    }

    if (btnPostcard) {
      btnPostcard.addEventListener('click', () => {
        if (activeSite && window.PostcardComponent) {
          PostcardComponent.generatePostcard(activeSite);
        }
      });
    }

    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
    if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', showPrevImage);
    if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', showNextImage);
    if (lightboxModal) {
      lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) closeLightbox();
      });
    }

    document.addEventListener('keydown', handleGlobalKeydown);
  }

  function openDetailModal(site) {
    if (!detailModal) return;
    previouslyFocusedElement = document.activeElement;
    activeSite = site;

    const getSiteText = (s, f) => window.I18nComponent ? I18nComponent.getSiteText(s, f) : (s ? s[f] : '');
    const t = (k) => window.I18nComponent ? I18nComponent.t(k) : k;

    modalHeroImg.src = site.cover;
    modalHeroImg.alt = `${getSiteText(site, 'name')} cover image`;
    modalCategory.textContent = site.category;
    modalCity.textContent = getSiteText(site, 'city');
    modalTitle.textContent = getSiteText(site, 'name');
    factPeriod.textContent = getSiteText(site, 'period') || 'Historical';
    factTimings.textContent = getSiteText(site, 'timings') || 'Daylight Hours';
    factEntryFee.textContent = getSiteText(site, 'entryFee') || 'Free / Standard Ticket';
    factBestTime.textContent = getSiteText(site, 'bestTime') || 'October – March';
    modalDescription.textContent = getSiteText(site, 'description') || getSiteText(site, 'summary');

    // Live Distance Widget
    const liveWidget = document.getElementById('modal-live-distance-widget');
    const liveDistText = document.getElementById('modal-live-dist-text');
    const liveDistDrive = document.getElementById('modal-live-dist-drive');
    const userLoc = window.TouristToolsComponent ? TouristToolsComponent.getUserLocation() : null;

    if (liveWidget && userLoc) {
      const distKm = TouristToolsComponent.calculateDistance(userLoc.lat, userLoc.lng, site.lat, site.lng);
      const formattedDist = TouristToolsComponent.formatDistance(distKm);
      const estMinutes = Math.round((distKm / 45) * 60);

      if (liveDistText) liveDistText.textContent = `${formattedDist} from your live location (${userLoc.name || 'GPS Active'})`;
      if (liveDistDrive) liveDistDrive.textContent = `🚗 ~${estMinutes} min drive from live position`;
      liveWidget.style.display = 'flex';
    } else if (liveWidget) {
      liveWidget.style.display = 'none';
    }

    // Verified Source & Provenance
    if (factVerified) {
      factVerified.textContent = `${t('verifiedText')} ${site.lastVerified || '2026-09'} (${site.source || 'ASI / UNESCO'})`;
    }
    if (officialLink && site.officialUrl) {
      officialLink.href = site.officialUrl;
      officialLink.style.display = 'inline-flex';
    } else if (officialLink) {
      officialLink.style.display = 'none';
    }

    // Directions Link via RoutingComponent
    if (window.RoutingComponent) {
      RoutingComponent.updateDirectionsButtonInModal(site);
    } else if (btnDirections) {
      btnDirections.href = `https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}`;
      btnDirections.target = '_blank';
      btnDirections.rel = 'noopener noreferrer';
    }

    // Stepwell Cross-Section Explorer (rendered if site.levels exists)
    if (stepwellContainer && window.StepwellComponent) {
      StepwellComponent.render(site, stepwellContainer);
    }

    // Sun Alignment Simulator (rendered for Modhera Sun Temple)
    if (sunContainer && window.SunComponent) {
      SunComponent.render(site, sunContainer);
    }

    // Audio Guide (Web Speech API)
    if (audioContainer && window.AudioGuideComponent) {
      AudioGuideComponent.render(site, audioContainer);
    }

    // Then & Now Image Comparison Slider
    if (compareContainer && window.CompareComponent) {
      CompareComponent.render(site, compareContainer);
    }

    // Living Heritage Layer
    if (livingContainer && window.LivingComponent) {
      LivingComponent.render(site, livingContainer);
    }

    // 3D & 360 Street View Explorer
    if (threeDContainer && window.ThreeDExplorerComponent) {
      ThreeDExplorerComponent.render(site, threeDContainer);
    }

    // Live Weather & Best Time to Visit
    if (weatherContainer && window.WeatherComponent) {
      WeatherComponent.render(site, weatherContainer);
    }

    // Heritage Quiz & Scholar Badges
    if (quizContainer && window.QuizComponent) {
      QuizComponent.render(site, quizContainer);
    }

    // Community Layer & Submissions
    if (communityContainer && window.CommunityComponent) {
      CommunityComponent.render(site, communityContainer);
    }

    // Thumbnail Gallery
    currentImages = site.images && site.images.length > 0 ? site.images : [{ src: site.cover, alt: site.name, credit: 'Public Domain', license: 'CC BY-SA 4.0' }];
    renderThumbnailStrip(currentImages);

    // Update Dynamic SEO Metadata, Open Graph & JSON-LD
    if (window.SeoComponent) {
      SeoComponent.updateMetadata(site);
    }

    detailModal.classList.add('active');
    detailModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      if (modalCloseBtn) modalCloseBtn.focus();
    }, 100);
  }

  function closeDetailModal() {
    if (!detailModal) return;

    // Reset SEO Metadata to default homepage
    if (window.SeoComponent) {
      SeoComponent.updateMetadata(null);
    }

    // Stop audio speech if playing
    if (window.AudioGuideComponent) {
      AudioGuideComponent.stopSpeech();
    }

    detailModal.classList.remove('active');
    detailModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // If URL has a hash routing for this site, clear hash back to #/
    if (window.location.hash.startsWith('#/site/')) {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }

    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
      previouslyFocusedElement.focus();
    }
  }

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

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');

    if (detailModal && detailModal.classList.contains('active')) {
      if (modalCloseBtn) modalCloseBtn.focus();
    }
  }

  function updateLightboxImage() {
    if (!currentImages[currentImageIndex]) return;
    const imgData = currentImages[currentImageIndex];
    lightboxImg.src = imgData.src;
    lightboxImg.alt = imgData.alt || 'Gallery photo';
    lightboxCaption.textContent = imgData.alt || `Photo ${currentImageIndex + 1} of ${currentImages.length}`;

    if (lightboxCredit) {
      lightboxCredit.textContent = `📷 ${imgData.credit || 'Wikimedia Commons'} • ${imgData.license || 'CC BY-SA 4.0'}`;
    }
  }

  function showPrevImage() {
    if (currentImages.length === 0) return;
    currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    updateLightboxImage();
  }

  function showNextImage() {
    if (currentImages.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    updateLightboxImage();
  }

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

  function refreshModal() {
    if (activeSite && detailModal && detailModal.classList.contains('active')) {
      openDetailModal(activeSite);
    }
  }

  return {
    init,
    openDetailModal,
    closeDetailModal,
    refreshModal
  };
})();

window.GalleryComponent = GalleryComponent;
