/**
 * @module scene/debug/BodyHelpers
 * @description Axes et grille d'un corps, en JSX conditionnel depuis le store de debug.
 * Enfants du mesh (sphere unitaire mise a l'echelle) : la taille 1.5 vaut 1.5 rayon.
 * `depthTest` desactive pour rester visibles a travers le corps.
 */
import { disableDepthTest } from '@/scene/debug/helperMaterial'
import { useDebugStore } from '@/store/debug'

const HELPER_SIZE = 1.5
const GRID_DIVISIONS = 10

export function BodyHelpers({ bodyId }: { bodyId: string }) {
  const axes = useDebugStore((state) => state.bodyAxes[bodyId] ?? false)
  const grid = useDebugStore((state) => state.bodyGrids[bodyId] ?? false)
  return (
    <>
      {axes && (
        <axesHelper
          args={[HELPER_SIZE]}
          onUpdate={disableDepthTest}
        />
      )}
      {grid && (
        <gridHelper
          args={[HELPER_SIZE, GRID_DIVISIONS]}
          onUpdate={disableDepthTest}
        />
      )}
    </>
  )
}
