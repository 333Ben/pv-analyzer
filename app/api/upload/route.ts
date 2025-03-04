import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Aucun fichier n\'a été fourni' },
        { status: 400 }
      );
    }

    const uploadDir = join(process.cwd(), 'tmp', 'uploads');

    // Traiter chaque fichier
    const savedFiles = await Promise.all(
      files.map(async (file: any) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        return fileName;
      })
    );

    return NextResponse.json({ 
      message: 'Fichiers téléchargés avec succès',
      files: savedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement des fichiers' },
      { status: 500 }
    );
  }
} 