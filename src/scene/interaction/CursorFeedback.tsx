/**
 * @module scene/interaction/CursorFeedback
 * @description Curseur main lorsqu'un corps est survole.
 */
import { useCursor } from '@react-three/drei'
import { useInteractionStore } from '@/store/interaction'

export function CursorFeedback() {
  const hovered = useInteractionStore((state) => state.hoveredId !== null)
  useCursor(hovered)
  return null
}
