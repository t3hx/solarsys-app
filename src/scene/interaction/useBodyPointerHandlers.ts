/**
 * @module scene/interaction/useBodyPointerHandlers
 * @description Handlers pointer R3F communs aux corps et aux lignes d'orbite : survol,
 * fin de survol et clic, propagation stoppee pour ne toucher que l'objet le plus proche.
 * Le clic dans le vide est gere par `onPointerMissed` sur le canvas. Un clic qui termine
 * un glissement (rotation de la camera commencee sur un corps) n'est pas une selection :
 * R3F fournit `delta`, la distance en pixels entre l'appui et le relachement.
 */
import type { ThreeEvent } from '@react-three/fiber'
import { useMemo } from 'react'
import { pointerConfig } from '@/config/scene'
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
        if (event.delta > pointerConfig.clickMaxDistancePx) return
        useInteractionStore.getState().select(bodyId)
      },
    }),
    [bodyId],
  )
}
