# LEIA — Leadership Executive Intelligence and Agile Tracker

*(formerly ORBIT — Operations, Risk, and Backlog Intelligence Tracker)*

LEIA is a sprint retrospective and planning dashboard for agile teams. It presents widget-based summaries with hover metadata, drag-and-drop reordering, and a space-themed dark UI with star rain on page navigation. Demo logins let editors and viewers explore the app; all changes persist in browser localStorage. The recommended way to run the app is the static site in the `static/` folder — no Node.js required.

**Live demo:** [https://angelaayay29.github.io/ORBIT/](https://angelaayay29.github.io/ORBIT/) — the GitHub repository may still be named ORBIT, so this URL remains valid until the repo is renamed.

---

## Run without Node.js (recommended if npm is not installed)

Python 3 is built into macOS. Use the static version:

### Option A — Double-click (easiest)

1. Open Finder → go to `LEIA_V0/static/`
2. Double-click **`Start LEIA.command`**
3. Open **http://localhost:8888** in your browser

### Option B — Terminal

```bash
cd /Users/angela.yang2/LEIA_V0/static
python3 -m http.server 8888
```

Then open **http://localhost:8888**

If 8888 is busy, `Start LEIA.command` will automatically try 8889, 8890, and so on. Do not open `index.html` directly from Finder — use the localhost URL.

---

## Demo credentials

| Role   | Username | Password |
|--------|----------|----------|
| Editor | `editor` | `edit123` |
| Viewer | `viewer` | `view123` |

- **Editors** can edit field values and drag-and-drop widgets
- **Viewers** can view all data and drag-and-drop widgets

---

## Features

Two pages — **Sprint Retrospective** and **Sprint Planning** — each built from the same widget set:

- Hover the **ⓘ** icon on any widget for metadata (owner, data sources, pending questions)
- Drag widgets by the **⠿** handle to reorder
- Space / Star Wars–themed dark UI with star rain on page navigation
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
