# FrameBeat Studio — HTML5 Audio Visualizer

Version 2 adds a cleaner studio-style interface and bilingual controls.

## Live demo

Try the live **MP3 to MP4 Equalizer** at [apps.6arshid.com/mp3tomp4/](https://apps.6arshid.com/mp3tomp4/).

## Features

- English is the default UI language
- Persian / فارسی switch
- Cover / thumbnail upload
- MP3 upload
- Title
- Optional description
- Optional image inside the description block
- Drag the description block directly on the canvas
- Numeric X/Y positioning for exact placement
- Description width, alignment and visual style controls
- Google Fonts:
  - attempts to load the complete public Google Fonts catalog from `fonts.google.com/metadata/fonts`
  - searchable datalist
  - you can manually type any Google Font family
  - selected font is loaded from `fonts.googleapis.com`
- Visualizers:
  - Bars
  - Mirror Bars
  - Circle
  - Wave
- 1:1, 9:16 and 16:9
- 720p and 1080p
- Browser-side MP4 export using MediaRecorder + FFmpeg.WASM
- WebM fallback if MP4 transcoding is unavailable

## Run locally

Do not open with `file://`. Use a local HTTP server.

```bash
python -m http.server 8080
```

Then open:

`http://localhost:8080`

Chrome or Edge desktop is recommended.

## Google Fonts note

The font catalog is fetched at runtime. Internet access is required for the full catalog and CDN font loading. If the catalog endpoint is blocked, a fallback list is shown and any Google Font family can still be typed manually.

## Export note

Browsers typically record canvas video as WebM. FrameBeat records the canvas and Web Audio output, then converts it to H.264/AAC MP4 with FFmpeg.WASM.
