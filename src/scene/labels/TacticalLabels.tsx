/**
 * @module scene/labels/TacticalLabels
 * @description Etiquettes de la vue tactique : pour chaque corps heliocentrique, une tige
 * dans la couleur tactique part du corps vers l'exterieur (a l'oppose du Soleil, au centre
 * de l'ecran en vue de dessus) et porte une boite avec le nom en majuscules blanches.
 * Montees uniquement en vue tactique. Le suivi se fait par frame sans etat React :
 * position du groupe copiee du mesh (registre), direction ecrite en style via refs.
 */
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Group } from 'three'
import { Vector3 } from 'three'
import { colors, tacticalColors } from '@/config/colors'
import type { Body, SolarSystem } from '@/data/model'
import { bodyDisplayName } from '@/i18n'
import { labelPlacement, leaderAngleOffset, leaderLength } from '@/scene/labels/labelPlacement'
import styles from '@/scene/labels/TacticalLabels.module.css'
import { useRegistry } from '@/scene/registry'
import { useInteractionStore } from '@/store/interaction'

export function TacticalLabels({ system }: { system: SolarSystem }) {
  const isTactical = useInteractionStore((state) => state.isTactical)
  // ~ Ordre par distance au Soleil : etage la longueur des tiges du groupe interieur
  const distanceOrder = useMemo(
    () =>
      [...system.planets]
        .sort((a, b) => (a.orbit?.semiMajorAxisKm ?? 0) - (b.orbit?.semiMajorAxisKm ?? 0))
        .map((planet) => planet.id),
    [system],
  )
  if (!isTactical) return null
  return (
    <>
      {system.planets.map((planet) => (
        <TacticalLabel
          key={planet.id}
          body={planet}
          length={leaderLength(distanceOrder.indexOf(planet.id))}
          angleOffset={leaderAngleOffset(distanceOrder.indexOf(planet.id))}
        />
      ))}
    </>
  )
}

const projected = new Vector3()

function TacticalLabel({
  body,
  length,
  angleOffset,
}: {
  body: Body
  length: number
  angleOffset: number
}) {
  // * Re-rendu au changement de langue
  useTranslation()
  const registry = useRegistry()
  const groupRef = useRef<Group>(null)
  const leaderRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const color = tacticalColors[body.id] ?? colors.white

  useFrame(({ camera }) => {
    const mesh = registry.getBody(body.id)?.mesh
    const group = groupRef.current
    if (!mesh || !group) return
    mesh.getWorldPosition(group.position)
    projected.copy(group.position).project(camera)
    const placement = labelPlacement(projected.x, projected.y, length, angleOffset)
    if (leaderRef.current) {
      leaderRef.current.style.transform = `rotate(${placement.angle}rad)`
    }
    if (boxRef.current) {
      boxRef.current.style.transform = `translate(${placement.dx}px, ${placement.dy}px) translate(${placement.shiftX}, ${placement.shiftY})`
    }
  })

  return (
    <group ref={groupRef}>
      <Html
        center
        zIndexRange={[5, 0]}
        className={styles.anchor}
      >
        <div
          ref={leaderRef}
          className={styles.leader}
          style={{ width: length, background: color }}
        />
        <div
          ref={boxRef}
          className={styles.box}
          style={{ borderColor: color }}
        >
          {bodyDisplayName(body.id, body.name).toUpperCase()}
        </div>
      </Html>
    </group>
  )
}
