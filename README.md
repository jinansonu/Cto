# Camera Mode OCR App

This app delivers the **Camera** capture mode for the assistant experience. It lets users preview their camera feed, capture frames, run on-device OCR with Tesseract.js, upload the snapshot to Supabase Storage, and forward the extracted text plus the hosted image to an AI service for contextual answers. Each successful submission is persisted (mode=`camera`) along with the image URL so past interactions stay available.

## Features

- Live camera preview with `getUserMedia` and graceful fallbacks for denied permissions or unsupported browsers.
- Capture, retake, or upload images from disk.
- Integrated Tesseract.js OCR with real-time progress feedback and editable extracted text.
- Upload captured frames to Supabase Storage and automatically clean up orphaned uploads if later steps fail.
- Send OCR text and image URL to an AI service for contextual responses.
- Persist camera-mode interactions (including the image URL and AI response) in Supabase for quick recall.

## Getting started

```bash
pnpm install # or npm install / yarn install
pnpm dev
```

Then open [http://localhost:5173](http://localhost:5173) in a modern browser.

## Required environment variables

Create a `.env` (or `.env.local`) file with the following values before running the app:

```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_STORAGE_BUCKET=camera-uploads           # optional, defaults to camera-uploads
VITE_AI_SERVICE_URL=https://your-ai-endpoint.example.com
VITE_AI_SERVICE_API_KEY=your-ai-service-key           # optional if the endpoint does not need auth
```

The Supabase project must contain:

- A Storage bucket (default: `camera-uploads`) configured for public reads.
- An `interactions` table with columns: `id`, `mode`, `image_url`, `ocr_text`, `ai_response`, `created_at` (timestamp).

## Notes

- Browsers require HTTPS or `localhost` to grant camera access.
- Users can always upload an existing image if camera access is not possible.
- OCR happens in the client; large or complex documents may take a few seconds to process.
