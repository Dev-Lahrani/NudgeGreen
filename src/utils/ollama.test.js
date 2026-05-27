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
