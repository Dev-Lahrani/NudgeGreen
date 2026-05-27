import { findMatch, classifyDecision, scoreAlternatives } from '../data/carbonData'

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

const CATEGORY_NUDGE = {
  transport: 'Focus nudges on public transit, carpooling, or active travel alternatives.',
  food:      'Focus nudges on plant-based options, reducing delivery frequency, and local sourcing.',
  shopping:  'Focus nudges on second-hand options, slower delivery, and buying less.',
  energy:    'Focus nudges on reducing usage duration, switching to renewables, or efficiency habits.',
}

function buildSystemPrompt(match, category, city) {
  let prompt = BASE_SYSTEM_PROMPT

  if (city) {
    prompt += `\n\nUSER CITY: ${city.name}, India. Transit context: ${city.transit}. Mention ${city.name}-specific greener alternatives where relevant (e.g. local trains, metro lines available in ${city.name}).`
  }

  if (category && CATEGORY_NUDGE[category]) {
    prompt += `\n\nCATEGORY: ${category}. ${CATEGORY_NUDGE[category]}`
  }

  if (match) {
    // Apply city multiplier to transport decisions
    const co2 = (category === 'transport' && city)
      ? parseFloat((match.co2_kg * city.multiplier).toFixed(2))
      : match.co2_kg
    prompt += `\n\nVERIFIED DATA: This activity has been measured at ${co2} kg CO₂ in ${city?.name ?? 'India'} (matched entry: "${match.label}"${city && category === 'transport' ? `, city multiplier ${city.multiplier}x applied` : ''}). Use exactly "~${co2} kg CO₂" as the co2_estimate value. Base your impact_level and impact_reason on this verified figure.`
  }

  return prompt
}

export async function queryOllama(userDecision, city = null) {
  const match = findMatch(userDecision)
  const category = match?.category ?? classifyDecision(userDecision)
  const systemPrompt = buildSystemPrompt(match, category, city)

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

  return {
    ...parsed,
    alternatives: scoreAlternatives(parsed.alternatives),
    _matched: match ?? null,
    _category: category ?? null,
  }
}
