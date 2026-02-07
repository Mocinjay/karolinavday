# Local preview (before uploading to GitHub)

Use a **local HTTP server** so that `fetch('photos.json')` works (opening `index.html` as a file in the browser will block fetch for security reasons).

## Option 1 — Python (simplest)

From the **repo root** (the folder that contains `index.html` and `photos.json`):

```bash
cd /Users/mocin/Desktop/karolinavday
python3 -m http.server 5500
```

Then open in your browser:

**http://localhost:5500/**

- Home: **http://localhost:5500/index.html**
- Us as Kids (after clicking Yes): **http://localhost:5500/kids.html?from=yes**

Stop the server with `Ctrl+C`.

---

## Option 2 — Node

If you have Node installed:

```bash
cd /Users/mocin/Desktop/karolinavday
npx serve -l 5500
```

Then open: **http://localhost:5500/**

Stop with `Ctrl+C`.

---

**Note:** Always run the command from the project root so that paths like `photos.json`, `assets/images/couples/`, and `assets/images/kids/` resolve correctly.
