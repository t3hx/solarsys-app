import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BodySymbol } from '@/hud/BodySymbol'
import { bodySymbolIds } from '@/hud/bodySymbols'

describe('BodySymbol', () => {
  it('has a glyph for every body of the data set', () => {
    expect([...bodySymbolIds].sort()).toEqual(
      [
        'sun',
        'mercury',
        'venus',
        'earth',
        'moon',
        'mars',
        'jupiter',
        'saturn',
        'uranus',
        'neptune',
        'pluto',
        'ceres',
        'haumea',
        'makemake',
        'eris',
      ].sort(),
    )
  })

  it('renders the glyph of a known body', () => {
    render(<BodySymbol bodyId="saturn" />)
    const symbol = screen.getByTestId('body-symbol')
    expect(symbol).toHaveAttribute('data-symbol', 'saturn')
    expect(symbol.querySelector('svg path')).not.toBeNull()
  })

  it('renders nothing for an unknown body', () => {
    const { container } = render(<BodySymbol bodyId="vulcan" />)
    expect(container).toBeEmptyDOMElement()
  })
})
