## google-maps-mcp – Installation & Running

**Project folder**
- Local path: `c:\Users\S.Ashok.Kumar\Documents\ngmaps\google-maps-mcp`

---

## 1. Install dependencies

From your `ngmaps` workspace:

```bash
cd google-maps-mcp
npm install
```

This installs all Node.js dependencies defined in `package.json`.

---

## 2. Environment variables

In the project root, create or edit `.env`:

```bash
GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"
SERVER_API_KEY="YOUR_SERVER_API_KEY_HERE"
```

- `GOOGLE_MAPS_API_KEY`: used by the frontend (Maps JavaScript API, Places UI Kit).
- `SERVER_API_KEY`: used by the backend/MCP for Grounding Lite, Gemini API, and supporting Maps APIs (Routes, Places, Elevation).
- `SUPABASE_ACCESS_TOKEN` (optional): used by the Supabase MCP to read `localities` and `property_listings` (apartments and houses for sale). Create a Personal Access Token at [Supabase Account Tokens](https://supabase.com/dashboard/account/tokens). Run `scripts/supabase-real-estate-schema.sql` in the Supabase SQL editor. If not set, the app uses Google Maps tools only (no listing database).

---

## 3. Run the app in development

From inside `google-maps-mcp`:

```bash
cd google-maps-mcp
npm run dev
```

This runs:
- Vite dev server for the web app.
- Node/Express dev server hosting the MCP server.

Defaults:
- Frontend: `http://localhost:5173`

Stop the dev server with `Ctrl + C` in the terminal.

