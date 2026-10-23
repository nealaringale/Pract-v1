# PaperLens AI

**From scattered study material to evidence-based exam preparation.**

PaperLens AI is a SPPU-first exam-preparation workspace. Students can organize syllabi, previous-year question papers, notes and teacher question banks, inspect recurring topics, and generate configurable mock papers with an explainable trail back to their sources.

## MVP features

- Responsive dashboard, document library, topic insights, paper builder and settings.
- Multi-file upload for PDF, DOCX, TXT, Markdown and images.
- Server-side document extraction and optional Gemini-powered analysis.
- A working deterministic demo mode when no Gemini key is configured.
- Exam constraints for marks, duration, difficulty, units, section style and answer hints.
- Source-aware topic/question records and JSON paper export.
- API health endpoint and GitHub Actions build check.

> Predictions are study aids, not guarantees about future examinations. Sample data is clearly marked. Only ingest material you have permission to use.

## Run locally

Requires Node.js 20 or newer.

1. Copy .env.example to .env.local.
2. Optional: set GEMINI_API_KEY to enable Gemini analysis and question generation.
3. Install dependencies and start the development server:

   ~~~bash
   npm install
   npm run dev
   ~~~

4. Open http://localhost:3000.

Without a key, PaperLens uses deterministic demo generation and local document extraction. Scanned PDFs and image OCR need Gemini configured.

## Configure Gemini

Set these environment variables in .env.local or your hosting provider's server-side environment:

~~~env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.8-flash
~~~

Never add real API keys to Git, client-side code, screenshots, or public issues. The app reads credentials only in server routes.

## Deploy

Deploy the Next.js project to a Node-compatible host such as Vercel or Google Cloud Run. Add GEMINI_API_KEY and optionally GEMINI_MODEL as server-side environment variables. GitHub Pages alone cannot run the API routes.

## SPPU source workflow

The initial build links to SPPU's official archives rather than claiming to scrape every paper automatically:

- Previous question papers: https://exam.unipune.ac.in/Pages/PreviousQuestionPapers.html
- Syllabus archive: https://www.unipune.ac.in/university_files/Syllabi.htm

Download the papers you need from official or authorized sources and upload them to the workspace. Automated year/subject discovery, durable cloud storage, authentication and multi-user workspaces are planned follow-ups.

## API

- GET /api/health — service status and whether Gemini is configured (never returns the key).
- POST /api/analyze — multipart form with file and optional subject.
- POST /api/generate — JSON with subject, marks, duration, difficulty, selected units, format and materials.

## Limitations in this MVP

- Uploaded file metadata and analysis results are stored in the current browser session/local storage, not in a secure multi-user database.
- The official archive is linked, not continuously synchronized.
- Deterministic demo output is not an AI prediction and should not be treated as a forecast.
- Add authentication, server-side rate limits, audit logging, retention/deletion controls and persistent storage before production use.
