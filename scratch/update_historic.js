const fs = require('fs');
const path = 'c:/Users/ASUS/Documents/GitHub/Digital-Heritage-Explorer/data/sites.json';

const historicData = {
  "rani-ki-vav": {
    src: "TODO add image",
    year: "c. 1890",
    credit: "Archaeological Survey of India Archives (TODO verify)",
    license: "Public Domain (Pre-1923)"
  },
  "modhera-sun-temple": {
    src: "TODO add image",
    year: "c. 1886",
    credit: "Henry Cousens / ASI Western Circle (TODO verify)",
    license: "Public Domain (Pre-1923)"
  },
  "adalaj-stepwell": {
    src: "TODO add image",
    year: "c. 1910",
    credit: "British Library Oriental and India Office Collections (TODO verify)",
    license: "Public Domain (Pre-1923)"
  },
  "sarkhej-roza": {
    src: "TODO add image",
    year: "c. 1866",
    credit: "Colonel Thomas Biggs / ASI Photographic Archive (TODO verify)",
    license: "Public Domain (Pre-1923)"
  },
  "prag-mahal": {
    src: "TODO add image",
    year: "c. 1875",
    credit: "Royal Kutch Archives / Henry Saint Clair Wilkins (TODO verify)",
    license: "Public Domain (Pre-1923)"
  }
};

const data = JSON.parse(fs.readFileSync(path, 'utf8'));
data.forEach(site => {
  if (historicData[site.id]) {
    site.historic = historicData[site.id];
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully added historic field to sites.json');
