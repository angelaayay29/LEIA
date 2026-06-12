# Deploy ORBIT — share a public link with your team

ORBIT is a **static site** (HTML/CSS/JS in the `static/` folder). No server or Node.js is required in production.

---

## Fastest option: Netlify Drop (~2 minutes)

Best if you want a public URL **right now** without using the terminal.

1. Go to **[app.netlify.com/drop](https://app.netlify.com/drop)** (create a free Netlify account if prompted).
2. Drag the entire **`static`** folder from Finder onto the page.
3. Netlify gives you a live URL like `https://random-name-123.netlify.app` — share that link.
4. Optional: in Netlify → **Site settings → Domain management → Change site name** to pick a nicer URL (e.g. `orbit-gst360.netlify.app`).

To update later: drag the `static` folder again, or connect this repo to Netlify for auto-deploys.

---

## Option B: GitHub Pages (good for ongoing updates)

1. Create a new repository on [github.com/new](https://github.com/new) (e.g. `ORBIT-V1`).
2. In Terminal, from this project folder:

```bash
cd /Users/angela.yang2/ORBIT_V1
git remote add origin https://github.com/YOUR_USERNAME/ORBIT-V1.git
git push -u origin main
```

3. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. The workflow in `.github/workflows/deploy-pages.yml` runs automatically. Your site will be at:

   `https://YOUR_USERNAME.github.io/ORBIT-V1/`

5. Share these links with your team:
   - Login: `https://YOUR_USERNAME.github.io/ORBIT-V1/#login`
   - Retro: `https://YOUR_USERNAME.github.io/ORBIT-V1/#retro`
   - Planning: `https://YOUR_USERNAME.github.io/ORBIT-V1/#planning`

---

## Option C: Netlify connected to GitHub (auto-deploy on every push)

1. Push this repo to GitHub (steps above).
2. Go to **[app.netlify.com](https://app.netlify.com)** → **Add new site → Import an existing project**.
3. Connect GitHub, select the repo. Netlify reads `netlify.toml` and publishes the `static/` folder automatically.

---

## Demo login (share with viewers)

| Role   | Username | Password  |
|--------|----------|-----------|
| Editor | `editor` | `edit123` |
| Viewer | `viewer` | `view123` |

**Security note:** These are demo credentials baked into the static app. Anyone with the public URL can log in as editor. Before a production rollout, replace client-side auth with real SSO (e.g. Disney Okta) and do not ship hardcoded passwords.

---

## What won't work on the public internet

- **Local-only:** Double-clicking `Start ORBIT.command` or `python3 -m http.server` — only people on your Mac/network can reach that.
- **You need a host** (Netlify, GitHub Pages, Cloudflare Pages, etc.) to get a shareable `https://` link.
