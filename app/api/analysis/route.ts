import { NextResponse } from 'next/server';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { Mistral } from '@mistralai/mistralai';

interface Section {
  numero: number;
  titre: string;
  contenu: string[];
  votes: string[];
  montants: string[];
}

// Configuration des patterns et mots-clés
const CONFIG = {
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
  patterns: {
    resolution: /^\s*(\d+)\s*[\.-]\s*([^\.]+)/m,
    montant: /(\d[\d\s]*(?:,\d{2})?\s*(?:€|euros))/gi,
    vote: /(?:POUR|CONTRE|ABST[ENTION]*)\s*:?\s*(\d+)[\s\/]*(\d+)\s*(?:cp|copropriétaires?|voix)/gi
  }
};

// Initialize Mistral client
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY || '' });

// Fonction de nettoyage du texte
function cleanText(text: string): string {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/\s+/g, ' ')
    .trim();
}

// Fonction pour extraire les sections
function extractSections(text: string): Section[] {
  const cleanedText = text
    .split('\n')
    .map(line => line.trim())
    .join('\n');
  
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  
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
        
        const montants = line.match(CONFIG.patterns.montant);
        if (montants) {
          currentSection.montants.push(...montants);
        }
        
        const votes = line.match(CONFIG.patterns.vote);
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
function identifyRelevantSections(sections: Section[]): Section[] {
  return sections.filter(section => {
    const fullText = [section.titre, ...section.contenu].join(' ').toLowerCase();
    return CONFIG.budgetKeywords.some(keyword => 
      fullText.includes(keyword.toLowerCase())
    );
  });
}

async function analyzePDFWithMistral(pdfPath: string) {
  try {
    // Déplacer l'import ici pour éviter l'initialisation au démarrage
    const pdfParse = require('pdf-parse');
    
    // Lire le fichier PDF
    const dataBuffer = await readFile(pdfPath);
    const pdfData = await pdfParse(dataBuffer);
    
    // Extraire et analyser les sections
    const sections = extractSections(pdfData.text);
    const relevantSections = identifyRelevantSections(sections);
    
    // Préparer le résumé pour Mistral
    const summary = relevantSections
      .filter(section => section.montants.length > 0)
      .map(section => `
        Résolution ${section.numero}:
        Titre: ${section.titre}
        Montants mentionnés: ${section.montants.join(', ')}
        ${section.votes.length > 0 ? 'Votes: ' + section.votes.join(', ') : ''}
      `).join('\n');

    // Prompt pour l'analyse
    const prompt = `Analyse ce résumé de procès verbal d'assemblée générale de copropriété et extrait les informations suivantes :
    - Le montant du budget voté
    - L'année concernée par ce budget
    - Le résultat du vote (nombre de voix)
    - Le numéro de la résolution concernée
    
    Format de réponse souhaité :
    {
      "montant": "XXX €",
      "annee": "YYYY",
      "resultatVote": "XX voix",
      "numeroClause": "Résolution n°X"
    }
    
    Contenu à analyser:
    ${summary}`;

    // Appeler l'API Mistral avec la nouvelle syntaxe
    const response = await client.chat.complete({
      model: "mistral-medium",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    // Parser la réponse
    const messageContent = response.choices?.[0]?.message?.content;
    const analysisText = typeof messageContent === 'string' ? messageContent : '';
    console.log('Raw analysis:', analysisText);
    
    try {
      if (!analysisText) {
        throw new Error('No response content');
      }
      return JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      return {
        montant: "Non trouvé",
        annee: "Non trouvé",
        resultatVote: "Non trouvé",
        numeroClause: "Non trouvé"
      };
    }
  } catch (error) {
    console.error('Error analyzing PDF:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const uploadDir = join(process.cwd(), 'tmp', 'uploads');
    const files = await readdir(uploadDir);
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Aucun fichier à analyser' },
        { status: 404 }
      );
    }

    const pdfPath = join(uploadDir, files[0]);
    console.log('Analyzing file:', pdfPath);
    
    const analysis = await analyzePDFWithMistral(pdfPath);
    console.log('Analysis results:', analysis);

    return NextResponse.json({ budget: analysis });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse du document: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 