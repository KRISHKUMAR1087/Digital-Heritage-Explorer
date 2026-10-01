const fs = require('fs');
const path = 'c:/Users/ASUS/Documents/GitHub/Digital-Heritage-Explorer/data/sites.json';

const threeDData = {
  "rani-ki-vav": {
    has3DModel: true,
    modelType: "stepwell",
    hotspots: [
      { yaw: 45, pitch: -10, title: "Level 3 Vishnu Avatars", desc: "Exquisite high-relief sculptures of Lord Vishnu's ten avatars." },
      { yaw: 135, pitch: -25, title: "Deep Circular Well Shaft", desc: "28-meter deep water shaft lined with intricate masonry rings." },
      { yaw: 225, pitch: 10, title: "Upper Torana Gateway", desc: "Ground-level ornamental entry arches and pillared corridors." },
      { yaw: 315, pitch: -15, title: "Sheshashayi Vishnu Relief", desc: "Masterpiece relief of Lord Vishnu reclining on serpent Shesha." }
    ]
  },
  "modhera-sun-temple": {
    has3DModel: true,
    modelType: "temple",
    hotspots: [
      { yaw: 0, pitch: 0, title: "Garbhagriha Sanctum", desc: "Inner sanctum positioned directly along the 90° East equinox sun axis." },
      { yaw: 90, pitch: -15, title: "Surya Kunda Stepped Tank", desc: "Sacred water tank featuring 108 miniature shrines along the steps." },
      { yaw: 180, pitch: 5, title: "52 Carved Pillars", desc: "Intricately carved stone pillars representing the 52 weeks of the year." },
      { yaw: 270, pitch: 10, title: "Kirti Torana Archway", desc: "Ornamental victory arch marking the entry from the water tank." }
    ]
  },
  "adalaj-stepwell": {
    has3DModel: true,
    modelType: "stepwell",
    hotspots: [
      { yaw: 30, pitch: -15, title: "Octagonal Light Well", desc: "Central opening drawing sunlight 5 storeys deep into the earth." },
      { yaw: 150, pitch: 10, title: "Three-Way Staircase Entry", desc: "Convergence point of three entry staircases on the top landing." },
      { yaw: 240, pitch: -20, title: "Solanki-Islamic Jali Windows", desc: "Harmonized floral motifs and geometric stone lattice screens." }
    ]
  },
  "sarkhej-roza": {
    has3DModel: true,
    modelType: "complex",
    hotspots: [
      { yaw: 60, pitch: -5, title: "17-Acre Royal Lake", desc: "Artificial lake pavilion reflecting the mausoleums and minarets." },
      { yaw: 180, pitch: 10, title: "Shaikh Ahmed Ganj Baksh Tomb", desc: "Central Sufi mausoleum with intricate stone lattice jali work." },
      { yaw: 300, pitch: 5, title: "Palace of Sultan Mahmud Begada", desc: "Royal summer palace built along the lake embankment." }
    ]
  },
  "champaner-pavagadh": {
    has3DModel: true,
    modelType: "fort",
    hotspots: [
      { yaw: 40, pitch: 15, title: "Jami Masjid Central Dome", desc: "Grand 16th-century Sultanate mosque with soaring twin minarets." },
      { yaw: 160, pitch: 25, title: "Pavagadh Kalika Mata Temple", desc: "Sacred hilltop temple perched at 800m elevation." },
      { yaw: 280, pitch: -10, title: "Helical Stepwell", desc: "Spiral staircase stepwell built into the fortress grounds." }
    ]
  },
  "dholavira": {
    has3DModel: true,
    modelType: "metropolis",
    hotspots: [
      { yaw: 90, pitch: -10, title: "Stone-Cut Reservoirs", desc: "Massive 5,000-year-old rock-cut water storage systems." },
      { yaw: 210, pitch: 0, title: "10-Sign Indus Script Signboard", desc: "Famous Harappan wooden signboard with large white gypsum symbols." },
      { yaw: 330, pitch: 5, title: "Citadel & Ceremonial Ground", desc: "Fortified upper city and stadium for public gatherings." }
    ]
  },
  "somnath-temple": {
    has3DModel: true,
    modelType: "temple",
    hotspots: [
      { yaw: 0, pitch: 15, title: "155-Foot Temple Spire (Shikhara)", desc: "Towering spire constructed in traditional Maru-Gurjara style." },
      { yaw: 120, pitch: -10, title: "Arabian Sea Coastline", desc: "Coastal promenade where the temple overlooks the Arabian Sea." },
      { yaw: 240, pitch: 0, title: "Baan Stambha (Arrow Pillar)", desc: "Historic pillar pointing unobstructed southward to Antarctica." }
    ]
  },
  "lothal": {
    has3DModel: true,
    modelType: "dockyard",
    hotspots: [
      { yaw: 45, pitch: -15, title: "Tidal Dockyard Basin", desc: "World's oldest known tidal dockyard dating to 2400 BCE." },
      { yaw: 180, pitch: 0, title: "Bead Factory Workshops", desc: "Excavated artisan workshops for semi-precious stone beads." },
      { yaw: 315, pitch: -5, title: "Acropolis & Brick Drainage", desc: "Upper city platform with sophisticated kiln-burnt brick sewers." }
    ]
  },
  "uparkot-fort": {
    has3DModel: true,
    modelType: "fort",
    hotspots: [
      { yaw: 30, pitch: 10, title: "20m Citadel Ramparts", desc: "Ancient Mauryan fort walls that withstood 16 historical sieges." },
      { yaw: 150, pitch: -20, title: "Adi Kadi Vav Stepwell", desc: "Deep rock-cut stepwell carved directly into solid plateau stone." },
      { yaw: 270, pitch: 0, title: "Neelam Brass Cannon", desc: "Massive 16th-century Ottoman brass cannon cast in Diu." }
    ]
  },
  "prag-mahal": {
    has3DModel: true,
    modelType: "palace",
    hotspots: [
      { yaw: 0, pitch: 20, title: "45m Italian Gothic Clock Tower", desc: "Towering clock tower offering 360° views over Bhuj city." },
      { yaw: 140, pitch: 5, title: "Aina Mahal Palace of Mirrors", desc: "18th-century mirror hall designed by artisan Ramsinh Malam." },
      { yaw: 260, pitch: 0, title: "Venetian Arch Balcony", desc: "Gothic arches carved from Kutch red sandstone and marble." }
    ]
  },
  "dwarkadhish-temple": {
    has3DModel: true,
    modelType: "temple",
    hotspots: [
      { yaw: 0, pitch: 20, title: "72m 5-Storey Spire", desc: "Towering Jagat Mandir spire supported by 60 limestone pillars." },
      { yaw: 120, pitch: 5, title: "52-Yard Sacred Flag (Dhvaja)", desc: "Massive colorful flag changed five times daily atop the spire." },
      { yaw: 240, pitch: -10, title: "Gomti Sangam Ghat", desc: "Sacred bathing ghats at the confluence of Gomti River and sea." }
    ]
  }
};

const data = JSON.parse(fs.readFileSync(path, 'utf8'));
data.forEach(site => {
  if (threeDData[site.id]) {
    site.threeD = threeDData[site.id];
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully added threeD hotspots to sites.json');
