/**
 * @module scene/effects/outlineTarget
 * @description Quel corps contourner, et dans quelle couleur : la selection prime sur le
 * survol, et rien n'est contoure pendant le suivi camera (le focus suffit comme indicateur).
 */
export type OutlineKind = 'hover' | 'selected'

export interface OutlineTarget {
  id: string
  kind: OutlineKind
}

export interface OutlineInputs {
  hoveredId: string | null
  selectedId: string | null
  isFollowing: boolean
}

export function outlineTarget({
  hoveredId,
  selectedId,
  isFollowing,
}: OutlineInputs): OutlineTarget | null {
  if (isFollowing) return null
  if (selectedId !== null) return { id: selectedId, kind: 'selected' }
  if (hoveredId !== null) return { id: hoveredId, kind: 'hover' }
  return null
}
