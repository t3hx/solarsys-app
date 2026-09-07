/**
 * @module scene/debug/OrbitHelpers
 * @description Axes et grille d'une orbite, places dans le groupe « Orbit » deja incline :
 * le plan XZ local est le plan orbital, sans seconde inclinaison (audit B4).
 */
import { disableDepthTest } from '@/scene/debug/helperMaterial'
import { useDebugStore } from '@/store/debug'

const SIZE_FACTOR = 1.5
const GRID_DIVISIONS = 10

export function OrbitHelpers({ bodyId, radius }: { bodyId: string; radius: number }) {
  const axes = useDebugStore((state) => state.orbitAxes[bodyId] ?? false)
  const grid = useDebugStore((state) => state.orbitGrids[bodyId] ?? false)
  const size = radius * SIZE_FACTOR
  return (
    <>
      {axes && (
        <axesHelper
          args={[size]}
          onUpdate={disableDepthTest}
        />
      )}
      {grid && (
        <gridHelper
          args={[size, GRID_DIVISIONS]}
          onUpdate={disableDepthTest}
        />
      )}
    </>
  )
}
