const fs = require('fs');

let fileContent = fs.readFileSync('scratch/add_new_temples.js', 'utf8');

const queryReplacements = {
  'girnar-temples': "queries: ['Girnar temple', 'Girnar Jain temple', 'Neminath temple Girnar', 'Ambika Mata temple Mount Girnar']",
  'vadtal-swaminarayan-temple': "queries: ['Vadtal Mandir', 'Laxminarayan Dev Vadtal Mandir', 'Vadtaltemple']",
  'dakor-ranchhodraiji-temple': "queries: ['Dakore temple', 'Ranchhodrai Temple Dakor', 'Dakor']",
  'bala-hanuman-temple': "queries: ['Bala Hanuman Jamnagar', 'Lakhota Lake Jamnagar']",
  'shatrunjaya-temples': "queries: ['Palitana temples', 'Shatrunjaya', 'Palitana']",
  'bahuchar-mata-temple': "queries: ['Bahuchara', 'Bahuchara Devi', 'Bahuchara Mata Temple']",
  'kalika-mata-pavagadh': "queries: ['Kalika Mata Pavagadh', 'Pavagadh fort', 'Pavagadh']",
  'shamlaji-temple': "queries: ['Shamlaji', 'Samlaji temple', 'Shamlaji temple']",
  'sudama-mandir': "queries: ['Sudama mandir', 'Sudama temple', 'Porbandar']",
  'khodiyar-mata-rajpara': "queries: ['Rajaparakhodiyarmandir', 'Khodiyar Mata Temple', 'Khodiyar']",
  'koteshwar-mahadev': "queries: ['Koteshwar temple', 'Koteshwar', 'Koteshwar Mahadev']",
  'tulsi-shyam-temple': "queries: ['Tulsishyam', 'Ratilal permar photo', 'Tulsishyam Gir']",
  'salangpur-hanuman-temple': "queries: ['Salangpur Hanuman', 'Salangpur', 'Sarangpur Hanuman']",
  'santram-mandir-nadiad': "queries: ['Santram mandir', 'Santram Nadiad', 'Nadiad']"
};

for (const id in queryReplacements) {
  // Regex to match the block for that id and replace queries
  const reg = new RegExp(`(id:\\s*"${id}"[\\s\\S]*?queries:\\s*\\[)[^\\]]*(\\])`, 'm');
  fileContent = fileContent.replace(reg, `$1${queryReplacements[id].replace("queries: [", "").replace("]", "")}$2`);
}

fs.writeFileSync('scratch/add_new_temples.js', fileContent, 'utf8');
console.log('Successfully updated queries in add_new_temples.js');
