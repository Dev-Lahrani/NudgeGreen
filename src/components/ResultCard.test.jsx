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
  it('renders impact level text in gauge', () => {
    render(<ResultCard result={BASE_RESULT} />)
    expect(screen.getByText('HIGH')).toBeInTheDocument()
    expect(screen.getByText('IMPACT')).toBeInTheDocument()
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

  it('uses green arc for Low impact', () => {
    render(<ResultCard result={{ ...BASE_RESULT, impact_level: 'Low' }} />)
    const arc = screen.getByTestId('gauge-arc')
    expect(arc).toHaveAttribute('stroke', '#1D9E75')
    expect(arc).toHaveAttribute('data-impact', 'Low')
  })

  it('uses amber arc for Medium impact', () => {
    render(<ResultCard result={{ ...BASE_RESULT, impact_level: 'Medium' }} />)
    const arc = screen.getByTestId('gauge-arc')
    expect(arc).toHaveAttribute('stroke', '#F59E0B')
    expect(arc).toHaveAttribute('data-impact', 'Medium')
  })

  it('uses red arc for High impact', () => {
    render(<ResultCard result={BASE_RESULT} />)
    const arc = screen.getByTestId('gauge-arc')
    expect(arc).toHaveAttribute('stroke', '#DC2626')
    expect(arc).toHaveAttribute('data-impact', 'High')
  })
})
