import type * as Drei from '@react-three/drei'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '@/App'
import { TUTORIAL_STORAGE_KEY } from '@/onboarding/useTutorial'
import { useAppStore } from '@/store/app'
import { useInteractionStore } from '@/store/interaction'
import { solarSystemFixture } from '@/test/fixtures/solarSystem'

vi.mock('gsap', async () => (await import('@/test/mocks/gsap')).gsapMock)

// * Pas de WebGL sous jsdom : le canvas est remplace par un marqueur qui declare la scene prete
vi.mock('@/scene/SolarSystemCanvas', () => ({
  SolarSystemCanvas: () => {
    useEffect(() => {
      useAppStore.getState().setSceneReady(true)
      return () => useAppStore.getState().setSceneReady(false)
    }, [])
    return <div data-testid="scene-canvas" />
  },
}))

const progress = vi.hoisted(() => ({
  value: { progress: 100, loaded: 22, total: 22, active: false },
}))
vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof Drei>()
  return { ...actual, useProgress: () => progress.value }
})

const loadSolarSystem = vi.hoisted(() => vi.fn())
vi.mock('@/data/loadSolarSystem', () => ({ loadSolarSystem }))

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    useAppStore.getState().reset()
    useInteractionStore.getState().reset()
    loadSolarSystem.mockResolvedValue(solarSystemFixture)
  })

  it('renders the product name as the page heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/solarsys/i)
  })

  it('shows the preloader, then the tutorial for a first visit, then the scene with its HUD', async () => {
    render(<App />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(await screen.findByTestId('scene-canvas')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Welcome' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /skip/i }))
    expect(screen.queryByRole('heading', { name: 'Welcome' })).not.toBeInTheDocument()
    expect(useAppStore.getState().phase).toBe('scene')
  })

  it('skips the tutorial when it was already seen', async () => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, '1')
    render(<App />)
    expect(await screen.findByTestId('scene-canvas')).toBeInTheDocument()
    await act(async () => undefined)
    expect(useAppStore.getState().phase).toBe('scene')
    expect(screen.queryByRole('heading', { name: 'Welcome' })).not.toBeInTheDocument()
  })

  it('shows an error when the data cannot be loaded', async () => {
    loadSolarSystem.mockRejectedValueOnce(new Error('boom'))
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent(/boom/)
  })
})
