# Digital Heritage Explorer 🏛️

**Digital Heritage Explorer** is a high-performance, offline-first front-end web application built for local heritage tourism in **Gujarat, India**. It presents historical stepwells, sun temples, ancient Harappan cities, Sultanate mosques, and fortresses as an interactive virtual gallery linked with Leaflet maps, visual photo recognition, solar alignment simulation, subterranean storey exploration, audio narration, PWA offline caching, trip itinerary planning, OSRM road routing, live Open-Meteo weather forecasts, 360 panoramas, heritage quizzes, dynasty timelines, and community reviews.

---

## 🌟 Comprehensive Feature Suite & Architectural Modules

1. **Performance & SEO (`js/seo.js`):**
   - Dynamic document title and meta description updates on site navigation.
   - Open Graph (`og:title`, `og:image`, `og:url`) tag synchronization for social sharing.
   - Microdata JSON-LD injection (`Schema.org TouristAttraction`) per monument.

2. **Smart Search & Filters (`js/search.js`):**
   - Full-text debounced fuzzy search across monument names, descriptions, dynasties, and materials in 3 languages (**English, Gujarati, Hindi**).
   - Smart dropdown filters: UNESCO World Heritage status, Free vs. Ticketed Entry, and Open Now status.
   - Dynamic URL hash synchronization (`#/search?q=vav&unesco=true`).

3. **Accessibility Upgrade (`js/a11y.js` & upgraded `js/audio.js`):**
   - Text size scaler (100%–130%), high-contrast dark theme toggle, and reduced motion preference detector.
   - Keyboard skip-to-main-content link (`#main-content`) and accessible focus trapping in modals (`trapFocus`/`untrapFocus`).
   - Multilingual audio guide upgrades: playback speed controls (0.75x–1.5x), sleep timers (5m/15m/30m), and persistent audio transcript.

4. **PWA & Offline Mode (`sw.js`, `manifest.json`, `js/pwa.js`):**
   - Full Web App Manifest (`manifest.json`) and Service Worker (`sw.js`) pre-caching app shell, monument JSON datasets, icons, and dynamic runtime tile caching for OpenStreetMap.
   - PWA install prompt button (`#btn-install-pwa`), `⚡ Offline Ready` status badge, and network drop alert banner.

5. **Trip Planner & Itinerary Builder (`js/planner.js`):**
   - `"🗺️ Add to Trip"` button on cards with interactive reordering (Up/Down legs).
   - Distance (km) & drive duration calculations (assuming 50 km/h average speed + site visit duration).
   - Polyline route drawing on Leaflet map with numbered step markers.
   - Export printable PDF view (`@media print`) and copyable deep link hash (`#/trip?sites=id1,id2`).

6. **Real Route Navigation (`js/routing.js`):**
   - Fetches real road paths, distances, and travel times from OSRM (Open Source Routing Machine) API with automatic Haversine straight-line fallback.
   - `"📍 Get Directions"` button generates Google Maps navigation deep links with origin GPS parameters.

7. **Live Weather & Best Time (`js/weather.js`):**
   - Live telemetry integration via Open-Meteo free API (no API key required).
   - Displays current temperature, wind speed, WMO weather condition icons, 3-day max/min forecast grid, and seasonal advice tips.

8. **Virtual 360 Tour & Panorama (`js/panorama.js` & `js/threeDExplorer.js`):**
   - Interactive 360° street view equirectangular canvas with hotspot pin details.
   - Fullscreen stage toggle and mobile orientation/gyroscope control (`DeviceOrientation` API).
   - 3D WebGL architectural orbit model with wireframe mode and auto-rotation.

9. **Heritage Quiz & Passport Badges (`js/quiz.js`):**
   - Multilingual 5-question historical quiz per monument with answer feedback and explanations.
   - Awards Scholar Stamp badges and updates Heritage Passport counter in `localStorage`.

10. **Timeline of Dynasties (`js/timeline.js`):**
    - Horizontal scrollable timeline bar mapping **Maurya → Solanki → Sultanate → Gaekwad → Modern** historical eras.
    - One-click filtering of monuments by era.

11. **Community Layer (`js/community.js`):**
    - Traveler review and photo story submission form with moderation queue (`pending_moderation`).
    - Visited counter and star rating system stored safely in `localStorage`.

12. **Postcard & Cultural Upgrades (`js/postcard.js` & `js/living.js`):**
    - Postcard generator with template choices (Classic Sandstone, Terracotta Night, Royal Gold), custom message input, and Web Share API (`navigator.share`).
    - Living heritage cultural calendar with `"📅 Add to Google Calendar"` direct links for regional festivals.

