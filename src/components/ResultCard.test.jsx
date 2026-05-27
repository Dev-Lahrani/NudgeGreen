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
