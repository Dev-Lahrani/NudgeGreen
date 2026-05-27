# NudgeGreen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page React app that takes a daily decision, calls a local Ollama model, and displays the environmental impact with greener alternatives.

**Architecture:** Vite + React SPA with Tailwind CSS. All state lives in `App.jsx`. A pure utility `ollama.js` handles the API call and prompt construction and is unit-tested with vitest + msw. Components are dumb — they receive props and render.

**Tech Stack:** Vite, React 19, Tailwind CSS v3, Ollama (llama3.1:8b), Vitest, @testing-library/react

---

## File Map

| File | Responsibility |
|---|---|
| `src/utils/ollama.js` | Build prompt, POST to Ollama, parse JSON response |
| `src/components/InputForm.jsx` | Textarea + submit button, calls `onSubmit(text)` |
| `src/components/LoadingState.jsx` | Centered spinner + message |
| `src/components/ResultCard.jsx` | Split-panel: impact left, alternatives right |
| `src/App.jsx` | State machine: idle → loading → result/error |
| `src/main.jsx` | React DOM mount |
| `src/utils/ollama.test.js` | Unit tests for ollama utility |
| `src/components/ResultCard.test.jsx` | Unit tests for badge color logic |

---

### Task 1: Scaffold the project

**Files:**
- Create: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.jsx`

- [ ] **Step 1: Create the Vite + React project**

```bash
cd "/home/dev-lahrani/Desktop/Projcts/Nudge Green"
npm create vite@latest . -- --template react
```

When prompted "Current directory is not empty. Remove existing files and continue?" — choose **Yes** (only the git repo and docs exist, they'll be preserved).

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npx tailwindcss init -p
```

- [ ] **Step 3: Configure Tailwind — replace `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 4: Replace `src/index.css` with Tailwind directives**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Configure Vitest — add `test` block to `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.js'],
  },
})
```

- [ ] **Step 6: Create `src/test-setup.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Replace `package.json` scripts to add test command**

Open `package.json` and add `"test": "vitest"` and `"test:run": "vitest run"` to the `scripts` block. The scripts section should look like:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run"
}
```

- [ ] **Step 8: Verify scaffold runs**

```bash
npm run dev
```

Expected: Vite dev server starts, opens at http://localhost:5173. Stop it with Ctrl+C.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + Tailwind + Vitest"
```

---

### Task 2: Ollama utility (TDD)

**Files:**
- Create: `src/utils/ollama.js`
- Create: `src/utils/ollama.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/utils/ollama.test.js`:

```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { queryOllama } from './ollama'

const VALID_RESPONSE = {
  impact_level: 'High',
  impact_reason: 'Sentence one. Sentence two.',
  co2_estimate: '~3.5 kg CO₂',
  alternatives: [
    { title: 'Cook at home', co2_saving: '~2.8 kg CO₂ saved' },
    { title: 'Local restaurant', co2_saving: '~1.5 kg CO₂ saved' },
  ],
}

beforeEach(() => {
  global.fetch = vi.fn()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('queryOllama', () => {
  it('returns parsed result on success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: { content: JSON.stringify(VALID_RESPONSE) },
      }),
    })

    const result = await queryOllama('ordering Zomato delivery')
    expect(result).toEqual(VALID_RESPONSE)
  })

  it('throws when Ollama is not running (network error)', async () => {
    global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(queryOllama('ordering Zomato')).rejects.toThrow(
      'Ollama is not running'
    )
  })

  it('throws when response is not ok', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 })
    await expect(queryOllama('ordering Zomato')).rejects.toThrow(
      'Ollama returned an error'
    )
  })

  it('throws when response JSON is malformed', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: { content: 'not json at all' },
      }),
    })
    await expect(queryOllama('ordering Zomato')).rejects.toThrow(
      'Could not parse model response'
    )
  })
})
```

- [ ] **Step 2: Run tests — verify they all fail**

```bash
npm run test:run
```

Expected: 4 tests fail with "queryOllama is not a function" or similar.

- [ ] **Step 3: Implement `src/utils/ollama.js`**

