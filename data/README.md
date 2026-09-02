# data/README — how to add items (for the Nieuw timeline)

This folder contains JSON files used by the site to populate the "Nieuw" timeline.

Quick steps to add a new demo via the GitHub web UI:

1. Upload your audio and thumbnail
   - Go to the repository and click "Add file → Upload files".
   - Upload the audio file to `assets/audio/` and the image to `assets/images/`.
   - Try to keep filenames simple and lowercased (e.g. `demo-2026-09-title.mp3`, `demo-2026-09.jpg`).

2. Open `data/nieuw/nieuw.json` (create it if it doesn't exist). Copy the sample format below and add a new object to the array.

Example object:

{
  "slug":"demo-2026-09",
  "date":"2026-09-05",
  "title":"Demo Title",
  "blurb":"Short note about this demo.",
  "image":"assets/images/demo-2026-09.jpg",
  "audio":"assets/audio/demo-2026-09.mp3"
}

3. Commit the change. The site reads `data/nieuw/nieuw.json` and will render the new item automatically.

If you prefer, you can add many JSON files (one per item) — the site will use `data/nieuw/nieuw.json` first, then `data/nieuw/sample.json` as a fallback.
