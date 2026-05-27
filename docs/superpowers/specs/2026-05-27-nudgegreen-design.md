# NudgeGreen — Design Spec
_Date: 2026-05-27_

## Overview

Single-page React app that takes a daily decision as text input, sends it to a local Ollama model (llama3.1:8b), and displays the environmental impact with greener alternatives. No login, no routing, no external API keys.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Bundler | Vite |
| UI | React 18 |
| Styling | Tailwind CSS v3 |
| LLM | Ollama (llama3.1:8b) via local REST API |
| Language | JavaScript (no TypeScript) |

---

## Component Tree

```
App
├── InputForm       — textarea + submit button
├── LoadingState    — centered spinner while model responds
└── ResultCard      — split-panel result display
```

All state lives in `App`:
- `input` (string) — current textarea value
- `loading` (boolean) — API call in flight
- `result` (object | null) — parsed JSON from Ollama
- `error` (string | null) — error message to display

---

## Ollama Integration

**Endpoint:** `POST http://localhost:11434/api/chat`

**Request body:**
```json
{
  "model": "llama3.1:8b",
  "format": "json",
  "stream": false,
  "messages": [
    { "role": "system", "content": "<system prompt>" },
    { "role": "user", "content": "<user decision>" }
  ]
}
```

The `format: "json"` flag forces Ollama to return valid JSON output.

**System prompt:**
```
You are a sustainability expert. When given a daily decision or action, analyze its environmental impact and return a JSON object with exactly this structure:
{
  "impact_level": "Low" | "Medium" | "High",
  "impact_reason": "<exactly 2 sentences explaining the impact>",
  "co2_estimate": "<e.g. ~1.2 kg CO₂>",
  "alternatives": [
    { "title": "<alternative action>", "co2_saving": "<e.g. ~0.8 kg CO₂ saved>" },
    { "title": "<alternative action>", "co2_saving": "<e.g. ~0.4 kg CO₂ saved>" }
  ]
}
Return only valid JSON. No explanation, no markdown, no extra text.
```

**Expected response shape:**
```json
{
  "impact_level": "High",
  "impact_reason": "Two sentence explanation.",
  "co2_estimate": "~3.5 kg CO₂",
  "alternatives": [
    { "title": "Cook at home", "co2_saving": "~2.8 kg CO₂ saved" },
    { "title": "Local restaurant (walk)", "co2_saving": "~1.5 kg CO₂ saved" }
  ]
}
```

**Error handling:**
- Ollama not running → show message: "Ollama is not running. Start it with `ollama serve`."
- JSON parse failure → show message: "Could not parse model response. Try again."
- Network/fetch error → show generic error message

---

## UI Design

### Page Layout

Full-page green-tinted background (`bg-green-50`). Content centered with max-width `max-w-2xl`. Header with app name and tagline at top.

### InputForm

- Textarea with placeholder: `"e.g. ordering Zomato delivery, driving to work, buying a plastic bottle..."`
- Green-themed submit button: `"Check Impact"`
- Button disabled while loading or input is empty

### LoadingState

Centered spinner with message: `"Analyzing environmental impact..."`

### ResultCard — Split Panel

```
┌──────────────────────────────────────────────┐
│  Left (60%)              │  Right (40%)       │
│                          │                    │
│  [HIGH IMPACT] badge     │  Try instead:      │
│  ~3.5 kg CO₂             │  ┌──────────────┐  │
│                          │  │ Cook at home │  │
│  "Two sentence reason    │  │ Saves ~2.8kg │  │
│   explaining the         │  └──────────────┘  │
│   environmental          │  ┌──────────────┐  │
│   impact clearly."       │  │ Local cafe   │  │
│                          │  │ Saves ~1.5kg │  │
│                          │  └──────────────┘  │
└──────────────────────────────────────────────┘
```

**Badge colors:**
- `Low` → `bg-green-500 text-white`
- `Medium` → `bg-yellow-400 text-gray-900`
- `High` → `bg-red-500 text-white`

**Alternative cards:** white background, `border border-green-200`, green left-border accent, title in dark text, CO₂ saving in `text-green-600`.

---

## Color Theme

Tailwind green scale throughout:
- Page background: `bg-green-50`
- Card background: `bg-white`
- Primary accent: `green-600`
- Text: `gray-800` / `gray-600`
- Submit button: `bg-green-600 hover:bg-green-700 text-white`

---

## File Structure

```
/
├── index.html
├── vite.config.js
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── components/
    │   ├── InputForm.jsx
    │   ├── LoadingState.jsx
    │   └── ResultCard.jsx
    └── utils/
        └── ollama.js      — API call + prompt logic
```

---

## Out of Scope

- Authentication / login
- Routing / multiple pages
- History / saving past decisions
- Deployment (local dev only)
- API key management (Ollama is keyless)
