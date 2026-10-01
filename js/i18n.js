/**
 * Multilingual Language Component Module (English / Gujarati / Hindi)
 * Enables seamless switching of UI text and site details across the entire website (EN, GU, HI).
 */

const I18nComponent = (() => {
  const STORAGE_KEY = 'heritage_explorer_lang_v1';
  let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';
  let changeCallbacks = [];

  const uiTranslations = {
    en: {
      brandTitle: 'Digital Heritage Explorer',
      brandSubtitle: 'Gujarat Historical Monuments & Architectural Treasures',
      heroTitle: 'Uncover 4,500 Years of Gujarat Architectural Heritage',
      heroSubtitle: 'Discover subterranean stepwells, equinox sun alignment simulators, Harappan Indus Valley cities, and Indo-Islamic fortresses with interactive 3D tours, audio guides, trip itineraries, and 100% offline access.',
      heroExplore: '🗺️ Explore Monuments & Map',
      heroTrails: '🛣️ Curated Heritage Trails',
      heroPlanner: '🎒 Plan Your Trip',
      heroIdentify: '📷 AI Photo Finder',
      searchPlaceholder: 'Search by site name, city, or keyword...',
      identifyBtn: '📷 Identify Monument',
      passportLabel: 'Passport:',
      stampedCount: 'Stamped',
      tripBtn: '🗺️ My Trip',
      installApp: '📲 Install App',
      offlineReady: '🌐 Offline Ready',
      checking: '🌐 Checking...',

      // Filters & Categories
      categoriesLabel: 'Categories:',
      trailsLabel: '🗺️ Heritage Trails:',
      timelineLabel: '⏳ Time Travel Slider:',
      smartFiltersLabel: '⚙️ Smart Filters:',
      
      // Category names
      catAll: 'All',
      catStepwell: 'Stepwell',
      catTemple: 'Temple',
      catFort: 'Fort & Ruins',
      catMosque: 'Mosque & Complex',
      catPalace: 'Palace',

      // Era names
      eraAll: 'All',
      eraHarappan: 'Harappan',
      eraMauryan: 'Mauryan',
      eraSolanki: 'Solanki',
      eraSultanate: 'Sultanate',
      eraColonial: 'Colonial',

      // Smart Filter options
      unescoAll: 'UNESCO: All Sites',
      unescoOnly: '🏛️ UNESCO Sites Only',
      unescoState: 'State / National Monuments',
      entryAll: 'Entry Fee: All',
      entryFree: '💚 Free Entry Only',
      entryPaid: '🎟️ Ticketed Entry',
      openAll: 'Visiting Hours: All',
      openOnly: '🟢 Open Now Only',

      // Action Buttons & Mobile Views
      nearMe: '📍 Near Me (GPS)',
      happeningThisMonth: '🎉 Happening This Month',
      suggestGem: '💎 Suggest Hidden Gem',
      listView: '📋 List View',
      mapView: '🗺️ Map View',

      // Results & Empty States
      resultsCount: 'heritage sites found',
      noSitesFound: 'No Heritage Sites Found',
      noSitesDesc: "We couldn't find any sites matching your search criteria. Try adjusting your search query, selecting a different era, or clearing filters.",

      // Card & Common Actions
      compare: 'Compare',
      addToTrip: '🗺️ Add to Trip',
      inTrip: '✅ In Trip',
      stamp: '🏵️ Stamp',
      stamped: '🏵️ Stamped',
      stampedBadge: '🏵️ Visited',
      viewDetails: 'View details',
      kmAway: 'km away',
      openNow: '🟢 Open Now',
      closedNow: '🔴 Closed Now',

      // Details Modal Labels
      historicalPeriod: 'Historical Period',
      visitingHours: 'Visiting Hours',
      entryFee: 'Entry Fee',
      bestTime: 'Best Season:',
      verifiedText: 'Verified',
      downloadPostcard: '🖼️ Download Postcard',
      officialLink: '🌐 Official Source / ASI Page',
      getDirections: '📍 Get Directions (Google Maps)',
      photoGallery: 'Photo Gallery',

      // Suggest Hidden Gem Modal
      gemTitle: '💎 Suggest a Lesser-Known Heritage Gem',
      gemSubtitle: 'Help expand local heritage tourism by suggesting an unlisted historical monument or stepwell.',
      gemNameLabel: 'Monument / Site Name *',
      gemCityLabel: 'City / District *',
      gemCategoryLabel: 'Category',
      gemDescLabel: 'History & Description',
      gemSubmit: '🚀 Submit Suggestion via GitHub Issue',

      // Photo Recognition Modal
      identifyTitle: '🔍 Identify Monument by Photo',
      identifySubtitle: 'Upload a photo or snap a picture using your camera to identify the heritage site.',
      tabUpload: '📁 Upload Image File',
      tabCamera: '📷 Camera Capture',
      dropzoneText: 'Drag & drop a heritage photo here, or click to browse',
      chooseFile: 'Choose Image File',
      takePhoto: '📸 Take Photo',

      // Side-by-Side Comparison
      compareTitle: '⚖️ Side-by-Side Heritage Site Comparison',
      compareSubtitle: 'Compare history, architectural features, visiting hours, and cultural status.',
      compareStickyText: '⚖️ Compare Sites',
      compareSideBySide: '⚖️ Compare Side-by-Side',
      selectOneMore: '(Select 1 more)',
      clear: '✕ Clear',

      // Trip Planner
      tripTitle: '🗺️ Heritage Trip Planner & Itinerary',
      tripSubtitle: 'Organize your Gujarat heritage tour, compute driving distance & time, and view on map.',
      emptyTripTitle: 'Your Itinerary is Empty',
      emptyTripDesc: 'Click "🗺️ Add to Trip" on any monument card to start building your custom Gujarat tour.',
      totalStops: 'Total Stops',
      roadDistance: 'Estimated Road Distance',
      tourTime: 'Total Tour Time',
      showRoute: '🗺️ Show Route on Map',
      exportPdf: '🖨️ Export PDF / Print Itinerary',
      shareLink: '🔗 Copy Shareable Link',
      clearTrip: '🗑️ Clear Trip',
      monumentsCount: 'Monuments',
      hours: 'Hours',

      // Footer
      footerText: '© Digital Heritage Explorer — Preserving and exploring Gujarat cultural heritage. Built with Leaflet.js & OpenStreetMap. Works offline.'
    },
    gu: {
      brandTitle: 'ડિજિટલ હેરિટેજ એક્સપ્લોરર',
      brandSubtitle: 'ગુજરાતના ઐતિહાસિક સ્મારકો અને સ્થાપત્ય વારસો',
      heroTitle: 'ગુજરાતના ૪,૫૦૦ વર્ષના સ્થાપત્ય વારસાની શોધ કરો',
      heroSubtitle: 'ભૂગર્ભ વાવ, સૂર્ય મંદિર વિષુવવૃત્તીય સિમ્યુલેટર, હડપ્પન સંસ્કૃતિના સ્થળો અને કિલ્લાઓ ૩D ટૂર, ઓડિયો ગાઇડ અને ઓફલાઇન મેપ સાથે જુઓ.',
      heroExplore: '🗺️ સ્મારકો અને નકશો જુઓ',
      heroTrails: '🛣️ હેરિટેજ ટ્રેલ્સ',
      heroPlanner: '🎒 પ્રવાસ આયોજન',
      heroIdentify: '📷 AI ફોટો ઓળખ',
      searchPlaceholder: 'નામ, શહેર અથવા કીવર્ડ દ્વારા શોધો...',
      identifyBtn: '📷 સ્મારક ઓળખો',
      passportLabel: 'પાસપોર્ટ:',
      stampedCount: 'સ્ટેમ્પ',
      tripBtn: '🗺️ મારી મુલાકાત',
      installApp: '📲 એપ ઇન્સ્ટોલ કરો',
      offlineReady: '🌐 ઓફલાઇન તૈયાર',
      checking: '🌐 ચકાસણી કરી રહ્યા છીએ...',

      // Filters & Categories
      categoriesLabel: 'કેટેગરીઝ:',
      trailsLabel: '🗺️ હેરિટેજ માર્ગો (ટ્રેલ્સ):',
      timelineLabel: '⏳ સમય યાત્રા સ્લાઇડર:',
      smartFiltersLabel: '⚙️ સ્માર્ટ ફિલ્ટર્સ:',
      
      // Category names
      catAll: 'બધા',
      catStepwell: 'વાવ (સ્ટેપવેલ)',
      catTemple: 'મંદિર',
      catFort: 'કિલ્લો અને અવશેષો',
      catMosque: 'મસ્જિદ અને પરિસર',
      catPalace: 'મહેલ',

      // Era names
      eraAll: 'બધા',
      eraHarappan: 'હડપ્પન સંસ્કૃતિ',
      eraMauryan: 'મૌર્ય કાળ',
      eraSolanki: 'સોલંકી યુગ',
      eraSultanate: 'સલ્તનત કાળ',
      eraColonial: 'બ્રિટિશ કાળ',

      // Smart Filter options
      unescoAll: 'યુનેસ્કો: બધા સ્થાનો',
      unescoOnly: '🏛️ માત્ર યુનેસ્કો સ્થાનો',
      unescoState: 'રાજ્ય / રાષ્ટ્રીય સ્મારકો',
      entryAll: 'પ્રવેશ ફી: બધા',
      entryFree: '💚 માત્ર નિઃશુલ્ક પ્રવેશ',
      entryPaid: '🎟️ ટિકિટવાળા સ્થાનો',
      openAll: 'મુલાકાત સમય: બધા',
      openOnly: '🟢 અત્યારે ખુલ્લા સ્થાનો',

      // Action Buttons & Mobile Views
      nearMe: '📍 મારી નજીક (GPS)',
      happeningThisMonth: '🎉 આ મહિને આયોજિત',
      suggestGem: '💎 ગુપ્ત સ્થળ સૂચવો',
      listView: '📋 યાદી વ્યૂ',
      mapView: '🗺️ નકશો વ્યૂ',

      // Results & Empty States
      resultsCount: 'હેરિટેજ સ્થાનો મળ્યા',
      noSitesFound: 'કોઈ હેરિટેજ સ્થળ મળ્યું નથી',
      noSitesDesc: 'તમારી શોધ મુજબ કોઈ સ્થળ મળ્યું નથી. કૃપા કરીને શોધ અથવા ફિલ્ટર બદલો.',

      // Card & Common Actions
      compare: 'સરખામણી કરો',
      addToTrip: '🗺️ પ્રવાસમાં ઉમેરો',
      inTrip: '✅ પ્રવાસમાં છે',
      stamp: '🏵️ સ્ટેમ્પ',
      stamped: '🏵️ સ્ટેમ્પ થયેલ',
      stampedBadge: '🏵️ મુલાકાત લીધેલ',
      viewDetails: 'વિગતો જુઓ',
      kmAway: 'કિમી દૂર',
      openNow: '🟢 અત્યારે ખુલ્લું છે',
      closedNow: '🔴 અત્યારે બંધ છે',

      // Details Modal Labels
      historicalPeriod: 'ઐતિહાસિક સમયગાળો',
      visitingHours: 'મુલાકાતનો સમય',
      entryFee: 'પ્રવેશ ફી',
      bestTime: 'ઉત્તમ સમય:',
      verifiedText: 'ચકાસાયેલ',
      downloadPostcard: '🖼️ પોસ્ટકાર્ડ ડાઉનલોડ કરો',
      officialLink: '🌐 સત્તાવાર પેજ (ASI/UNESCO)',
      getDirections: '📍 રસ્તો જુઓ (ગુગલ મેપ્સ)',
      photoGallery: 'ફોટો ગેલેરી',

      // Suggest Hidden Gem Modal
      gemTitle: '💎 અપ્રસિદ્ધ હેરિટેજ સ્થળ સૂચવો',
      gemSubtitle: 'અપ્રસિદ્ધ ઐતિહાસિક સ્મારક અથવા વાવની માહિતી આપીને સ્થાનિક પ્રવાસનને પ્રોત્સાહન આપો.',
      gemNameLabel: 'સ્મારક / સ્થળનું નામ *',
      gemCityLabel: 'શહેર / જિલ્લો *',
      gemCategoryLabel: 'કેટેગરી',
      gemDescLabel: 'ઇતિહાસ અને વર્ણન',
      gemSubmit: '🚀 સૂચન મોકલો',

      // Photo Recognition Modal
      identifyTitle: '🔍 ફોટો દ્વારા સ્મારક ઓળખો',
      identifySubtitle: 'હેરિટેજ સ્થળ ઓળખવા માટે ફોટો અપલોડ કરો અથવા કેમેરાથી ફોટો લો.',
      tabUpload: '📁 ઇમેજ ફાઇલ અપલોડ કરો',
      tabCamera: '📷 કેમેરા કેપ્ચર',
      dropzoneText: 'અહીં હેરિટેજ ફોટો ખેંચીને મૂકો, અથવા ક્લિક કરો',
      chooseFile: 'ઇમેજ ફાઇલ પસંદ કરો',
      takePhoto: '📸 ફોટો લો',

      // Side-by-Side Comparison
      compareTitle: '⚖️ સ્થાનોની સામસામે સરખામણી',
      compareSubtitle: 'ઇતિહાસ, સ્થાપત્ય, મુલાકાતનો સમય અને સાંસ્કૃતિક મહત્વની સરખામણી કરો.',
      compareStickyText: '⚖️ સરખામણી સ્થાનો',
      compareSideBySide: '⚖️ સામસામે સરખામણી કરો',
      selectOneMore: '(વધુ ૧ સ્થળ પસંદ કરો)',
      clear: '✕ ખાલી કરો',

      // Trip Planner
      tripTitle: '🗺️ હેરિટેજ પ્રવાસ આયોજક અને યાત્રાક્રમ',
      tripSubtitle: 'તમારા ગુજરાત પ્રવાસનું આયોજન કરો, અંતર અને સમય ગણો અને નકશા પર જુઓ.',
      emptyTripTitle: 'તમારો પ્રવાસક્રમ ખાલી છે',
      emptyTripDesc: 'કોઈપણ સ્મારક કાર્ડ પર "🗺️ પ્રવાસમાં ઉમેરો" પર ક્લિક કરીને તમારો પ્રવાસ બનાવો.',
      totalStops: 'કુલ સ્થાનો',
      roadDistance: 'અંદાજિત માર્ગ અંતર',
      tourTime: 'કુલ પ્રવાસ સમય',
      showRoute: '🗺️ નકશા પર રસ્તો જુઓ',
      exportPdf: '🖨️ પીડીએફ / પ્રિન્ટ આયોજન',
      shareLink: '🔗 લિંક કોપી કરો',
      clearTrip: '🗑️ પ્રવાસ સાફ કરો',
      monumentsCount: 'સ્મારકો',
      hours: 'કલાક',

      // Footer
      footerText: '© ડિજિટલ હેરિટેજ એક્સપ્લોરર — ગુજરાતની સાંસ્કૃતિક વિરાસતનું જતન અને સંગ્રહ. Leaflet.js અને OpenStreetMap સાથે નિર્મિત. ઓફલાઇન કામ કરે છે.'
    },
    hi: {
      brandTitle: 'डिजिटल हेरिटेज एक्सप्लोरर',
      brandSubtitle: 'गुजरात के ऐतिहासिक स्मारक और स्थापत्य विरासत',
      heroTitle: 'गुजरात की 4,500 वर्षों की वास्तुकला विरासत की खोज करें',
      heroSubtitle: 'भूमिगत बावड़ियों, सूर्य मंदिर विषुव संक्रांति सिम्युलेटर, हड़प्पा सभ्यता के स्थलों और किलों को 3D टूर, ऑडियो गाइड और 100% ऑफ़लाइन मानचित्र के साथ देखें।',
      heroExplore: '🗺️ स्मारक और मानचित्र देखें',
      heroTrails: '🛣️ हेरिटेज ट्रेल्स',
      heroPlanner: '🎒 यात्रा की योजना बनाएं',
      heroIdentify: '📷 AI फोटो पहचान',
      searchPlaceholder: 'नाम, शहर या कीवर्ड से खोजें...',
      identifyBtn: '📷 स्मारक पहचानें',
      passportLabel: 'पासपोर्ट:',
      stampedCount: 'स्टाम्प',
      tripBtn: '🗺️ मेरी यात्रा',
      installApp: '📲 ऐप इंस्टॉल करें',
      offlineReady: '🌐 ऑफ़लाइन तैयार',
      checking: '🌐 जांच की जा रही है...',

      // Filters & Categories
      categoriesLabel: 'श्रेणियां:',
      trailsLabel: '🗺️ हेरिटेज ट्रेल्स:',
      timelineLabel: '⏳ समय यात्रा स्लाइडर:',
      smartFiltersLabel: '⚙️ स्मार्ट फ़िल्टर:',

      // Category names
      catAll: 'सभी',
      catStepwell: 'बावड़ी (स्टेपवेल)',
      catTemple: 'मंदिर',
      catFort: 'किला और अवशेष',
      catMosque: 'मस्जिद और परिसर',
      catPalace: 'महल',

      // Era names
      eraAll: 'सभी',
      eraHarappan: 'हड़प्पा संस्कृति',
      eraMauryan: 'मौर्य काल',
      eraSolanki: 'सोलंकी युग',
      eraSultanate: 'सल्तनत काल',
      eraColonial: 'ब्रिटिश काल',

      // Smart Filter options
      unescoAll: 'यूनेस्को: सभी स्थल',
      unescoOnly: '🏛️ केवल यूनेस्को स्थल',
      unescoState: 'राज्य / राष्ट्रीय स्मारक',
      entryAll: 'प्रवेश शुल्क: सभी',
      entryFree: '💚 केवल मुफ्त प्रवेश',
      entryPaid: '🎟️ सशुल्क प्रवेश',
      openAll: 'दर्शन समय: सभी',
      openOnly: '🟢 केवल अभी खुले',

      // Action Buttons & Mobile Views
      nearMe: '📍 मेरे पास (GPS)',
      happeningThisMonth: '🎉 इस महीने के आयोजन',
      suggestGem: '💎 गुप्त स्थान का सुझाव दें',
      listView: '📋 सूची दृश्य',
      mapView: '🗺️ मानचित्र दृश्य',

      // Results & Empty States
      resultsCount: 'विरासत स्थल मिले',
      noSitesFound: 'कोई विरासत स्थल नहीं मिला',
      noSitesDesc: 'आपकी खोज से मेल खाता कोई भी स्थल नहीं मिला। कृपया अपनी खोज या फ़िल्टर बदलें।',

      // Card & Common Actions
      compare: 'तुलना करें',
      addToTrip: '🗺️ यात्रा में जोड़ें',
      inTrip: '✅ यात्रा में शामिल',
      stamp: '🏵️ स्टाम्प',
      stamped: '🏵️ स्टाम्पित',
      stampedBadge: '🏵️ दौरा किया गया',
      viewDetails: 'विवरण देखें',
      kmAway: 'किमी दूर',
      openNow: '🟢 अभी खुला है',
      closedNow: '🔴 अभी बंद है',

      // Details Modal Labels
      historicalPeriod: 'ऐतिहासिक काल',
      visitingHours: 'दर्शन समय',
      entryFee: 'प्रवेश शुल्क',
      bestTime: 'सर्वोत्तम समय:',
      verifiedText: 'सत्यापित',
      downloadPostcard: '🖼️ पोस्टकार्ड डाउनलोड करें',
      officialLink: '🌐 आधिकारिक पेज (ASI/UNESCO)',
      getDirections: '📍 दिशा-निर्देश (गूगल मैप्स)',
      photoGallery: 'फोटो गैलरी',

      // Suggest Hidden Gem Modal
      gemTitle: '💎 अल्पज्ञात विरासत स्थल का सुझाव दें',
      gemSubtitle: 'किसी अनसूचीबद्ध ऐतिहासिक स्मारक या बावड़ी का सुझाव देकर स्थानीय पर्यटन को बढ़ावा दें।',
      gemNameLabel: 'स्मारक / स्थल का नाम *',
      gemCityLabel: 'शहर / जिला *',
      gemCategoryLabel: 'श्रेणी',
      gemDescLabel: 'इतिहास और विवरण',
      gemSubmit: '🚀 सुझाव भेजें',

      // Photo Recognition Modal
      identifyTitle: '🔍 फोटो से स्मारक पहचानें',
      identifySubtitle: 'विरासत स्थल को पहचानने के लिए फोटो अपलोड करें या कैमरे का उपयोग करें।',
      tabUpload: '📁 इमेज फाइल अपलोड करें',
      tabCamera: '📷 कैमरा कैप्चर',
      dropzoneText: 'यहां फोटो खींचकर लाएं, या ब्राउज़ करने के लिए क्लिक करें',
      chooseFile: 'इमेज फाइल चुनें',
      takePhoto: '📸 फोटो लें',

      // Side-by-Side Comparison
      compareTitle: '⚖️ तुलनात्मक विरासत स्थल विवरण',
      compareSubtitle: 'इतिहास, वास्तुकला, दर्शन समय और सांस्कृतिक महत्व की तुलना करें।',
      compareStickyText: '⚖️ स्थलों की तुलना',
      compareSideBySide: '⚖️ आमने-सामने तुलना करें',
      selectOneMore: '(1 और चुनें)',
      clear: '✕ साफ़ करें',

      // Trip Planner
      tripTitle: '🗺️ हेरिटेज यात्रा योजना और मार्गदर्शिका',
      tripSubtitle: 'अपनी गुजरात यात्रा की योजना बनाएं, दूरी और समय की गणना करें तथा मानचित्र पर देखें।',
      emptyTripTitle: 'आपकी यात्रा सूची खाली है',
      emptyTripDesc: 'अपनी यात्रा बनाने के लिए किसी भी स्मारक कार्ड पर "🗺️ यात्रा में जोड़ें" पर क्लिक करें।',
      totalStops: 'कुल पड़ाव',
      roadDistance: 'अनुमानित सड़क दूरी',
      tourTime: 'कुल यात्रा समय',
      showRoute: '🗺️ मानचित्र पर मार्ग देखें',
      exportPdf: '🖨️ पीडीएफ / प्रिंट योजना',
      shareLink: '🔗 शेयर लिंक कॉपी करें',
      clearTrip: '🗑️ यात्रा साफ़ करें',
      monumentsCount: 'स्मारक',
      hours: 'घंटे',

      // Footer
      footerText: '© डिजिटल हेरिटेज एक्सप्लोरर — गुजरात की सांस्कृतिक विरासत का संरक्षण एवं अन्वेषण। Leaflet.js और OpenStreetMap द्वारा संचालित। ऑफ़लाइन कार्य करता है।'
    }
  };

  function init(onLanguageChangeCallback) {
    if (typeof onLanguageChangeCallback === 'function') {
      changeCallbacks.push(onLanguageChangeCallback);
    }
    renderLanguageSelector();
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

      if (typeof callback === 'function') {
        callback(lang);
      }
      changeCallbacks.forEach(cb => {
        try { cb(lang); } catch (e) { console.error('Error in i18n callback:', e); }
      });
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

  function renderLanguageSelector() {
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
        setLang(selectedLang);
        btns.forEach(b => b.classList.toggle('active', b.dataset.lang === selectedLang));
      });
    });
  }

  function applyUITranslations() {
    // 1. Translate static UI elements with data-i18n attributes
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.dataset.i18n;
      if (key && uiTranslations[currentLang] && uiTranslations[currentLang][key] !== undefined) {
        el.textContent = t(key);
      }
    });

    // 2. Search placeholder
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.placeholder = t('searchPlaceholder');
    }

    // 3. Smart Filter Select Options
    updateSelectOptions('filter-unesco', [
      { val: 'All', key: 'unescoAll' },
      { val: 'true', key: 'unescoOnly' },
      { val: 'false', key: 'unescoState' }
    ]);

    updateSelectOptions('filter-entry', [
      { val: 'All', key: 'entryAll' },
      { val: 'free', key: 'entryFree' },
      { val: 'paid', key: 'entryPaid' }
    ]);

    updateSelectOptions('filter-open', [
      { val: 'All', key: 'openAll' },
      { val: 'true', key: 'openOnly' }
    ]);
  }

  function updateSelectOptions(selectId, optionsMap) {
    const select = document.getElementById(selectId);
    if (!select) return;

    optionsMap.forEach(opt => {
      const optionEl = select.querySelector(`option[value="${opt.val}"]`);
      if (optionEl) {
        optionEl.textContent = t(opt.key);
      }
    });
  }

  return {
    init,
    getLang,
    getCurrentLang: getLang,
    setLang,
    t,
    getSiteText
  };
})();

window.I18nComponent = I18nComponent;
