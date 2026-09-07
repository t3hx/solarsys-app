/**
 * @module scene/interaction/useBodyPointerHandlers
 * @description Handlers pointer R3F communs aux corps et aux lignes d'orbite : survol,
 * fin de survol et clic, propagation stoppee pour ne toucher que l'objet le plus proche.
 * Le clic dans le vide est gere par `onPointerMissed` sur le canvas.
 */
import type { ThreeEvent } from '@react-three/fiber'
import { useMemo } from 'react'
import { useInteractionStore } from '@/store/interaction'

export interface BodyPointerHandlers {
  onPointerOver: (event: ThreeEvent<PointerEvent>) => void
  onPointerOut: (event: ThreeEvent<PointerEvent>) => void
  onClick: (event: ThreeEvent<MouseEvent>) => void
}

export function useBodyPointerHandlers(bodyId: string): BodyPointerHandlers {
  return useMemo(
    () => ({
      onPointerOver: (event) => {
        event.stopPropagation()
        useInteractionStore.getState().hover(bodyId)
      },
      onPointerOut: () => {
        const state = useInteractionStore.getState()
        if (state.hoveredId === bodyId) state.hover(null)
      },
      onClick: (event) => {
        event.stopPropagation()
        useInteractionStore.getState().select(bodyId)
      },
    }),
    [bodyId],
  )
}
