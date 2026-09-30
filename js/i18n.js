/**
 * Multilingual Language Component Module (English / Gujarati / Hindi)
 * Enables seamless switching of UI text and site details between EN, GU, and HI.
 */

const I18nComponent = (() => {
  const STORAGE_KEY = 'heritage_explorer_lang_v1';
  let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';

  const uiTranslations = {
    en: {
      brandTitle: 'Digital Heritage Explorer',
      brandSubtitle: 'Gujarat Historical Monuments & Architectural Treasures',
      searchPlaceholder: 'Search by site name, city, or keyword...',
      identifyBtn: '📷 Identify Monument',
      categoriesLabel: 'Categories:',
      resultsCount: 'heritage sites found',
      viewDetails: 'View details',
      getDirections: '📍 Get Directions (Google Maps)',
      officialLink: '🌐 Official Source / ASI Page',
      photoGallery: 'Photo Gallery',
      stampPassport: '🏵️ Stamp Passport',
      stampedBadge: '🏵️ Visited',
      openNow: '🟢 Open Now',
      closedNow: '🔴 Closed Now',
      bestTime: 'Best Season:',
      trailsLabel: '🗺️ Heritage Trails',
      timelineLabel: '⏳ Time Travel Slider:',
      suggestGem: '💎 Suggest Hidden Gem',
      nearMe: '📍 Near Me (GPS)'
    },
    gu: {
      brandTitle: 'ડિજિટલ હેરિટેજ એક્સપ્લોરર',
      brandSubtitle: 'ગુજરાતના ઐતિહાસિક સ્મારકો અને સ્થાપત્ય વારસો',
      searchPlaceholder: 'નામ, શહેર અથવા કીવર્ડ દ્વારા શોધો...',
      identifyBtn: '📷 સ્મારક ઓળખો',
      categoriesLabel: 'કેટેગરીઝ:',
      resultsCount: 'હેરિટેજ સ્થાનો મળ્યા',
      viewDetails: 'વિગતો જુઓ',
      getDirections: '📍 રસ્તો જુઓ (ગુગલ મેપ્સ)',
      officialLink: '🌐 સત્તાવાર પેજ (ASI/UNESCO)',
      photoGallery: 'ફોટો ગેલેરી',
      stampPassport: '🏵️ પાસપોર્ટ સ્ટેમ્પ કરો',
      stampedBadge: '🏵️ મુલાકાત લીધેલ',
      openNow: '🟢 અત્યારે ખુલ્લું છે',
      closedNow: '🔴 અત્યારે બંધ છે',
      bestTime: 'ઉત્તમ સમય:',
      trailsLabel: '🗺️ હેરિટેજ માર્ગો (ટ્રેલ્સ)',
      timelineLabel: '⏳ સમય યાત્રા સ્લાઇડર:',
      suggestGem: '💎 ગુપ્ત સ્થળ સૂચવો',
      nearMe: '📍 મારી નજીક (GPS)'
    },
    hi: {
      brandTitle: 'डिजिटल हेरिटेज एक्सप्लोरर',
      brandSubtitle: 'गुजरात के ऐतिहासिक स्मारक और स्थापत्य विरासत',
      searchPlaceholder: 'नाम, शहर या कीवर्ड से खोजें...',
      identifyBtn: '📷 स्मारक पहचानें',
      categoriesLabel: 'श्रेणियां:',
      resultsCount: 'विरासत स्थल मिले',
      viewDetails: 'विवरण देखें',
      getDirections: '📍 दिशा-निर्देश (गूगल मैप्स)',
      officialLink: '🌐 आधिकारिक पेज (ASI/UNESCO)',
      photoGallery: 'फोटो गैलरी',
      stampPassport: '🏵️ पासपोर्ट स्टाम्प करें',
      stampedBadge: '🏵️ दौरा किया गया',
      openNow: '🟢 अभी खुला है',
      closedNow: '🔴 अभी बंद है',
      bestTime: 'सर्वोत्तम समय:',
      trailsLabel: '🗺️ हेरिटेज ट्रेल्स',
      timelineLabel: '⏳ समय यात्रा स्लाइडर:',
      suggestGem: '💎 गुप्त स्थान का सुझाव दें',
      nearMe: '📍 मेरे पास (GPS)'
    }
  };

  function init(onLanguageChangeCallback) {
    renderLanguageSelector(onLanguageChangeCallback);
    applyUITranslations();
  }

  function getLang() {
    return currentLang;
  }

  function setLang(lang, callback) {
    if (['en', 'gu', 'hi'].includes(lang)) {
      currentLang = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      applyUITranslations();
      if (typeof callback === 'function') callback(lang);
    }
  }

  function t(key) {
    return (uiTranslations[currentLang] && uiTranslations[currentLang][key]) || uiTranslations.en[key] || key;
  }

  function getSiteText(site, field) {
    if (!site) return '';
    if (currentLang === 'gu' && site[`${field}_gu`]) return site[`${field}_gu`];
    if (currentLang === 'hi' && site[`${field}_hi`]) return site[`${field}_hi`];
    return site[field] || '';
  }

  function renderLanguageSelector(callback) {
    const langContainer = document.getElementById('lang-selector-container');
    if (!langContainer) return;

    langContainer.innerHTML = `
      <div class="lang-picker" role="group" aria-label="Language Selector">
        <button type="button" class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
        <button type="button" class="lang-btn ${currentLang === 'gu' ? 'active' : ''}" data-lang="gu">ગુજરાતી</button>
        <button type="button" class="lang-btn ${currentLang === 'hi' ? 'active' : ''}" data-lang="hi">हिंदी</button>
      </div>
    `;

    const btns = langContainer.querySelectorAll('.lang-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedLang = btn.dataset.lang;
        setLang(selectedLang, callback);
        btns.forEach(b => b.classList.toggle('active', b.dataset.lang === selectedLang));
      });
    });
  }

  function applyUITranslations() {
    // Translate static UI elements with data-i18n attributes
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.dataset.i18n;
      if (key) el.textContent = t(key);
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.placeholder = t('searchPlaceholder');
    }
  }

  return {
    init,
    getLang,
    setLang,
    t,
    getSiteText
  };
})();
