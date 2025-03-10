const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

// Configuration des mots-clés et patterns
const CONFIG = {
  // Mots-clés pour identifier les sections budgétaires
  budgetKeywords: [
    'budget',
    'dépenses',
    'exercice',
    'euros',
    '€',
    'charges',
    'comptable',
    'prévisionnel',
    'trésorerie',
    'créances',
    'dettes'
  ],
  
  // Patterns pour identifier les structures communes
  patterns: {
    resolution: /^\s*(\d+)\s*[\.-]\s*([^\.]+)/m,
    montant: /(\d[\d\s]*(?:,\d{2})?\s*(?:€|euros))/gi,
    vote: /(?:POUR|CONTRE|ABST[ENTION]*)\s*:?\s*(\d+)[\s\/]*(\d+)\s*(?:cp|copropriétaires?|voix)/gi
  }
};

// Fonction de nettoyage du texte
function cleanText(text) {
  return text
    .replace(/([A-Z])/g, ' $1') // Ajoute un espace avant les majuscules
    .replace(/\s+/g, ' ')       // Normalise les espaces
    .trim();
}

// Fonction pour extraire les sections
function extractSections(text) {
  // Prétraitement du texte
  const cleanedText = text
    .split('\n')
    .map(line => line.trim())
    .join('\n');
  
  const sections = [];
  let currentSection = null;
  
  // Découpe le texte en sections basées sur la numérotation
  const lines = cleanedText.split('\n');
  for (const line of lines) {
    const resolutionMatch = line.match(CONFIG.patterns.resolution);
    if (resolutionMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        numero: parseInt(resolutionMatch[1]),
        titre: cleanText(resolutionMatch[2]),
        contenu: [],
        votes: [],
        montants: []
      };
    } else if (currentSection) {
      const cleanedLine = cleanText(line);
      if (cleanedLine) {
        currentSection.contenu.push(cleanedLine);
        
        // Cherche les montants
        const montants = cleanedLine.match(CONFIG.patterns.montant);
        if (montants) {
          currentSection.montants.push(...montants);
        }
        
        // Cherche les votes
        const votes = cleanedLine.match(CONFIG.patterns.vote);
        if (votes) {
          currentSection.votes.push(cleanedLine);
        }
      }
    }
  }
  
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
}

// Fonction pour identifier les sections pertinentes
function identifyRelevantSections(sections) {
  return sections.filter(section => {
    const fullText = [section.titre, ...section.contenu].join(' ').toLowerCase();
    return CONFIG.budgetKeywords.some(keyword => 
      fullText.includes(keyword.toLowerCase())
    );
  });
}

async function analyzePV(filePath, label) {
  console.log(`\n=== Analyse du ${label} ===`);
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    
    console.log(`\nAnalyse du document de ${data.numpages} pages...`);
    
    // Extraction et analyse des sections
    const sections = extractSections(data.text);
    console.log(`\nNombre total de sections trouvées : ${sections.length}`);
    
    const relevantSections = identifyRelevantSections(sections);
    console.log(`Nombre de sections pertinentes : ${relevantSections.length}`);
    
    console.log('\nSections pertinentes trouvées :');
    relevantSections.forEach(section => {
      console.log(`\n--- Résolution ${section.numero} ---`);
      console.log('Titre:', section.titre);
      if (section.montants.length > 0) {
        console.log('Montants trouvés:', section.montants);
      }
      if (section.votes.length > 0) {
        console.log('Résultats du vote:', section.votes.map(v => cleanText(v)));
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'analyse du PDF:', error);
  }
}

async function analyzeAll() {
  const pv1Path = path.join(__dirname, '../tmp/uploads/PV-Proce_s_verbal_AG_13.12.2022.pdf');
  const pv2Path = path.join(__dirname, '../tmp/uploads/PV_AG_24_06_24.pdf');
  
  await analyzePV(pv1Path, 'PV du 13/12/2022');
  await analyzePV(pv2Path, 'PV du 24/06/2024');
}

analyzeAll(); 