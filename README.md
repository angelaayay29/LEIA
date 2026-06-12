# ORBIT — Operations, Risk, and Backlog Intelligence Tracker

## Run without Node.js (recommended if npm is not installed)

Python 3 is built into macOS. Use the static version:

### Option A — Double-click (easiest)

1. Open Finder → go to `ORBIT_V1/static/`
2. Double-click **`Start ORBIT.command`**
3. Open **http://localhost:8888** in your browser

### Option B — Terminal

```bash
cd /Users/angela.yang2/ORBIT_V1/static
python3 -m http.server 8888
```

Then open **http://localhost:8888**

If 8888 is busy, `Start ORBIT.command` will automatically try 8889, 8890, etc. Don't open `index.html` directly from Finder — use the localhost URL.

| Role   | Username | Password |
|--------|----------|----------|
| Editor | `editor` | `edit123` |
| Viewer | `viewer` | `view123` |

- **Editors** can edit field values and drag-and-drop widgets
- **Viewers** can view all data and drag-and-drop widgets

## Features

- Sprint Retrospective and Sprint Planning dashboards
- Hover the **ⓘ** icon on any widget for metadata (owner, data sources, pending questions)
- Drag widgets by the **⠿** handle to reorder
- Space-themed dark UI with star rain on page navigation
- Changes persist in browser localStorage

---

## Share on the internet (public URL)

See **[DEPLOY.md](./DEPLOY.md)** for full instructions.

**Quickest path:** drag the `static/` folder onto [Netlify Drop](https://app.netlify.com/drop) — you get a live `https://` link in about 2 minutes, no Node.js required.

---

## Optional: React version (requires Node.js)

If you install Node.js later:

```bash
npm install
npm run dev
```
