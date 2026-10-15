/**
 * @module scene/camera/useKeyboardShortcuts
 * @description Raccourcis clavier globaux, un seul endroit (audit B11) :
 * - Espace : quitte le focus (deselection) ou la vue tactique ;
 * - Echap : efface survol et selection, ferme la fenetre « a propos ».
 * Ignores quand le focus clavier est dans un champ de saisie.
 */
import { useEffect } from 'react'
import { useInteractionStore } from '@/store/interaction'

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
  )
}

export function handleShortcut(event: KeyboardEvent): void {
  if (isTypingTarget(event.target)) return
  const state = useInteractionStore.getState()

  if (event.key === ' ' || event.code === 'Space') {
    if (state.isTactical) {
      event.preventDefault()
      state.toggleTactical()
    } else if (state.selectedId !== null && state.isFollowing) {
      event.preventDefault()
      state.select(null)
    }
    return
  }

  if (event.key === 'Escape') {
    state.hover(null)
    if (state.selectedId !== null) state.select(null)
    if (state.aboutOpen) state.setAboutOpen(false)
  }
}

export function useKeyboardShortcuts(): void {
  useEffect(() => {
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])
}
