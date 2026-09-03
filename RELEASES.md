# How to add a release (Releases in Eigen Beheer)

This README explains the preferred, repeatable way to add a release to the "Releases in Eigen Beheer" page on this site.

Summary (what you'll add)
- Title (string)
- Year (string / YYYY)
- Cover image (file placed under assets/images/)
- Tracklist (ordered array of track objects with title + optional file)
- Credits / Notes (string)

Preferred data format
- We keep releases in a JSON file so the page can render them programmatically.
- File path: `data/releases/releases.json`
- Images go in `assets/images/`
- Audio previews (optional) go in `assets/audio/`

Recommended JSON schema (one entry per release)

```json
{
  "slug": "voorbeeld-album-2026",
  "title": "Voorbeeld Album",
  "year": "2026",
  "image": "assets/images/voorbeeld-album-2026.jpg",
  "tracklist": [
    { "track": 1, "title": "Intro", "file": "assets/audio/voorbeeld-intro.mp3" },
    { "track": 2, "title": "Nummer Twee", "file": "assets/audio/voorbeeld-2.mp3" }
  ],
  "credits": "Music & production by Thijs Jenster. Recorded at Studio X. Mastered by Y.",
  "bandcamp": "https://eigenbeheer.bandcamp.com/album/voorbeeld-album"
}
```

Notes on fields
- slug: short URL-friendly id used for ordering or linking. Lowercase, dashes instead of spaces.
- title: display title.
- year: YYYY or full year string.
- image: path to cover image. Prefer `assets/images/<filename>`.
- tracklist: an ordered array. Each track object should include at least a `title`; `file` is optional (audio preview). `track` can hold the track number.
- credits: free-text credits and notes.
- bandcamp (optional): link to Bandcamp or purchase page.

Image guidelines
- Recommended size: square or near-square. 1000×1000 px is good; smaller is fine but avoid huge files.
- Use JPG or PNG and put the file into `assets/images/`.
- Filenames should match what's referenced in the JSON exactly (case-sensitive on some servers).

Audio preview guidelines
- Small clips (MP3/AAC) may be placed in `assets/audio/` (avoid very large files).
- If files are larger than ~50 MB, host externally and reference an absolute URL in the `file` field.

Adding a new release — step-by-step (GitHub web UI)
1. Prepare files locally: cover image (JPEG/PNG) and any audio preview files.
2. Upload images/audio:
   - Go to the repo → `assets/images/` → Upload files → choose your cover image → Commit.
   - (Optional) Upload audio to `assets/audio/`.
3. Edit (or create) `data/releases/releases.json`:
   - If it doesn't exist, create the file (path: `data/releases/releases.json`) and add an array `[]` as the top-level value.
   - Add your release object following the schema above.
   - Commit the change to `main`.
4. Wait ~1–2 minutes for GitHub Pages to rebuild, then open the Releases page and verify.

Adding a new release — step-by-step (local git)
1. git clone https://github.com/Thijsjenster/thijsjenster.github.io.git
2. cd thijsjenster.github.io
3. Copy your image to `assets/images/` and audio to `assets/audio/`.
4. Open or create `data/releases/releases.json` and add the release object.
5. git add assets/images/<file> data/releases/releases.json (and audio if any)
6. git commit -m "Add release: Voorbeeld Album (2026)"
7. git push origin main
8. Wait for Pages to rebuild and verify.

HTML/manual alternative
- If the Releases page is static HTML and you prefer to add a card manually, add a card in `eigen.html` inside the `#releases-list` container using this snippet:

```html
<article class="card">
  <img src="assets/images/voorbeeld-album-2026.jpg" alt="Voorbeeld Album cover">
  <h3>Voorbeeld Album (2026)</h3>
  <p>Credits: Music & production by Thijs Jenster. Recorded at Studio X.</p>
  <ol>
    <li>Intro</li>
    <li>Nummer Twee</li>
  </ol>
  <p><a href="https://eigenbeheer.bandcamp.com/album/voorbeeld-album" target="_blank" rel="noopener">Open on Bandcamp</a></p>
</article>
```

Tips & troubleshooting
- If a cover image or audio preview doesn't appear, check the raw file URL in the browser to ensure the file exists:
  - https://raw.githubusercontent.com/Thijsjenster/thijsjenster.github.io/main/assets/images/voorbeeld-album-2026.jpg
- Use the browser DevTools Network tab to look for 404s for image/audio/JSON files.
- JSON must be valid: use a linter or https://jsonlint.com/ before committing.
- Filenames are case-sensitive on many hosts — ensure the path in JSON exactly matches the uploaded filename.

Example full releases.json

```json
[
  {
    "slug": "voorbeeld-album-2026",
    "title": "Voorbeeld Album",
    "year": "2026",
    "image": "assets/images/voorbeeld-album-2026.jpg",
    "tracklist": [
      { "track": 1, "title": "Intro", "file": "assets/audio/voorbeeld-intro.mp3" },
      { "track": 2, "title": "Nummer Twee", "file": "assets/audio/voorbeeld-2.mp3" }
    ],
    "credits": "Music & production by Thijs Jenster. Recorded at Studio X. Mastered by Y.",
    "bandcamp": "https://eigenbeheer.bandcamp.com/album/voorbeeld-album"
  }
]
```

If you want I can:
- Create the `data/releases/releases.json` file with a starter example,
- Add a README at `data/releases/README.md` with these instructions,
- Or generate a ready-to-paste card for `eigen.html` for you to copy.

Tell me which of the three you'd like me to do and I will apply it to the repo.