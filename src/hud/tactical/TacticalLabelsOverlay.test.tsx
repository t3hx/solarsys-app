import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { TacticalLabelsOverlay } from '@/hud/tactical/TacticalLabelsOverlay'
import { useInteractionStore } from '@/store/interaction'
import { solarSystemFixture } from '@/test/fixtures/solarSystem'

const store = () => useInteractionStore.getState()

describe('TacticalLabelsOverlay', () => {
  beforeEach(() => store().reset())

  it('renders nothing outside tactical view', () => {
    render(<TacticalLabelsOverlay system={solarSystemFixture} />)
    expect(screen.queryByRole('button', { name: 'EARTH' })).not.toBeInTheDocument()
  })

  it('stays hidden while the tactical camera transition runs', () => {
    store().setTactical(true)
    render(<TacticalLabelsOverlay system={solarSystemFixture} />)
    expect(screen.queryByRole('button', { name: 'EARTH' })).not.toBeInTheDocument()
  })

  it('selects a body when its label is clicked, like an orbit line', () => {
    store().setTactical(true)
    store().setTacticalReady(true)
    render(<TacticalLabelsOverlay system={solarSystemFixture} />)
    fireEvent.click(screen.getByRole('button', { name: 'EARTH' }))
    expect(store().selectedId).toBe('earth')
  })

  it('hovers the body under the pointer and marks its label', () => {
    store().setTactical(true)
    store().setTacticalReady(true)
    render(<TacticalLabelsOverlay system={solarSystemFixture} />)
    const mars = screen.getByRole('button', { name: 'MARS' })
    fireEvent.mouseEnter(mars)
    expect(store().hoveredId).toBe('mars')
    expect(mars).toHaveAttribute('data-hovered', 'true')
    fireEvent.mouseLeave(mars)
    expect(store().hoveredId).toBeNull()
    expect(mars).not.toHaveAttribute('data-hovered')
  })
})
