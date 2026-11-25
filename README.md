<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/d2ede45f-3ed0-4992-ae15-013017ce23a1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Build Windows Desktop Executable (.exe)

- Run desktop app locally with Electron:
  `npm run electron:dev`
- Build standalone portable Windows x64 `.exe` (`release/Generador-Etiquetas-PPTX.exe`):
  `npm run build:win`
