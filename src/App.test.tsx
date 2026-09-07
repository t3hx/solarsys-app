import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from '@/App'
import { solarSystemFixture } from '@/test/fixtures/solarSystem'

// * Pas de WebGL sous jsdom : le canvas est remplace par un marqueur
vi.mock('@/scene/SolarSystemCanvas', () => ({
  SolarSystemCanvas: () => <div data-testid="scene-canvas" />,
}))

const loadSolarSystem = vi.hoisted(() => vi.fn())
vi.mock('@/data/loadSolarSystem', () => ({ loadSolarSystem }))

describe('App', () => {
  it('renders the product name as the page heading', async () => {
    loadSolarSystem.mockResolvedValueOnce(solarSystemFixture)
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/solarsys/i)
  })

  it('mounts the scene once the data is loaded', async () => {
    loadSolarSystem.mockResolvedValueOnce(solarSystemFixture)
    render(<App />)
    expect(await screen.findByTestId('scene-canvas')).toBeInTheDocument()
  })

  it('shows an error when the data cannot be loaded', async () => {
    loadSolarSystem.mockRejectedValueOnce(new Error('boom'))
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent(/boom/)
  })
})
