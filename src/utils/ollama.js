import { findMatch } from '../data/carbonData'

const OLLAMA_URL = 'http://localhost:11434/api/chat'
const MODEL = 'llama3.1:8b'

const BASE_SYSTEM_PROMPT = `You are a sustainability expert. When given a daily decision or action, analyze its environmental impact and return a JSON object with exactly this structure:
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

function buildSystemPrompt(match) {
  if (!match) return BASE_SYSTEM_PROMPT
  return `${BASE_SYSTEM_PROMPT}

VERIFIED DATA: This activity has been measured at ${match.co2_kg} kg CO₂ (category: ${match.category}, matched entry: "${match.label}"). Use exactly "~${match.co2_kg} kg CO₂" as the co2_estimate value. Base your impact_level and impact_reason on this verified figure.`
}

export async function queryOllama(userDecision) {
  const match = findMatch(userDecision)
  const systemPrompt = buildSystemPrompt(match)

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
          { role: 'system', content: systemPrompt },
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

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Could not parse model response. Try again.')
  }

  if (
    typeof parsed.impact_level !== 'string' ||
    typeof parsed.impact_reason !== 'string' ||
    typeof parsed.co2_estimate !== 'string' ||
    !Array.isArray(parsed.alternatives) ||
    parsed.alternatives.length < 2
  ) {
    throw new Error('Could not parse model response. Try again.')
  }

  // Attach match metadata so the UI can optionally show data provenance
  return { ...parsed, _matched: match ?? null }
}
