# Digital Heritage Explorer 🏛️

**Digital Heritage Explorer** is an offline-capable, front-end web application built for local heritage tourism in **Gujarat, India**. It presents historical stepwells, sun temples, ancient Harappan cities, Sultanate mosques, and fortresses as an interactive virtual gallery linked with Leaflet maps, visual photo recognition, solar alignment simulation, subterranean storey exploration, audio narration, and full offline caching.

---

## 🌟 Key Features & Interactive Tools

1. **Stepwell Cross-Section Explorer (`js/stepwell.js`):**
   - Interactive vertical SVG cut-away diagram for multi-storey subterranean stepwells (*Rani ki Vav: 7 storeys, Adalaj Stepwell: 5 storeys*).
   - "Go Up / Go Deeper" controls, keyboard `ArrowUp`/`ArrowDown` navigation, and mouse wheel scrolling.
   - Side panel displays storey descriptions and *"What to look for"* architectural friezes.

2. **Sun Alignment Simulator (`js/sun.js`):**
   - Dedicated interactive solar simulator for **Modhera Sun Temple**.
   - Interactive SVG top-view plan (*Surya Kunda → Torana → Sabha Mandapa → Guda Mandapa → Garbhagriha facing 90° East*).
   - Date slider (1 Jan – 31 Dec, Day 1..365), Equinox/Solstice preset buttons, and Sunrise/Noon/Sunset time buttons.
   - Solar azimuth calculation for Lat 23.58° N; highlights Equinox dates (~20 Mar, 23 Sep) with direct sanctum beam alignment and golden Garbhagriha glow.
   - Visible note: *"Simplified educational model, not an exact reconstruction."*

3. **Multilingual Audio Guide (`js/audio.js`):**
   - Speech synthesis narration in **English, Gujarati (`gu-IN`), and Hindi (`hi-IN`)** for all monuments.
   - Play ▶️, Pause ⏸️, Stop ⏹️ controls with missing voice detection and fallback transcript display.
   - Automatically stops speech when the detail modal is closed.

4. **Then & Now Historical Comparison Slider (`js/compare.js`):**
   - Draggable before/after image slider with mouse drag, touch support, range slider, and Left/Right keyboard arrow navigation.
   - Displays archival era, photographer credits, and licensing terms.
   - Supports `"TODO add image"` placeholders with sepia vintage filter fallback.

5. **Living Heritage Layer (`js/living.js`):**
   - Section in detail modal showcasing intangible crafts (*Patan Patola weaving, Kutch embroidery, Ajrakh printing*), Sufi Qawwali, and regional festivals (*Modhera Dance Festival, Navratri Garba, Rann Utsav*).
   - Header filter button **"🎉 Happening This Month"** filters monuments with active festivals in the current month (`new Date().getMonth() + 1`).

6. **Side-by-Side Site Comparison (`js/siteCompare.js`):**
   - Select up to 2 site cards via **"Compare"** checkboxes.
   - Displays a sticky bottom comparison bar (`#compare-sticky-bar`) and side-by-side comparison modal table comparing architectural styles, patrons, materials, UNESCO status, fees, and visiting hours.

7. **Shareable Digital Postcard Generator (`js/postcard.js`):**
   - Renders site cover photo, category badge, site title, city, historical era, summary text, and official passport stamp seal onto a **1200x800 HTML5 Canvas**.
   - Triggers direct PNG image download (`<site-id>-digital-postcard.png`).

8. **Visual Photo Recognition (`js/recognition.js`):**
   - Identify monuments from image upload or live camera stream using color histogram & luminance analysis with top 3 confidence matches and low-confidence alerts (< 50%).

9. **Offline Support & Self-Hosted Assets:**
   - Self-hosted Leaflet library (`vendor/leaflet/`) and a registered Service Worker (`sw.js`) providing 100% offline capability.

---

## 📁 Project Structure