```js
const OLLAMA_URL = 'http://localhost:11434/api/chat'
const MODEL = 'llama3.1:8b'

const SYSTEM_PROMPT = `You are a sustainability expert. When given a daily decision or action, analyze its environmental impact and return a JSON object with exactly this structure:
{
  "impact_level": "Low" or "Medium" or "High",
  "impact_reason": "<exactly 2 sentences explaining the impact>",
  "co2_estimate": "<e.g. ~1.2 kg CO₂>",
  "alternatives": [
    { "title": "<alternative action>", "co2_saving": "<e.g. ~0.8 kg CO₂ saved>" },
    { "title": "<alternative action>", "co2_saving": "<e.g. ~0.4 kg CO₂ saved>" }
  ]
}
Return only valid JSON. No explanation, no markdown, no extra text.`

export async function queryOllama(userDecision) {
  let response
  try {
    response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        format: 'json',
        stream: false,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userDecision },
        ],
      }),
    })
  } catch {
    throw new Error('Ollama is not running. Start it with: ollama serve')
  }

  if (!response.ok) {
    throw new Error(`Ollama returned an error (status ${response.status})`)
  }

  const data = await response.json()
  const raw = data.message?.content ?? ''

  try {
    return JSON.parse(raw)
  } catch {
    throw new Error('Could not parse model response. Try again.')
  }
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
npm run test:run
```

