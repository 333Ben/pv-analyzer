'use client';

import { useEffect, useState } from 'react';
import Header from '../components/Header';

interface BudgetAnalysis {
  montant: string;
  annee: string;
  resultatVote: string;
  numeroClause: string;
}

interface AnalysisData {
  budget: BudgetAnalysis;
}

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch('/api/analysis');
        if (!response.ok) {
          throw new Error('Failed to fetch analysis');
        }
        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Résultats de l'analyse
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Voici l'analyse du budget de votre procès-verbal d'assemblée générale.
          </p>
        </div>

        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Analyse en cours...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {analysis && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Montant du budget</h3>
                  <p className="text-2xl font-bold text-blue-600">{analysis.budget.montant}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Année concernée</h3>
                  <p className="text-2xl font-bold text-blue-600">{analysis.budget.annee}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Résultat du vote</h3>
                  <p className="text-2xl font-bold text-blue-600">{analysis.budget.resultatVote}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Référence</h3>
                  <p className="text-2xl font-bold text-blue-600">{analysis.budget.numeroClause}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 