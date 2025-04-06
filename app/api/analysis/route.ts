import { NextResponse } from 'next/server';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import fs from 'fs';
import pdf from 'pdf-parse';

interface Section {
  numero: number;
  titre: string;
  contenu: string[];
  votes: string[];
  montants: string[];
  estAdopte?: boolean;
  annee?: string;
}

// Configuration des patterns et mots-clés
const CONFIG = {
  budgetKeywords: [
    'approbation du compte de dépenses',
    'compte de dépenses',
    'exercice comptable',
    'montant de',
    'charges',
    'dépenses de l\'exercice'
  ],
  patterns: {
    resolution: /^\s*(\d+)\s*[\.-]\s*([^\.]+)/m,
    montant: /(\d[\d\s]*(?:[.,]\d{2})?\s*(?:€|euros?)(?:\s*TTC)?)/gi,
    vote: /POUR\s*(?::|=)?\s*(\d+)\s*\/\s*(\d+)\s*(?:cp|copropriétaires?|voix)/i,
    annee: /(?:20\d{2})|(?:202[0-4])/,
    adoption: /(?:la\s+résolution\s+est\s+adoptée)|(?:résolution\s+adoptée)/i,
    rejet: /(?:la\s+résolution\s+est\s+rejetée)|(?:résolution\s+rejetée)/i,
    exercice: /exercice\s*(?:du|de|pour)?\s*(\d{2}\/\d{2}\/\d{4})\s*au\s*(\d{2}\/\d{2}\/\d{4})/i
  }
};

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
        
        // Chercher les montants
        const montants = line.match(CONFIG.patterns.montant);
        if (montants) {
          currentSection.montants.push(...montants);
        }
        
        // Chercher les votes
        const votes = line.match(CONFIG.patterns.vote);
        if (votes) {
          currentSection.votes.push(cleanedLine);
        }

        // Chercher l'année
        const anneeMatch = line.match(CONFIG.patterns.annee);
        if (anneeMatch && !currentSection.annee) {
          currentSection.annee = anneeMatch[0];
        }

        // Vérifier si la résolution est adoptée
        if (CONFIG.patterns.adoption.test(line)) {
          currentSection.estAdopte = true;
        } else if (CONFIG.patterns.rejet.test(line)) {
          currentSection.estAdopte = false;
        }
      }
    }
  }
  
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
}

// Fonction pour identifier les sections de budget
function identifyBudgetSection(sections: Section[]): Section | null {
  for (const section of sections) {
    const fullText = [section.titre, ...section.contenu].join(' ').toLowerCase();
    
    // Vérifier si c'est une section de budget
    const isBudgetSection = CONFIG.budgetKeywords.some(keyword => 
      fullText.toLowerCase().includes(keyword.toLowerCase())
    );

    if (isBudgetSection && section.montants.length > 0) {
      return section;
    }
  }
  return null;
}

async function analyzePDF(pdfPath: string) {
  try {
    const dataBuffer = await readFile(pdfPath);
    const data = await pdf(dataBuffer);
    
    const fullText = data.text;
    console.log('PDF Text Content:', fullText.substring(0, 500)); // Log first 500 chars
    
    // Extraire et analyser les sections
    const sections = extractSections(fullText);
    console.log('Extracted Sections:', JSON.stringify(sections, null, 2));
    
    const budgetSection = identifyBudgetSection(sections);
    console.log('Budget Section Found:', budgetSection ? JSON.stringify(budgetSection, null, 2) : 'Not found');
    
    if (!budgetSection) {
      return {
        montant: 'Non trouvé',
        annee: 'Non trouvé',
        resultatVote: 'Non trouvé',
        numeroClause: 'Non trouvé',
        estAdopte: false
      };
    }

    // Trouver le montant avec le format TTC
    const montantMatch = budgetSection.contenu.join(' ').match(/montant de ([\d\s]*[.,]\d{2})\s*€\s*TTC/i);
    const montant = montantMatch ? montantMatch[1].replace(/\s/g, '') : null;

    // Trouver l'année dans la période d'exercice
    const exerciceMatch = budgetSection.contenu.join(' ').match(CONFIG.patterns.exercice);
    const annee = exerciceMatch ? exerciceMatch[1].split('/')[2] : budgetSection.annee;

    // Extraire le résultat du vote
    const voteText = budgetSection.contenu.find(line => line.includes('POUR'));
    const voteMatch = voteText ? voteText.match(/(\d+)\s*\/\s*(\d+)\s*cp/) : null;
    
    return {
      montant: montant ? `${montant} €` : 'Non trouvé',
      annee: annee || 'Non trouvé',
      resultatVote: voteMatch ? `${voteMatch[1]}/${voteMatch[2]} cp` : 'Non trouvé',
      numeroClause: `Résolution n°${budgetSection.numero}`,
      estAdopte: budgetSection.estAdopte
    };
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

    // Get the most recent file
    const mostRecentFile = files.reduce((latest, current) => {
      const latestStats = fs.statSync(join(uploadDir, latest));
      const currentStats = fs.statSync(join(uploadDir, current));
      return currentStats.mtime > latestStats.mtime ? current : latest;
    }, files[0]);

    const pdfPath = join(uploadDir, mostRecentFile);
    console.log('Analyzing file:', pdfPath);
    
    // Clean up old files
    for (const file of files) {
      if (file !== mostRecentFile) {
        fs.unlinkSync(join(uploadDir, file));
      }
    }

    const analysis = await analyzePDF(pdfPath);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse du PDF' },
      { status: 500 }
    );
  }
} 