import Link from 'next/link';
import Header from './components/Header';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Analyse de PV d'AG simple et rapide
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Analysez vos procès-verbaux d'assemblées générales en quelques clics. Obtenez une analyse détaillée et des points de vigilance pour votre investissement immobilier.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/upload"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Commencer maintenant
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Analyse rapide</h3>
                <p className="mt-2 text-base text-gray-500">
                  Téléchargez vos PV et obtenez une analyse détaillée en quelques minutes.
                </p>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Points de vigilance</h3>
                <p className="mt-2 text-base text-gray-500">
                  Identifiez les points importants à surveiller avant votre investissement.
                </p>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Export PDF</h3>
                <p className="mt-2 text-base text-gray-500">
                  Exportez vos analyses en PDF pour les partager facilement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
