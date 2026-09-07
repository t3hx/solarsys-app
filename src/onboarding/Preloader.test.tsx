import type * as Drei from '@react-three/drei'
import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Preloader } from '@/onboarding/Preloader'
import { useAppStore } from '@/store/app'

vi.mock('gsap', async () => (await import('@/test/mocks/gsap')).gsapMock)

const progress = vi.hoisted(() => ({ value: { progress: 0, loaded: 0, total: 0, active: true } }))
vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof Drei>()
  return { ...actual, useProgress: () => progress.value }
})

describe('Preloader', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
    progress.value = { progress: 0, loaded: 0, total: 0, active: true }
  })

  it('shows the texture counter and the loading state', () => {
    progress.value = { progress: 50, loaded: 11, total: 22, active: true }
    render(<Preloader onComplete={() => undefined} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('11 / 22 textures')).toBeInTheDocument()
    expect(screen.getByText('LOADING TEXTURES')).toBeInTheDocument()
  })

  it('waits for the scene once every texture is loaded', () => {
    progress.value = { progress: 100, loaded: 22, total: 22, active: false }
    render(<Preloader onComplete={() => undefined} />)
    expect(screen.getByText('PREPARING SCENE')).toBeInTheDocument()
  })

  it('completes after the fade-out once the scene is ready', () => {
    progress.value = { progress: 100, loaded: 22, total: 22, active: false }
    const onComplete = vi.fn()
    render(<Preloader onComplete={onComplete} />)
    expect(onComplete).not.toHaveBeenCalled()
    act(() => useAppStore.getState().setSceneReady(true))
    expect(screen.getByText('READY')).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
