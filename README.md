# Digital Heritage Explorer 🏛️

**Digital Heritage Explorer** is a fast, responsive, static front-end web application for local heritage tourism. It presents historical monuments, stepwells, temples, mosques, and ancient ruins as an interactive virtual gallery linked with a Leaflet map.

---

## 🌟 Key Features

1. **Virtual Gallery Grid:** Responsive card layout featuring cover images, category badges, location, short summary, and detail triggers.
2. **Interactive Leaflet Map:** OpenStreetMap tiles with custom heritage map pins, popups with site thumbnails, and auto-fitting map bounds on filter changes.
3. **Card ↔ Map Pin Sync:** 
   - Clicking a card flies the map to its pin and opens its popup.
   - Clicking a pin highlights and scrolls to its corresponding info card.
4. **Detail Modal:** Rich overlay showcasing historical period, visiting hours, entry fee, best time to visit, full history, photo thumbnail strip, and Google Maps directions link.
5. **Image Lightbox:** Full-screen photo lightbox supporting keyboard navigation (`Esc`, `ArrowLeft`, `ArrowRight`), prev/next controls, and accessibility focus trap.
6. **Instant Search & Category Filtering:** Search by name, city, or description with 250ms debouncing + category filter chips updating both the card grid and map markers simultaneously.
7. **Mobile Optimization:** Mobile tab switcher allowing seamless toggling between List View and Map View on screen sizes under 768px.

---

## 🎨 Visual Design Palette

- **Sandstone:** `#C9A36B`
- **Deep Brown:** `#3B2A1A`
- **Cream:** `#FAF5EC`
- **Terracotta Accent:** `#B5502F`
- **Typography:** `Playfair Display` (Headings) & `Inter` (Body & UI text).

---

## 📁 Project Structure

```
digital-heritage-explorer/
├── index.html           # Main HTML structure & CDN references
├── css/
│   └── style.css        # Heritage theme design system, grid, modals & mobile layouts
├── js/
│   ├── cards.js         # Cards rendering, empty state, & card highlighting
│   ├── map.js           # Leaflet map initialization, custom pins, & bounds fitting
│   ├── gallery.js       # Detail modal dialog & full-screen lightbox gallery
│   └── app.js           # App bootstrap, data fetch, state & unified applyFilters()
├── data/
│   └── sites.json       # Single source of truth containing site metadata & facts
├── images/              # Site image assets organized by site ID
│   ├── rani-ki-vav/
│   ├── modhera-sun-temple/
│   ├── adalaj-stepwell/
│   ├── sarkhej-roza/
│   ├── champaner-pavagadh/
│   └── dholavira/
├── IMPLEMENTATION_PLAN.md
└── README.md
```

---

## 🚀 How to Run Locally

Because `app.js` fetches `data/sites.json` via HTTP asynchronous `fetch()`, opening `index.html` directly via `file://` will trigger browser CORS restrictions. You must serve the directory using a lightweight local web server.

### Option 1: Python 3 (Recommended)
Navigate to the project root directory in your terminal and run:
```bash
python -m http.server 8000
```
Open your browser at: [http://localhost:8000](http://localhost:8000)

### Option 2: Node.js / npx
```bash
npx serve .
```

### Option 3: VS Code Live Server
Right-click `index.html` in VS Code and select **"Open with Live Server"**.

---

## ➕ How to Add a New Heritage Site

Adding a new heritage site requires **editing only `data/sites.json`** and placing your photos in `images/<site-id>/`. No JavaScript changes are needed!

### Step 1: Add Site Images
Create a folder inside `images/` named after your site ID (e.g., `images/sun-temple/`). Add your cover photo and gallery photos (JPG, PNG, WebP, or SVG format).

### Step 2: Update `data/sites.json`
Append a new JSON object to the array in `data/sites.json`:

```json
{
  "id": "sun-temple",
  "name": "Sun Temple Modhera",
  "category": "Temple",
  "city": "Modhera",
  "lat": 23.5835,
  "lng": 72.1331,
  "summary": "11th-century temple complex dedicated to the Sun God Surya.",
  "description": "Full detailed history and architectural facts of the monument...",
  "period": "11th Century AD",
  "timings": "7:00 AM – 6:00 PM",
  "entryFee": "₹25 (Indian citizens)",
  "bestTime": "October – March",
  "cover": "images/sun-temple/1.jpg",
  "images": [
    {
      "src": "images/sun-temple/1.jpg",
      "alt": "Panoramic view of temple facade and reservoir"
    },
    {
      "src": "images/sun-temple/2.jpg",
      "alt": "Intricately carved stone pillars inside assembly hall"
    }
  ]
}
```

Save the file and refresh your browser. The app will automatically generate the new card, map pin, category filter chip, and detail lightbox!
