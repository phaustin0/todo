# Todo

A small personal todo list — vanilla HTML/CSS/JS, no build step, no backend.

## What this is

A single-page app for maintaining a manually ordered list of tasks: add,
edit inline, complete, delete, and drag to reorder. Task data is stored
only in the browser's `localStorage` — nothing is sent over the network
and nothing is committed to this repository.

## Running locally

No build step or server is required. Open `index.html` directly in a
browser, or serve the folder with any static file server, e.g.:

```bash
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Deployment

This is a static site, deployed via GitHub Pages from this repository.
Push to the repository's default branch and enable Pages (Settings →
Pages → deploy from branch) to serve `index.html` at the repo's Pages URL.

## Data storage

All tasks live in the browser's `localStorage`, scoped to the page's
origin. Data persists between sessions but stays local to whichever
browser (or Safari web app) is being used — there is no sync between
devices or browsers.
