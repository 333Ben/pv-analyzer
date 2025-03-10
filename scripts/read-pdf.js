const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const pv1Path = path.join(__dirname, '../tmp/uploads/PV-Proce_s_verbal_AG_13.12.2022.pdf');
const pv2Path = path.join(__dirname, '../tmp/uploads/PV_AG_24_06_24.pdf');

async function readPdf(filePath, label) {
  console.log(`\n=== Analyse du ${label} ===`);
  const dataBuffer = fs.readFileSync(filePath);
  try {
    const data = await pdf(dataBuffer);
    console.log('Nombre de pages:', data.numpages);
    console.log('Début du texte:\n', data.text.slice(0, 2000)); // Premiers 2000 caractères
    
    // Recherche de patterns communs
    const hasResolutions = data.text.match(/[0-9]+\.\s+[A-Z][^\.]+/g);
    if (hasResolutions) {
      console.log('\nExemples de résolutions trouvées:');
      hasResolutions.slice(0, 3).forEach(r => console.log('-', r));
    }
    
    // Recherche de mots-clés budgétaires
    const budgetKeywords = ['budget', 'dépenses', 'exercice', 'euros', '€'];
    console.log('\nRecherche de mots-clés budgétaires:');
    budgetKeywords.forEach(keyword => {
      const count = (data.text.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      console.log(`- "${keyword}": ${count} occurrences`);
    });

  } catch (error) {
    console.error('Erreur lors de la lecture du PDF:', error);
  }
}

async function analyzeAll() {
  await readPdf(pv1Path, 'PV du 13/12/2022');
  await readPdf(pv2Path, 'PV du 24/06/2024');
}

analyzeAll(); 