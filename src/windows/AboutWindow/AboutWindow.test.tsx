import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useInteractionStore } from '@/store/interaction'
import { AboutWindow } from '@/windows/AboutWindow/AboutWindow'

vi.mock('gsap', async () => (await import('@/test/mocks/gsap')).gsapMock)

const interaction = () => useInteractionStore.getState()

describe('AboutWindow', () => {
  beforeEach(() => interaction().reset())

  it('opens from the store with the author, the sources and the stack', () => {
    render(<AboutWindow />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    act(() => interaction().setAboutOpen(true))
    const dialog = screen.getByRole('dialog', { name: 'About' })
    expect(within(dialog).getByText('Thibault D.')).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: /nasa/i })).toHaveAttribute('target', '_blank')
    const stack = within(dialog)
      .getAllByTestId('tech-item')
      .map((item) => item.textContent)
    expect(stack).toEqual([
      'React',
      'React Three Fiber',
      'Three.js',
      'TypeScript',
      'Tailwind CSS',
      'GSAP',
      'Docker',
    ])
  })

  it('closes from the close button', () => {
    render(<AboutWindow />)
    act(() => interaction().setAboutOpen(true))
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(interaction().aboutOpen).toBe(false)
  })
})
