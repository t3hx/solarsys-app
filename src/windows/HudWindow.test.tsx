import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HudWindow } from '@/windows/HudWindow'

vi.mock('gsap', async () => (await import('@/test/mocks/gsap')).gsapMock)

describe('HudWindow', () => {
  it('renders a labelled dialog with its content when open', () => {
    render(
      <HudWindow
        open
        title="Earth"
        onClose={() => undefined}
      >
        <p>Body</p>
      </HudWindow>,
    )
    const dialog = screen.getByRole('dialog', { name: 'Earth' })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    render(
      <HudWindow
        open={false}
        title="Earth"
        onClose={() => undefined}
      >
        <p>Body</p>
      </HudWindow>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes from the close button and from a click on the backdrop, not from the content', () => {
    const onClose = vi.fn()
    render(
      <HudWindow
        open
        title="Earth"
        onClose={onClose}
      >
        <p>Body</p>
      </HudWindow>,
    )
    fireEvent.click(screen.getByText('Body'))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByTestId('window-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
