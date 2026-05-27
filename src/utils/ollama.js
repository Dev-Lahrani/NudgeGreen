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