```
digital-heritage-explorer/
├── index.html           # Main HTML structure, modal containers & script tags
├── css/
│   └── style.css        # Heritage theme system, badges, sliders, & responsive grids
├── js/
│   ├── cards.js         # Site cards grid, compare checkboxes, & distance calculation
│   ├── map.js           # Leaflet map setup, custom markers, & fly-to bounds
│   ├── gallery.js       # Detail modal coordinator & lightbox gallery
│   ├── stepwell.js      # Stepwell Cross-Section Explorer SVG cut-away diagram
│   ├── sun.js           # Sun Alignment Simulator for Modhera Sun Temple
│   ├── audio.js         # Multilingual Audio Guide (Web Speech API)
│   ├── compare.js       # Then & Now Image Comparison Slider
│   ├── living.js        # Living Heritage layer & "Happening this month" filter
│   ├── siteCompare.js   # Side-by-side comparison modal & sticky bottom bar
│   ├── postcard.js      # 1200x800 HTML5 Canvas digital postcard generator
│   ├── recognition.js   # Landmark photo finder with confidence scores
│   ├── passport.js      # Heritage Passport & localStorage stamp state
│   ├── i18n.js          # Multilingual text provider (EN / GU / HI)
│   ├── trails.js        # Curated Heritage Trails module
│   ├── touristTools.js  # Live open status, GPS Near Me, & hidden gem form
│   └── app.js           # Main bootstrap, filter pipeline, hash routing, & SW
├── data/
│   ├── sites.json       # Master JSON database (levels, story, historic, living, style, builder, material, unesco)
│   └── trails.json      # Curated heritage trail routes
├── images/              # Optimized WebP image assets
├── sw.js                # Offline Service Worker script
└── README.md
```

---

## 📋 Data Model Schema (`data/sites.json`)

```json
{
  "id": "modhera-sun-temple",
  "name": "Modhera Sun Temple",
  "name_gu": "મોઢેરા સૂર્ય મંદિર",
  "name_hi": "मोढेरा सूर्य मंदिर",
  "category": "Temple",
  "city": "Modhera",
  "lat": 23.5835,
  "lng": 72.1331,
  "year": 1026,
  "era": "Solanki",
  "style": "Chaulukya (Solanki)",
  "builder": "King Bhima I",
  "material": "Golden Sandstone",
  "unesco": false,
  "summary": "Solanki architectural triumph dedicated to Sun God Surya...",
  "description": "Constructed in 1026–27 AD...",
  "period": "11th Century AD (1026 AD)",
  "timings": "7:00 AM – 6:00 PM (Daily)",
  "entryFee": "₹25 (Indian citizens)",
  "bestTime": "October – March",
  "cover": "images/modhera-sun-temple/1.webp",
  "images": [
    { "src": "images/modhera-sun-temple/1.webp", "alt": "Sabha Mandap", "credit": "ASI", "license": "CC BY-SA 4.0" }
  ],
  "levels": [ ... ],
  "story": {
    "en": "Welcome to the Sun Temple at Modhera...",
    "gu": "મોઢેરા સૂર્ય મંદિરમાં આપનું સ્વાગત છે...",
    "hi": "मोढेरा सूर्य मंदिर में आपका स्वागत है..."
  },
  "historic": {
    "src": "TODO add image",
    "year": "c. 1886",
    "credit": "Henry Cousens / ASI Western Circle (TODO verify)",
    "license": "Public Domain (Pre-1923)"
  },
  "living": [
    {
      "type": "Festival",
      "name": "Uttarardh Mahotsav (Modhera Dance Festival)",
      "note": "Annual classical dance festival held at the Sun Temple every January.",
      "months": [1]
    }
  ]
}
```

---

## 🚀 How to Run Locally

Start a lightweight HTTP server:

```bash
# Navigate to project root
cd c:\Users\ASUS\Documents\GitHub\Digital-Heritage-Explorer

# Run Python local server
python -m http.server 8000
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

---

## 🔗 Deep Link Examples

- Rani ki Vav: `http://localhost:8000/#/site/rani-ki-vav`
- Modhera Sun Temple: `http://localhost:8000/#/site/modhera-sun-temple`
- Stepwell Category Filter: `http://localhost:8000/#/category/Stepwell`
