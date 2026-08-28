# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

There is no build step, package manager, test suite, or linter. The frontend is plain static files and the API is Vercel serverless functions.

- **Run locally (with API routes):** `vercel dev` — serves the static files and `api/*` functions on `localhost:3000`. Requires the Vercel CLI (`npm i -g vercel`).
- **Run locally (frontend only):** open `index.html` directly or `python3 -m http.server`. Word lookup and audio will fail because `/api/jisho` and `/api/tts` are not available.
- **Deploy:** `vercel` (preview) / `vercel --prod`. The project is otherwise deployed by Vercel's Git integration on push.

### Environment

- `GOOGLE_TTS_API_KEY` — Google Cloud Text-to-Speech API key, read by `api/tts.js`. Set it in the Vercel project settings (and in `.env` / `vercel dev` env for local audio).

## Architecture

Single-page vocabulary-assisted Japanese reader. Paste text → it is split into clickable tokens → clicking a token opens a definition popup → definitions can be saved to a local vocab list and exported/imported as CSV.

### Frontend (`index.html`, `script.js`, `style.css`)

- `index.html` loads only `script.js` as a **classic (non-module) script**. Several features use inline `onclick=` attributes (`playAudio`, `deleteVocab`), so those functions must remain global — do not convert `script.js` to an ES module.
- `script.js` responsibilities, in order:
  - `segmentText()` — naive tokenizer that only breaks on whitespace and CJK/ASCII punctuation. It does **not** do morphological segmentation, so a run of kana/kanji is treated as one clickable token.
  - `lookupWord()` → `GET /api/jisho?keyword=` → `displayDefinition()` renders reading + first 3 senses into the bottom-sheet popup.
  - Vocab store: an array persisted to `localStorage` under the key `savedVocab`; each item is `{ word, reading, definition, date }`. `renderVocabList()` re-renders the sidebar from that array; `exportToCSV()` / `handleImportCSV()` convert to and from a `Word,Reading,Definition` CSV.
  - `playAudio()` → `POST /api/tts` → plays the returned base64 MP3 (`data.audioContent`) via an `Audio` element.

### API (`api/jisho.js`, `api/tts.js`)

Vercel serverless functions that exist purely as CORS-avoiding proxies to third-party services; they hold no state.

- `api/jisho.js` — proxies `jisho.org/api/v1/search/words`, passes the JSON straight through.
- `api/tts.js` — proxies Google Cloud TTS `text:synthesize` with a fixed `ja-JP-Standard-A` voice and MP3 output.

### Dead / unused files

- `tinysegmenter.js` — a real Japanese segmenter that is **not** loaded by `index.html` or used by `script.js`. If you need proper word segmentation, wiring this in (and replacing `segmentText`) is the intended path.
- `tts.js` (repo root) — a stale duplicate of `api/tts.js`; the live endpoint is `api/tts.js`.
