# Digital Heritage Explorer — Design & Implementation Plan

## 1. What We Are Building

Digital Heritage Explorer is a static, front-end web app (Travel & Tourism) that presents local heritage sites as:
- A virtual gallery of information cards (photo, summary, details)
- An interactive map (Leaflet.js) with a pin for each site
- A detail view with an image gallery/lightbox for each site

Clicking a card highlights its map pin; clicking a pin highlights/opens its card. No backend — content is stored in `data/sites.json`.

**Stack:** HTML5 + CSS3 + Vanilla JavaScript + Leaflet.js (OpenStreetMap tiles) + image gallery (custom lightbox).

---

## 2. Goals & Non-Goals

### Goals
- Fast, responsive, mobile-friendly site.
- Easy content updates (edit JSON only).
- Search and category filtering.
- Accessible (keyboard, alt text, contrast).

### Non-Goals (v1)
- User accounts, comments, or a database.
- Admin panel.
- Payments/bookings.

---

## 3. Features

| # | Feature | Priority |
|---|---|---|
| 1 | Map with pins for all heritage sites | Must |
| 2 | Info cards grid (image, name, location, short description) | Must |
| 3 | Card ↔ pin sync (click/hover highlights both) | Must |
| 4 | Detail modal/panel: full history, facts, image gallery | Must |
| 5 | Image gallery with lightbox + next/prev | Must |
| 6 | Search by name/keyword | Should |
| 7 | Filter by category (Temple, Fort, Stepwell, Museum, etc.) | Should |
| 8 | "Get directions" link (Google/OSM) | Should |
| 9 | Favorites saved in `localStorage` | Could |
| 10 | Dark mode | Could |

---

## 4. Project Structure

```
digital-heritage-explorer/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js          # bootstraps everything
│   ├── map.js          # Leaflet setup, markers
│   ├── cards.js        # render cards, filters, search
│   └── gallery.js      # modal + lightbox
├── data/
│   └── sites.json
├── images/
│   └── <site-id>/1.jpg, 2.jpg, ...
└── README.md
```

---

## 5. Data Model (`data/sites.json`)

```json
[
  {
    "id": "rani-ki-vav",
    "name": "Rani ki Vav",
    "category": "Stepwell",
    "city": "Patan",
    "lat": 23.8593,
    "lng": 72.1017,
    "summary": "11th-century stepwell with intricately carved sculptures.",
    "description": "Longer history text...",
    "period": "11th century",
    "timings": "8:00 AM – 6:00 PM",
    "entryFee": "₹40 (Indian citizens)",
    "bestTime": "October – March",
    "cover": "images/rani-ki-vav/1.jpg",
    "images": [
      { "src": "images/rani-ki-vav/1.jpg", "alt": "Main stepwell corridor" },
      { "src": "images/rani-ki-vav/2.jpg", "alt": "Carved sculpture panel" }
    ]
  }
]
```

> **Suggested sample sites (Gujarat):** Rani ki Vav, Modhera Sun Temple, Adalaj Stepwell, Sarkhej Roza, Champaner-Pavagadh, Dholavira. Replace with your own local sites as needed. Use only images you own or that are openly licensed, and credit them.

---

## 6. UI / UX Design

### Layout
- **Desktop:** Header on top; below it a two-column split — left = filter bar + scrollable card grid, right = sticky Leaflet map.
- **Mobile:** Map and list toggled by a "Map / List" switch.

### Components
- **Header:** Logo/title, search box, category chips.
- **Card:** Cover image, category badge, name, city, 2-line summary, "View details" button.
- **Map pin popup:** Thumbnail, name, "View details" link.
- **Detail modal:** Hero image, facts (period, timings, fee, best time), full description, thumbnail strip → lightbox, directions button.
- **Lightbox:** Full-screen image, caption (alt), prev/next, close (Esc), arrow-key navigation.

### Visual Style
- **Warm heritage palette:**
  - Sandstone `#C9A36B`
  - Deep brown `#3B2A1A`
  - Cream `#FAF5EC`
  - Accent terracotta `#B5502F`
- **Typography:** Headings: serif (e.g., Playfair Display); Body: sans-serif (e.g., Inter). Use system fallbacks.
- **Card style:** Rounded cards, soft shadows, subtle hover lift.
- **Accessibility:** Semantic HTML, alt on all images, focus-visible outlines, ARIA roles on modal (`role="dialog"`, `aria-modal`), color contrast ≥ 4.5:1, keyboard-operable everything.

---

## 7. Implementation Plan

### Phase 1 — Setup (0.5 day)
- Create folder structure, `index.html` skeleton, link Leaflet CSS/JS via CDN.
- Add base CSS (variables, reset, typography).

### Phase 2 — Data & Cards (1 day)
- Write `sites.json` with 5–8 sites.
- `cards.js`: fetch JSON, render cards into grid.
- Responsive grid (CSS Grid, auto-fill, `minmax(260px, 1fr)`).

### Phase 3 — Map (1 day)
- `map.js`: init Leaflet map with OSM tiles, fit bounds to all sites.
- Add markers + popups from data.
- Sync: card click → `map.flyTo` + open popup; marker click → scroll to and highlight card.

### Phase 4 — Detail View & Gallery (1 day)
- `gallery.js`: modal with facts + description + thumbnails.
- Lightbox with prev/next/close, keyboard support, focus trap.

### Phase 5 — Search & Filters (0.5 day)
- Text search (name, city, summary) with debounce.
- Category chips; update cards and markers together (single `applyFilters()` function).

### Phase 6 — Polish (1 day)
- Responsive Map/List toggle on mobile.
- Lazy-load images (`loading="lazy"`), compress images (WebP, ≤ 200 KB).
- Directions link, favorites (optional), dark mode (optional).
- Empty state ("No sites match your search").

### Phase 7 — Test & Deploy (0.5 day)
- Test Chrome, Firefox, Safari, mobile.
- Lighthouse: aim for ≥ 90 performance/accessibility.
- Deploy to GitHub Pages / Netlify / Vercel.
- Write `README.md` with setup and how to add a new site.

*Total estimate: ~5–6 days part-time (less if reusing templates).*

---

## 8. State & Architecture Notes

- **Single source of truth:** `allSites` (from JSON) and `filteredSites` (derived).
- `applyFilters()` → updates cards + markers together.
- **Marker registry:** `Map<siteId, L.Marker>` for quick lookup.
- No framework; keep modules small and communicate via simple function calls or custom events.
- Serve with a local server (e.g., `python -m http.server`) because `fetch()` of JSON fails on `file://`.

---

## 9. Acceptance Criteria

- [ ] Map shows a pin for every site; popups work.
- [ ] Cards and pins stay in sync on click.
- [ ] Detail modal shows full info and an image gallery with lightbox.
- [ ] Search and category filters update both the cards and the map.
- [ ] Fully usable on a 360px-wide phone.
- [ ] Keyboard accessible; all images have alt text.
- [ ] Adding a site requires editing only `sites.json` and adding images.
