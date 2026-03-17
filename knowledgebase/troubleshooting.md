## google-maps-mcp – Troubleshooting Notes

This doc records issues hit when first running the fork, so you can fix them quickly next time you fork or reclone.

---

## 1. Vite/Rollup error: `Cannot find module '@rollup/rollup-win32-x64-msvc'`

**Symptom**

Running:

```bash
cd google-maps-mcp
npm run dev
```

fails with:

> Error: Cannot find module @rollup/rollup-win32-x64-msvc. npm has a bug related to optional dependencies ... Please try `npm i` again after removing both package-lock.json and node_modules directory.

**Cause**

Known npm issue with optional native Rollup binaries on Windows. The install completes, but the native Rollup binary for your platform is missing or not linked correctly.

**Fix (always safe after a fresh clone)**

From the project root:

```bash
cd c:\Users\S.Ashok.Kumar\Documents\ngmaps\google-maps-mcp
Remove-Item -Recurse -Force node_modules      # or delete via Explorer
Remove-Item -Force package-lock.json         # or delete via Explorer
npm install
```

Then try again:

```bash
npm run dev
```

---

## 2. Node 22 + `data:text` loader error (MCP server won’t start)

**Symptom**

Even after fixing Rollup, the backend crashes with:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find package ''data:text' imported from ...
```

and `nodemon` logs:

```text
node --import 'data:text/javascript,import { register } from "node:module"; ...'
```

**Cause**

The original `dev:server:watch` script in `package.json` uses a `data:text/javascript,...` `--import` trick to register `ts-node/esm`. This works on some Node versions but breaks on Node v22.16.0, which tries to resolve `'data:text'` as a package.

**Fix (one-time change after forking)**

In `package.json`, update the `dev:server:watch` script to use the simpler loader form:

- **Before**:

```json
"dev:server:watch": "nodemon --watch start.ts --watch mcpPlacesServer.ts --watch types.ts --watch api/ --watch services/ --exec \"node --import 'data:text/javascript,import { register } from \\\"node:module\\\"; import { pathToFileURL } from \\\"node:url\\\"; register(\\\"ts-node/esm\\\", pathToFileURL(\\\"./\\\"));' start.ts\"",
```

- **After**:

```json
"dev:server:watch": "nodemon --watch start.ts --watch mcpPlacesServer.ts --watch types.ts --watch api/ --watch services/ --exec \"node --loader ts-node/esm start.ts\"",
```

Once this is changed, run:

```bash
cd google-maps-mcp
npm run dev
```

You may see a warning about `--experimental-loader` and some deprecation warnings, but the backend will run and the app will work.

---

## 3. Vite port changes (5173 → 5174, etc.)

**Symptom**

Console shows:

```text
Port 5173 is in use, trying another one...
VITE v6.x.x  ready ...
  Local:   http://localhost:5174/
```

**Cause**

Another Vite/dev server is already using port 5173. Vite automatically falls back to the next free port.

**Fix**

- Just open the URL Vite prints (e.g. `http://localhost:5174/`).
- If you want 5173 back, stop other dev servers using that port before re-running `npm run dev`.

