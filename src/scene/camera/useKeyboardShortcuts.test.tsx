import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useKeyboardShortcuts } from '@/scene/camera/useKeyboardShortcuts'
import { useInteractionStore } from '@/store/interaction'

function Shortcuts() {
  useKeyboardShortcuts()
  return <input aria-label="text" />
}

const store = () => useInteractionStore.getState()
const press = (key: string, target: EventTarget = window) =>
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, code: key, bubbles: true, cancelable: true }),
  )

describe('useKeyboardShortcuts', () => {
  beforeEach(() => store().reset())

  it('Space exits focus by deselecting the followed body', () => {
    render(<Shortcuts />)
    store().select('earth')
    store().setFollowing(true)
    press(' ')
    expect(store().selectedId).toBeNull()
    expect(store().isFollowing).toBe(false)
  })

  it('Space leaves the tactical view', () => {
    render(<Shortcuts />)
    store().setTactical(true)
    press(' ')
    expect(store().isTactical).toBe(false)
  })

  it('Space does nothing while the focus animation is still running', () => {
    render(<Shortcuts />)
    store().select('earth')
    press(' ')
    expect(store().selectedId).toBe('earth')
  })

  it('Escape clears hover and selection', () => {
    render(<Shortcuts />)
    store().hover('mars')
    press('Escape')
    expect(store().hoveredId).toBeNull()
    store().select('mars')
    press('Escape')
    expect(store().selectedId).toBeNull()
  })

  it('Escape closes the about window', () => {
    render(<Shortcuts />)
    store().setAboutOpen(true)
    press('Escape')
    expect(store().aboutOpen).toBe(false)
  })

  it('ignores keys typed into a text field', () => {
    const { getByLabelText } = render(<Shortcuts />)
    store().select('earth')
    press('Escape', getByLabelText('text'))
    expect(store().selectedId).toBe('earth')
  })

  it('removes its listener on unmount', () => {
    const { unmount } = render(<Shortcuts />)
    unmount()
    store().select('earth')
    press('Escape')
    expect(store().selectedId).toBe('earth')
  })
})
