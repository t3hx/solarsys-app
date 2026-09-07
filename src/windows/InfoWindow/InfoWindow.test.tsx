import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useInteractionStore } from '@/store/interaction'
import { solarSystemFixture } from '@/test/fixtures/solarSystem'
import { InfoWindow } from '@/windows/InfoWindow/InfoWindow'

vi.mock('gsap', async () => (await import('@/test/mocks/gsap')).gsapMock)

const interaction = () => useInteractionStore.getState()

describe('InfoWindow', () => {
  beforeEach(() => interaction().reset())

  it('stays hidden until the info window is opened for a selected body', () => {
    render(<InfoWindow system={solarSystemFixture} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    act(() => interaction().select('earth'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    act(() => interaction().setInfoOpen(true))
    expect(screen.getByRole('dialog', { name: 'Earth' })).toBeInTheDocument()
  })

  it('shows the metrics grid and the rendered markdown description', () => {
    render(<InfoWindow system={solarSystemFixture} />)
    act(() => {
      interaction().select('jupiter')
      interaction().setInfoOpen(true)
    })
    const dialog = screen.getByRole('dialog', { name: 'Jupiter' })
    expect(within(dialog).getByText('Radius')).toBeInTheDocument()
    expect(within(dialog).getByText('11.86 years')).toBeInTheDocument()
    const description = within(dialog).getByTestId('body-description')
    expect(description.querySelector('strong')).not.toBeNull()
    expect(description.querySelector('blockquote')).not.toBeNull()
    expect(description).toHaveTextContent(/gravity factory/)
  })

  it('lists the facts in the second tab', () => {
    render(<InfoWindow system={solarSystemFixture} />)
    act(() => {
      interaction().select('mars')
      interaction().setInfoOpen(true)
    })
    fireEvent.mouseDown(screen.getByRole('tab', { name: /fun facts/i }))
    const facts = screen.getAllByTestId('fact-item')
    expect(facts).toHaveLength(3)
    expect(facts[0]).toHaveTextContent(/Ingenuity/)
  })

  it('closes and deselects from the close button', () => {
    render(<InfoWindow system={solarSystemFixture} />)
    act(() => {
      interaction().select('venus')
      interaction().setInfoOpen(true)
    })
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(interaction().infoOpen).toBe(false)
    expect(interaction().selectedId).toBeNull()
  })
})
