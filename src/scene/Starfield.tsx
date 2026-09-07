/**
 * @module scene/Starfield
 * @description Champ d'etoiles procedural (voir `starfieldPositions`).
 */
import { useMemo } from 'react'
import { generateStarPositions } from '@/scene/starfieldPositions'

export interface StarfieldProps {
  count: number
  size: number
  minDistance: number
  maxDistance: number
  color?: string
}

export function Starfield({
  count,
  size,
  minDistance,
  maxDistance,
  color = 'white',
}: StarfieldProps) {
  const positions = useMemo(
    () => generateStarPositions(count, minDistance, maxDistance),
    [count, minDistance, maxDistance],
  )
  return (
    <points name="starfield">
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation
        transparent
      />
    </points>
  )
}
