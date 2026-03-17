## google-maps-mcp – Fork & Git Workflow

**Repo locations**
- **Origin (your fork)**: `https://github.com/akayatgit/google-maps-mcp.git`
- **Upstream (original sample app)**: `https://github.com/googlemaps-samples/grounding-lite-mcp-sample-app.git`
- **Local path**: `c:\Users\S.Ashok.Kumar\Documents\ngmaps\google-maps-mcp`

---

## 1. Clone & remotes

Clone your fork into `Documents\ngmaps`:

```bash
cd "c:\Users\S.Ashok.Kumar\Documents\ngmaps"
git clone https://github.com/akayatgit/google-maps-mcp.git
cd google-maps-mcp
```

Add the original repo as `upstream`:

```bash
git remote add upstream https://github.com/googlemaps-samples/grounding-lite-mcp-sample-app.git
git remote -v
```

You should see:
- `origin` → your fork
- `upstream` → original sample app

---

## 2. Keeping `main` in sync with upstream

From inside `google-maps-mcp`:

```bash
git checkout main
git fetch upstream
git merge upstream/main      # or: git rebase upstream/main
git push origin main
```

This:
- Updates local `main` from `upstream/main`
- Pushes the updated `main` back to your fork (`origin`)

---

## 3. Working on premium features

Create feature branches from `main`:

```bash
git checkout main
git pull origin main
git checkout -b feature/premium-maps-experience
```

After making changes:

```bash
git add .
git commit -m "Add premium maps experience MVP"
git push -u origin feature/premium-maps-experience
```

Optionally open a PR in your fork from `feature/*` → `main` and merge.

To update a feature branch with the latest upstream changes:

```bash
git checkout main
git fetch upstream
git merge upstream/main      # or rebase
git push origin main

git checkout feature/premium-maps-experience
git rebase main              # or: git merge main
```

---

## 4. Running the app locally

From `google-maps-mcp`:

```bash
npm install
```

Create `.env` in the project root and set:

```bash
GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"
SERVER_API_KEY="YOUR_SERVER_API_KEY_HERE"
```

Then run in development mode:

```bash
npm run dev
```

The frontend (Vite) will typically run on `http://localhost:5173`, and the backend Node/Express server hosts the MCP server, following the original app’s architecture described in the upstream README.