---

## 📁 Modular File Structure

```
Digital-Heritage-Explorer/
├── index.html           # Main HTML shell, accessible header, filter bar, modals & script tags
├── manifest.json        # Web App Manifest for PWA compliance
├── sw.js                # Service Worker precaching app shell & dynamic map tiles
├── css/
│   └── style.css        # Responsive stylesheet with high-contrast, PWA, trip, & weather styles
├── js/
│   ├── app.js           # Main app bootstrap, filter pipeline, & hash routing
│   ├── cards.js         # Site cards grid, trip toggles, & compare checkboxes
│   ├── map.js           # Leaflet map, custom pins, & route polyline rendering
│   ├── gallery.js       # Detail modal coordinator & lightbox gallery
│   ├── stepwell.js      # Stepwell Cross-Section Explorer SVG cut-away diagram
│   ├── sun.js           # Sun Alignment Simulator for Modhera Sun Temple
│   ├── audio.js         # Multilingual Audio Guide (Web Speech API with sleep timer & speed)
│   ├── compare.js       # Then & Now Historical Image Comparison Slider
│   ├── living.js        # Living Heritage layer & Google Calendar festival links
│   ├── siteCompare.js   # Side-by-side site comparison modal & sticky bottom bar
│   ├── postcard.js      # HTML5 Canvas postcard generator with template choices & Web Share
│   ├── recognition.js   # Visual landmark photo finder with <50% confidence warning
│   ├── passport.js      # Heritage Passport & localStorage stamp state
│   ├── i18n.js          # Multilingual text provider (EN / GU / HI)
│   ├── trails.js        # Curated Heritage Trails module
│   ├── touristTools.js  # Live open status, GPS Near Me, & hidden gem form
│   ├── search.js        # Smart search & URL hash sync
│   ├── seo.js           # Dynamic SEO meta, Open Graph & JSON-LD TouristAttraction
│   ├── a11y.js          # Accessibility font scaler, high contrast, focus trapping
│   ├── pwa.js           # Service worker registration, install prompt & offline alert banner
│   ├── planner.js       # Trip Planner, itinerary reordering, total distance & PDF print
│   ├── routing.js       # OSRM road routing API integration with Haversine fallback
│   ├── weather.js       # Open-Meteo live weather & 3-day forecast
│   ├── panorama.js      # 360 panorama gyroscope & fullscreen stage controls
│   ├── quiz.js          # Multilingual 5-question quiz & scholar badge rewards
│   ├── timeline.js      # Dynasty chronology timeline bar
│   └── community.js     # Moderated story submissions & star ratings
├── data/
│   ├── sites.json       # Master monument JSON dataset
│   └── trails.json      # Curated heritage trail routes
├── images/              # WebP photograph assets & PWA app icons
└── README.md            # Comprehensive project documentation
```

---

## 🧪 Manual Verification Checklist

### Desktop Browsers (Chrome / Firefox / Edge):
1. **PWA & Offline Mode:** Open DevTools → Network → Select "Offline". Reload page. App shell loads instantly and `⚡ Offline Ready` badge turns green. Offline alert banner appears if connection drops.
2. **Search & Smart Filters:** Type `vav` into search box. Filter by `UNESCO Sites Only` and `Free Entry Only`. Observe URL hash updating to `#/search?...`.
3. **Accessibility:** Click `♿ A11y` toggle to test Text Size Scaling (100% → 130%), High Contrast Mode, and keyboard `Tab` focus trapping in detail modal.
4. **Trip Planner:** Click `"🗺️ Add to Trip"` on Rani ki Vav and Modhera Sun Temple. Open `"🗺️ My Trip"`. Reorder stops, check distance/time stats, click `"🗺️ Show Route on Map"`, and test `"🖨️ Export PDF / Print Itinerary"`.
5. **Real Navigation & Weather:** Open detail modal for Modhera Sun Temple. Verify live temperature and 3-day forecast via Open-Meteo API. Click `"📍 Get Directions"` to test Google Maps deep link.
6. **Quiz & Scholar Stamp:** Open detail modal → Scroll to `"🎯 Heritage Quiz & Scholar Badge"`. Answer questions, review explanation feedback, and verify passport stamp awarded.

### Mobile Viewports (Down to 360px):
1. Mobile navigation bar switches smoothly between Card List view and Map view using bottom toggle buttons.
2. Filter bar chips horizontal scroll naturally on small screens.
3. Postcard generator triggers native Web Share sheet on mobile devices (`navigator.share`).
