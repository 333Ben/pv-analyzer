# PV Analyzer - PDF Analysis Tool

A Next.js application that analyzes HOA (Home Owners Association) meeting minutes in PDF format using AI.

## Current Issue: pdf-parse Integration

We're currently experiencing an issue with the `pdf-parse` package in our PDF analysis pipeline. The package is attempting to access a test file (`./test/data/05-versions-space.pdf`) regardless of the actual PDF path provided.

### Error Details
```
Error: ENOENT: no such file or directory, open './test/data/05-versions-space.pdf'
at analyzePDFWithMistral (app/api/analysis/route.ts:109:10)
```

### Technical Environment
- Next.js 15.2.1 with Turbopack
- Node.js (recommended: 18.x or higher)
- TypeScript
- pdf-parse (latest version)
- Mistral AI for text analysis

### Current Implementation
The PDF analysis flow:
1. User uploads PDF to `/upload`
2. File is saved in `tmp/uploads/`
3. Analysis endpoint (`/api/analysis`) attempts to process the PDF
4. `pdf-parse` fails by trying to access its test file instead of the uploaded PDF

### Attempted Solutions
1. Moved `pdf-parse` import inside the function scope
2. Verified PDF file existence in uploads directory
3. Confirmed correct file paths
4. Checked file permissions

### Setup Instructions

1. Clone and install dependencies:
```bash
git clone [repository-url]
cd pv-analyzer
npm install
```

2. Create `.env.local` file:
```bash
cp .env.example .env.local
# Add your Mistral API key
```

3. Run development server:
```bash
npm run dev
```

4. Access the application:
- Main page: http://localhost:3000
- Upload page: http://localhost:3000/upload
- Analysis page: http://localhost:3000/analysis

### Project Structure
```
pv-analyzer/
├── app/
│   ├── api/
│   │   ├── analysis/
│   │   │   └── route.ts    # PDF analysis endpoint
│   │   └── upload/
│   │       └── route.ts    # File upload endpoint
│   ├── components/
│   └── ...
├── tmp/
│   └── uploads/           # Temporary PDF storage
└── ...
```

### Looking For Help With
- Understanding why `pdf-parse` ignores the provided file path
- Finding a solution to properly initialize `pdf-parse` without accessing test files
- Implementing a robust PDF parsing solution in a Next.js API route

## License
Proprietary. All rights reserved.
