const fs = require('fs');
const path = 'c:/Users/ASUS/Documents/GitHub/Digital-Heritage-Explorer/data/sites.json';

const livingData = {
  "rani-ki-vav": [
    {
      type: "Craft",
      name: "Patan Patola Double Ikat Weaving",
      note: "Traditional silk weaving dating back to the Solanki era. Salvi artisan family workshops operating in Patan. (TODO verify loom visit hours)",
      months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    }
  ],
  "modhera-sun-temple": [
    {
      type: "Festival",
      name: "Uttarardh Mahotsav (Modhera Dance Festival)",
      note: "Annual 3-day classical dance festival held against the illuminated backdrop of the Sun Temple every January.",
      months: [1]
    }
  ],
  "adalaj-stepwell": [
    {
      type: "Craft",
      name: "Bandhani & Mirror-Work Embroidery",
      note: "Local artisan tie-dye Bandhani and embroidery stalls around Adalaj and Gandhinagar village markets.",
      months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    }
  ],
  "sarkhej-roza": [
    {
      type: "Festival",
      name: "Annual Urs & Sufi Qawwali Evening",
      note: "Devotional Sufi music and qawwali performances at the mausoleum of Shaikh Ahmed Ganj Baksh.",
      months: [1, 2, 10, 11, 12]
    }
  ],
  "champaner-pavagadh": [
    {
      type: "Festival",
      name: "Pavagadh Navratri Pilgrimage",
      note: "Lakhs of pilgrims climb Pavagadh hill for Kalika Mata temple worship and evening Garba dances during Navratri.",
      months: [9, 10]
    }
  ],
  "dholavira": [
    {
      type: "Festival",
      name: "Rann Utsav & Kutchi Artisan Fair",
      note: "Cultural festival showcasing Kutchi folk music, Rogan art, and mud-mirror work (Lippan Kaam).",
      months: [1, 2, 11, 12]
    }
  ],
  "somnath-temple": [
    {
      type: "Festival",
      name: "Somnath Kartik Purnima Fair",
      note: "5-day oceanfront fair with folk dance, ras-garba, and spiritual illumination.",
      months: [11]
    }
  ],
  "lothal": [
    {
      type: "Craft",
      name: "Terracotta Pottery & Bead Crafting",
      note: "Local pottery demonstrations inspired by ancient Harappan clay bead-making techniques.",
      months: [1, 2, 3, 10, 11, 12]
    }
  ],
  "uparkot-fort": [
    {
      type: "Festival",
      name: "Bhavnath Mahadev Fair & Girnar Parikrama",
      note: "Massive night fair celebrating Maha Shivratri with Naga Sadhus at the base of Mount Girnar.",
      months: [2, 3]
    }
  ],
  "prag-mahal": [
    {
      type: "Craft",
      name: "Ajrakh Block Print & Leathercraft",
      note: "Famous natural dye woodblock printing and embroidered Kutchi leather artisan villages near Bhuj.",
      months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    }
  ],
  "dwarkadhish-temple": [
    {
      type: "Festival",
      name: "Dwarka Krishna Janmashtami Mahotsav",
      note: "Grand celebration of Lord Krishna's birth with midnight darshan, devotional bhajans, and temple illumination.",
      months: [8, 9]
    }
  ]
};

const data = JSON.parse(fs.readFileSync(path, 'utf8'));
data.forEach(site => {
  if (livingData[site.id]) {
    site.living = livingData[site.id];
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully added living field to sites.json');
