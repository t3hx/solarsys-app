import { beforeEach, describe, expect, it } from 'vitest'
import { useInteractionStore } from '@/store/interaction'

const store = () => useInteractionStore.getState()

describe('interaction store', () => {
  beforeEach(() => store().reset())

  it('starts with nothing hovered or selected, not following, not tactical', () => {
    expect(store()).toMatchObject({
      hoveredId: null,
      selectedId: null,
      isFollowing: false,
      isTactical: false,
    })
  })

  it('tracks hover while nothing is selected', () => {
    store().hover('mars')
    expect(store().hoveredId).toBe('mars')
    store().hover(null)
    expect(store().hoveredId).toBeNull()
  })

  it('ignores hover while a body is selected and clears any existing hover', () => {
    store().hover('mars')
    store().select('earth')
    expect(store().hoveredId).toBeNull()
    store().hover('venus')
    expect(store().hoveredId).toBeNull()
  })

  it('selecting a body stops following and leaves the tactical view', () => {
    store().setFollowing(true)
    store().setTactical(true)
    store().select('jupiter')
    expect(store()).toMatchObject({ selectedId: 'jupiter', isFollowing: false, isTactical: false })
  })

  it('deselecting stops following', () => {
    store().select('jupiter')
    store().setFollowing(true)
    store().select(null)
    expect(store()).toMatchObject({ selectedId: null, isFollowing: false })
  })

  it('only follows when a body is selected', () => {
    store().setFollowing(true)
    expect(store().isFollowing).toBe(false)
    store().select('moon')
    store().setFollowing(true)
    expect(store().isFollowing).toBe(true)
  })

  it('toggles the tactical view and suspends following while in it', () => {
    store().select('earth')
    store().setFollowing(true)
    store().toggleTactical()
    expect(store().isTactical).toBe(true)
    expect(store().isFollowing).toBe(false)
    store().toggleTactical()
    expect(store().isTactical).toBe(false)
  })

  it('opens the info window only while a body is selected, and closes it on deselection', () => {
    store().setInfoOpen(true)
    expect(store().infoOpen).toBe(false)
    store().select('earth')
    store().setInfoOpen(true)
    expect(store().infoOpen).toBe(true)
    store().select(null)
    expect(store().infoOpen).toBe(false)
  })

  it('the about window and the info window are mutually exclusive', () => {
    store().select('earth')
    store().setInfoOpen(true)
    store().setAboutOpen(true)
    expect(store().aboutOpen).toBe(true)
    expect(store().infoOpen).toBe(false)
    store().setInfoOpen(true)
    expect(store().aboutOpen).toBe(false)
  })

  it('selecting a body closes the about window', () => {
    store().setAboutOpen(true)
    store().select('mars')
    expect(store().aboutOpen).toBe(false)
  })
})
