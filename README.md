
# Temple‑Prep – 7‑Day Guide

This repository contains a Vite‑powered web app that you can run locally or deploy with Docker.

## Run locally

**Prerequisites**
- Node 20 (or later)
- npm (bundled with Node)

1. Install dependencies

```bash
npm ci
```

2. Build the production assets

```bash
npm run build
```

3. Start the preview server (serves the built files)

```bash
npm run preview
```

The app will be available at `http://localhost:3000` (or the port you specify with `--port`).

## Deploy with Docker

A multistage Dockerfile builds the assets and serves them with nginx. After building the image, run:

```bash
docker build -t temple-prep .
docker run -d -p 8009:80 --name temple-prep-container temple-prep:latest
```

You can then open `http://localhost:8009` in your browser.

---

*This repo is public; no secret keys (e.g., Gemini API keys) are required to run or deploy the application.*
