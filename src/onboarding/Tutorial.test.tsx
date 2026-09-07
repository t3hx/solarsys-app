import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Tutorial } from '@/onboarding/Tutorial'
import { TUTORIAL_STORAGE_KEY } from '@/onboarding/useTutorial'

describe('Tutorial', () => {
  beforeEach(() => localStorage.clear())

  it('starts on the welcome step with nine dots and no previous button', () => {
    render(<Tutorial onComplete={() => undefined} />)
    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /go to step/i })).toHaveLength(9)
    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument()
  })

  it('navigates with next, previous and the dots', () => {
    render(<Tutorial onComplete={() => undefined} />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByRole('heading', { name: 'Camera Controls' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /previous/i }))
    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /go to step 9/i }))
    expect(screen.getByRole('heading', { name: 'Ready to Explore' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /explore/i })).toBeInTheDocument()
  })

  it('skipping or finishing completes the tutorial and persists it', () => {
    const onComplete = vi.fn()
    const { unmount } = render(<Tutorial onComplete={onComplete} />)
    fireEvent.click(screen.getByRole('button', { name: /skip/i }))
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(TUTORIAL_STORAGE_KEY)).toBe('1')
    unmount()

    localStorage.clear()
    render(<Tutorial onComplete={onComplete} />)
    fireEvent.click(screen.getByRole('button', { name: /go to step 9/i }))
    fireEvent.click(screen.getByRole('button', { name: /explore/i }))
    expect(onComplete).toHaveBeenCalledTimes(2)
    expect(localStorage.getItem(TUTORIAL_STORAGE_KEY)).toBe('1')
  })

  it('spotlights the HUD element targeted by the current step', () => {
    render(
      <>
        <button
          type="button"
          data-tutorial-target="menu"
        >
          menu
        </button>
        <Tutorial onComplete={() => undefined} />
      </>,
    )
    expect(screen.queryByTestId('spotlight')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /go to step 4/i }))
    expect(screen.getByTestId('spotlight')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /go to step 5/i }))
    // * La cible « zoom » n'existe pas dans ce test : pas de spotlight
    expect(screen.queryByTestId('spotlight')).not.toBeInTheDocument()
  })
})
