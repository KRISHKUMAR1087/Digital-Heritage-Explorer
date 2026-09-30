const fs = require('fs');
const path = 'c:/Users/ASUS/Documents/GitHub/Digital-Heritage-Explorer/data/sites.json';

const compareFields = {
  "rani-ki-vav": {
    style: "Maru-Gurjara (Solanki)",
    builder: "Queen Udayamati",
    material: "Sandstone & Brick",
    unesco: true
  },
  "modhera-sun-temple": {
    style: "Chaulukya (Solanki)",
    builder: "King Bhima I",
    material: "Golden Sandstone",
    unesco: false
  },
  "adalaj-stepwell": {
    style: "Solanki-Islamic Fusion",
    builder: "Queen Rudabai",
    material: "Sandstone",
    unesco: false
  },
  "sarkhej-roza": {
    style: "Indo-Islamic Sultanate",
    builder: "Sultan Ahmed Shah & Mahmud Begada",
    material: "Sandstone & Marble",
    unesco: false
  },
  "champaner-pavagadh": {
    style: "Prehistoric to Sultanate",
    builder: "Chavda Rajputs & Mahmud Begada",
    material: "Stone Masonry & Brick",
    unesco: true
  },
  "dholavira": {
    style: "Harappan Dry Stone Masonry",
    builder: "Indus Valley Civilization",
    material: "Dressed Sandstone & Limestone",
    unesco: true
  },
  "somnath-temple": {
    style: "Maru-Gurjara",
    builder: "Rebuilt by Sardar Patel (Ancient Origins)",
    material: "Sompura Sandstone",
    unesco: false
  },
  "lothal": {
    style: "Harappan Mud-Brick Port",
    builder: "Indus Valley Maritime Traders",
    material: "Kiln-burnt Bricks",
    unesco: false
  },
  "uparkot-fort": {
    style: "Mauryan Citadel",
    builder: "Chandragupta Maurya & Chudasama Rulers",
    material: "Cut Sandstone & Plateau Bedrock",
    unesco: false
  },
  "prag-mahal": {
    style: "Italian Gothic & Venetian",
    builder: "Maharao Pragmalji II (Col. Wilkins)",
    material: "Italian Marble & Red Sandstone",
    unesco: false
  },
  "dwarkadhish-temple": {
    style: "Solanki-Chaulukya",
    builder: "Vajranabha & Historical Monarchs",
    material: "Limestone & Sandstone",
    unesco: false
  }
};

const data = JSON.parse(fs.readFileSync(path, 'utf8'));
data.forEach(site => {
  if (compareFields[site.id]) {
    Object.assign(site, compareFields[site.id]);
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully added compare fields (style, builder, material, unesco) to sites.json');
