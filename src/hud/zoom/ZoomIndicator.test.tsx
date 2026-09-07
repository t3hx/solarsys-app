import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ZoomIndicator } from '@/hud/zoom/ZoomIndicator'

describe('ZoomIndicator', () => {
  it('shows as many bars as the zoom level', () => {
    render(
      <ZoomIndicator
        level={6}
        mode="normal"
      />,
    )
    const bars = screen.getAllByTestId('zoom-bar')
    expect(bars).toHaveLength(10)
    expect(bars.filter((bar) => bar.getAttribute('visibility') === 'visible')).toHaveLength(6)
    expect(screen.queryByText('MAX')).not.toBeInTheDocument()
  })

  it('blinks MAX at the closest level', () => {
    render(
      <ZoomIndicator
        level={10}
        mode="max"
      />,
    )
    expect(screen.getByText('MAX')).toBeInTheDocument()
  })

  it('replaces the bars with OUT OF RANGE beyond the last threshold', () => {
    render(
      <ZoomIndicator
        level={0}
        mode="outOfRange"
      />,
    )
    expect(screen.getByText('OUT OF RANGE')).toBeInTheDocument()
    expect(screen.queryAllByTestId('zoom-bar')).toHaveLength(0)
  })

  it('shows VOID near the maximum camera distance', () => {
    render(
      <ZoomIndicator
        level={0}
        mode="void"
      />,
    )
    expect(screen.getByText('VOID')).toBeInTheDocument()
    expect(screen.queryAllByTestId('zoom-bar')).toHaveLength(0)
  })

  it('labels itself', () => {
    render(
      <ZoomIndicator
        level={3}
        mode="normal"
      />,
    )
    expect(screen.getByText('ZOOM LEVEL')).toBeInTheDocument()
  })
})
