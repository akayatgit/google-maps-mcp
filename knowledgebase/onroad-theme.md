## OnRoad UI Theme

**Goal**: A dark, road/night–inspired theme with bright sky–blue accents that feels like a driving assistant, applied consistently across chat cards, input, quick answers, and overlays.

---

## 1. Design tokens

Defined in `index.css` using CSS variables:

- **Background**: `--onroad-bg = #050816` (deep navy / night sky)
- **Surface (cards/panels)**: `--onroad-surface = #0f172a`
- **Soft surface**: `--onroad-surface-soft = #111827`
- **Accent (primary)**: `--onroad-accent = #38bdf8` (sky blue)
- **Accent (hover)**: `--onroad-accent-soft = #0ea5e9`
- **Accent (secondary)**: `--onroad-accent-muted = #1d4ed8`
- **Text (primary)**: `--onroad-text = #e5e7eb`
- **Text (secondary)**: `--onroad-text-soft = #9ca3af`
- **Danger**: `--onroad-danger = #f97373`

Scrollbar, code blocks, links, blockquotes, and tables are restyled to match these tokens.

---

## 2. Layout background

In `chat-app.ts` main wrapper:

- App background uses a **radial gradient**:
  - From `#1f2937` (top) → `#020617` → `#000000` (edges).
- Global text color set to `#e5e7eb`.
- Text selection uses accent: background `#38bdf8`, text `#0b1120`.

---

## 3. Chat messages (cards)

In `chat-app.ts`:

- **User messages**:
  - Background: `#38bdf8`
  - Text: `#020617`
  - Shape: rounded bubble (`rounded-t-2xl rounded-l-2xl rounded-br-lg`)
- **Assistant (model) messages**:
  - Background: `#0f172a`
  - Text: `#e5e7eb`
  - Border: `1px solid #1f2937`
  - Shape: `rounded-t-2xl rounded-r-2xl rounded-bl-lg`

Quick–answer buttons:

- Background: `#38bdf8` → hover `#0ea5e9`
- Text: `#020617`
- Fully rounded pills with subtle shadow.

Maps attribution and small utility buttons use muted greys (`#9ca3af`, `#1f2937`) so the blue accents stand out.

---

## 4. Input & send button

- **Text field**:
  - Background: `#020617`
  - Text: `#e5e7eb`
  - Border: `#1f2937`
  - Shape: rounded left–full (`rounded-l-full`)
- **Send button**:
  - Background: `#38bdf8` → hover `#0ea5e9`
  - Text: `#020617`
  - Shape: rounded right–full (`rounded-r-full`)
  - Disabled state: background `#1f2937`, text `#4b5563`.

This combo makes the input row feel like a single, pill–shaped control.

---

## 5. Overlays & modals

- Mobile chat toggle:
  - Background: semi–transparent `#020617cc`
  - Text: `#e5e7eb`
  - Border: `#1f2937`
- Error banner:
  - Background: `#1f2937`
  - Text: `#f97373`
  - Border: `#374151`
- Raw response modal:
  - Backdrop: `bg-black bg-opacity-70` with blur.
  - Modal surface: `#020617` with border `#1f2937`.
  - Header bar: `#0f172a`, text `#e5e7eb`.
  - Tool headings: `#38bdf8`.

---

## 6. How to extend the theme

- Prefer using the **CSS variables in `index.css`** (`var(--onroad-...)`) when adding new components.
- For new cards or panels, reuse:
  - Background: `var(--onroad-surface)` or `var(--onroad-surface-soft)`
  - Text: `var(--onroad-text)`
  - Border: `#1f2937`
- For interactive elements (buttons, chips, links), build on:
  - Default: `var(--onroad-accent)`
  - Hover: `var(--onroad-accent-soft)`
  - Disabled/secondary: `var(--onroad-text-soft)` + darker surfaces.

Keeping new UI in these ranges will maintain the OnRoad brand feel across the app.

