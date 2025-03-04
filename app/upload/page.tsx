import Header from '../components/Header';
import FileUpload from '../components/FileUpload';

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Téléchargez vos PV
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Sélectionnez vos fichiers PDF de procès-verbaux d'assemblées générales pour analyse.
          </p>
        </div>

        <FileUpload />
      </div>
    </main>
  );
} 