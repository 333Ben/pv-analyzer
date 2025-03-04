'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const FileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      // Rediriger vers la page d'analyse
      window.location.href = '/analysis';
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-500">Déposez les fichiers ici...</p>
        ) : (
          <div>
            <p className="text-gray-600">Glissez-déposez vos fichiers PDF ici, ou cliquez pour sélectionner</p>
            <p className="text-sm text-gray-500 mt-2">Formats acceptés : PDF</p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Fichiers sélectionnés :</h3>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="text-sm text-gray-600">
                {file.name}
              </li>
            ))}
          </ul>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`mt-4 w-full py-2 px-4 rounded-md text-white font-medium
              ${uploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {uploading ? 'Téléchargement en cours...' : 'Télécharger et analyser'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 