Expected: 4 tests pass, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add src/utils/ollama.js src/utils/ollama.test.js
git commit -m "feat: add Ollama utility with JSON prompt and error handling"
```

---

### Task 3: InputForm component

**Files:**
- Create: `src/components/InputForm.jsx`

- [ ] **Step 1: Create `src/components/InputForm.jsx`**

```jsx
export default function InputForm({ onSubmit, loading }) {
  function handleSubmit(e) {
    e.preventDefault()
    const value = e.target.elements.decision.value.trim()
    if (value) onSubmit(value)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        name="decision"
        rows={3}
        disabled={loading}
        placeholder="e.g. ordering Zomato delivery, driving to work, buying a plastic bottle..."
        className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-gray-800 placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 disabled:opacity-50 resize-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="self-end rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {loading ? 'Analyzing...' : 'Check Impact'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Smoke-test in browser**

Temporarily import and render `InputForm` in `src/App.jsx`:

```jsx
import InputForm from './components/InputForm'

export default function App() {
  return (
    <div className="min-h-screen bg-green-50 p-8">
      <InputForm onSubmit={console.log} loading={false} />
    </div>
  )
}
```

Run `npm run dev`, open http://localhost:5173, verify textarea and button render with green styling. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/components/InputForm.jsx src/App.jsx
git commit -m "feat: add InputForm component"
```

---

### Task 4: LoadingState component

**Files:**
- Create: `src/components/LoadingState.jsx`

- [ ] **Step 1: Create `src/components/LoadingState.jsx`**

```jsx
export default function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
      <p className="text-green-700 font-medium">Analyzing environmental impact...</p>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LoadingState.jsx
git commit -m "feat: add LoadingState component"
```

---

### Task 5: ResultCard component (TDD for badge logic)

**Files:**
- Create: `src/components/ResultCard.jsx`
- Create: `src/components/ResultCard.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/ResultCard.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import ResultCard from './ResultCard'

const BASE_RESULT = {
  impact_level: 'High',
  impact_reason: 'Sentence one. Sentence two.',
  co2_estimate: '~3.5 kg CO₂',
  alternatives: [
    { title: 'Cook at home', co2_saving: '~2.8 kg CO₂ saved' },
    { title: 'Local restaurant', co2_saving: '~1.5 kg CO₂ saved' },
  ],
}

describe('ResultCard', () => {
  it('renders impact level badge', () => {
    render(<ResultCard result={BASE_RESULT} />)
    expect(screen.getByText('HIGH IMPACT')).toBeInTheDocument()
  })

  it('renders co2 estimate', () => {
    render(<ResultCard result={BASE_RESULT} />)
    expect(screen.getByText('~3.5 kg CO₂')).toBeInTheDocument()
  })

  it('renders both alternative titles', () => {
    render(<ResultCard result={BASE_RESULT} />)
    expect(screen.getByText('Cook at home')).toBeInTheDocument()
    expect(screen.getByText('Local restaurant')).toBeInTheDocument()
  })

  it('uses green badge for Low impact', () => {
    render(<ResultCard result={{ ...BASE_RESULT, impact_level: 'Low' }} />)
    const badge = screen.getByText('LOW IMPACT')
    expect(badge).toHaveClass('bg-green-500')
  })

  it('uses yellow badge for Medium impact', () => {
    render(<ResultCard result={{ ...BASE_RESULT, impact_level: 'Medium' }} />)
    const badge = screen.getByText('MEDIUM IMPACT')
    expect(badge).toHaveClass('bg-yellow-400')
  })

  it('uses red badge for High impact', () => {
    render(<ResultCard result={BASE_RESULT} />)
    const badge = screen.getByText('HIGH IMPACT')
    expect(badge).toHaveClass('bg-red-500')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm run test:run
```

Expected: 6 tests fail with "Cannot find module './ResultCard'".

- [ ] **Step 3: Implement `src/components/ResultCard.jsx`**

```jsx
const BADGE_STYLES = {
  Low: 'bg-green-500 text-white',
  Medium: 'bg-yellow-400 text-gray-900',
  High: 'bg-red-500 text-white',
}

export default function ResultCard({ result }) {
  const { impact_level, impact_reason, co2_estimate, alternatives } = result
  const badgeStyle = BADGE_STYLES[impact_level] ?? 'bg-gray-400 text-white'

  return (
    <div className="rounded-2xl border border-green-100 bg-white shadow-md overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Left: impact info */}
        <div className="flex-1 p-6 border-b sm:border-b-0 sm:border-r border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${badgeStyle}`}>
              {impact_level} Impact
            </span>
            <span className="text-sm text-gray-500">{co2_estimate}</span>
          </div>
          <p className="text-gray-700 leading-relaxed">{impact_reason}</p>
        </div>

        {/* Right: alternatives */}
        <div className="w-full sm:w-64 p-6 bg-green-50 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-green-700">Try instead</h3>
          {alternatives.map((alt, i) => (
            <div
              key={i}
              className="rounded-xl border border-green-200 bg-white p-4 border-l-4 border-l-green-500"
            >
              <p className="font-semibold text-gray-800 text-sm">{alt.title}</p>
              <p className="text-green-600 text-xs mt-1">{alt.co2_saving}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
npm run test:run
```

Expected: 10 tests pass (4 ollama + 6 ResultCard), 0 failures.

- [ ] **Step 5: Commit**

```bash
git add src/components/ResultCard.jsx src/components/ResultCard.test.jsx
git commit -m "feat: add ResultCard component with color-coded badge"
```

---

### Task 6: Wire up App.jsx

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/main.jsx` (ensure CSS import)
- Modify: `index.html` (update title)

- [ ] **Step 1: Update `index.html` title**

Open `index.html` and change:
```html
<title>NudgeGreen</title>
```

- [ ] **Step 2: Ensure `src/main.jsx` imports CSS**

The file should look like:
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 3: Replace `src/App.jsx` with the full wired-up version**

```jsx
import { useState } from 'react'
import InputForm from './components/InputForm'
import LoadingState from './components/LoadingState'
import ResultCard from './components/ResultCard'
import { queryOllama } from './utils/ollama'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit(decision) {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const data = await queryOllama(decision)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-green-800 tracking-tight">🌿 NudgeGreen</h1>
          <p className="mt-2 text-gray-500">Find out the environmental impact of your daily decisions</p>
        </div>

        {/* Input */}
        <div className="mb-8">
          <InputForm onSubmit={handleSubmit} loading={loading} />
        </div>

        {/* States */}
        {loading && <LoadingState />}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {result && !loading && <ResultCard result={result} />}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Delete unused Vite boilerplate files**

```bash
rm -f src/assets/react.svg public/vite.svg src/App.css
```

- [ ] **Step 5: Run all tests to make sure nothing is broken**

```bash
npm run test:run
```

Expected: 10 tests pass.

- [ ] **Step 6: Run the dev server and test the full flow manually**

```bash
npm run dev
```

Open http://localhost:5173. Make sure Ollama is running (`ollama serve` in another terminal). Type a decision like "ordering Zomato delivery" and submit. Verify:
- Spinner appears while waiting
- Result card appears with split panel layout
- Badge is color-coded (red for High, yellow for Medium, green for Low)
- Two alternative cards shown on the right

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/main.jsx index.html
git commit -m "feat: wire up App with state machine and full UI layout"
```

---

### Task 7: Final cleanup and build verification

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Create `.gitignore`**

```
node_modules/
dist/
.env
.env.local
.superpowers/
```

- [ ] **Step 2: Verify production build works**

```bash
npm run build
```

Expected: Build completes with no errors. `dist/` folder created.

- [ ] **Step 3: Run full test suite one final time**

```bash
npm run test:run
```

Expected: 10 tests pass, 0 failures.

- [ ] **Step 4: Final commit**

```bash
git add .gitignore
git commit -m "chore: add gitignore and verify production build"
```
