# PV Analyzer - PDF Analysis Tool

A Next.js application that analyzes HOA (Home Owners Association) meeting minutes in PDF format using AI.

## Current Issues

### 1. Server Accessibility Problems
- The development server shows as running but remains inaccessible (ERR_CONNECTION_REFUSED)
- Attempted solutions:
  - Tried different ports (3000, 3001, 3002)
  - Disabled Turbopack
  - Created custom Next.js configuration
  - Attempted Express server implementation
  - None of these solutions resolved the connection issue

### 2. PDF Analysis Pipeline
- Previous issues with `pdf-parse` led to attempts with `pdfjs-dist`
- Current implementation switches back to `pdf-parse` for simplicity
- Analysis results show caching issues:
  - Same results appear despite different PDF uploads
  - "Non trouvé" responses persist across different files

### Technical Environment
- Next.js 15.2.1
- Node.js (recommended: 18.x or higher)
- TypeScript
- pdf-parse (latest version)
- Mistral AI for text analysis

### Attempted Solutions
1. Server Access:
   - Tried multiple ports (3000, 3001, 3002)
   - Created custom next.config.js
   - Attempted Express server implementation
   - Cleared .next cache and node_modules
   - Reinstalled dependencies

2. PDF Analysis:
   - Switched between pdf-parse and pdfjs-dist
   - Implemented file cleanup in uploads directory
   - Added debug logging
   - Modified worker configuration for PDF.js

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

### Next Steps for Investigation
1. Server Access:
   - Test with a completely fresh Next.js installation
   - Investigate potential firewall or security settings
   - Try running on a different machine to isolate environment issues

2. PDF Analysis:
   - Implement more robust caching controls
   - Add comprehensive error logging
   - Consider alternative PDF parsing libraries

## License
Proprietary. All rights reserved.
