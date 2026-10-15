/**
 * @module hud/tactical/TacticalLabelsOverlay
 * @description Etiquettes de la vue tactique : boites a positions FIXES reparties en deux
 * colonnes a gauche et a droite de l'ecran (ordre = distance croissante au Soleil, en
 * alternance), nom en majuscules blanches, bordure et tige dans la couleur tactique du
 * corps. Seules les tiges bougent : une boucle rAF relie le bord de chaque boite a la
 * position ecran du corps lue dans `labelScreenPositions` (ecrite par le traqueur de la
 * scene), via refs, sans etat React. Monte uniquement en vue tactique.
 */
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { colors, tacticalColors } from '@/config/colors'
import type { SolarSystem } from '@/data/model'
import { bodyDisplayName } from '@/i18n'
import styles from '@/hud/tactical/TacticalLabelsOverlay.module.css'
import { useWindowSize } from '@/hud/useWindowSize'
import { labelColumns } from '@/scene/labels/labelColumns'
import { labelScreenPositions } from '@/scene/labels/labelScreenPositions'
import { useInteractionStore } from '@/store/interaction'

export function TacticalLabelsOverlay({ system }: { system: SolarSystem }) {
  const isTactical = useInteractionStore((state) => state.isTactical)
  // * Re-rendu au changement de langue
  useTranslation()
  const { width, height } = useWindowSize()
  // ~ Distance croissante au Soleil : fixe l'ordre de lecture des colonnes
  const bodies = useMemo(
    () =>
      [...system.planets].sort(
        (a, b) => (a.orbit?.semiMajorAxisKm ?? 0) - (b.orbit?.semiMajorAxisKm ?? 0),
      ),
    [system],
  )
  const slots = useMemo(() => labelColumns(bodies.length, width, height), [bodies, width, height])
  const leaderRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!isTactical) return undefined
    let frame = 0
    const update = () => {
      bodies.forEach((body, index) => {
        const leader = leaderRefs.current[index]
        const point = labelScreenPositions.get(body.id)
        if (!leader || !point) return
        const slot = slots[index]
        const dx = point.x - slot.x
        const dy = point.y - slot.y
        leader.style.width = `${Math.hypot(dx, dy)}px`
        leader.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`
      })
      frame = requestAnimationFrame(update)
    }
    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [isTactical, bodies, slots])

  if (!isTactical) return null

  return (
    <div
      className={styles.overlay}
      aria-hidden="true"
    >
      {bodies.map((body, index) => {
        const slot = slots[index]
        const color = tacticalColors[body.id] ?? colors.white
        return (
          <div key={body.id}>
            <div
              ref={(element) => {
                leaderRefs.current[index] = element
              }}
              className={styles.leader}
              style={{ left: slot.x, top: slot.y, background: color }}
            />
            <div
              className={`${styles.box} ${slot.side === 'left' ? styles.boxLeft : styles.boxRight}`}
              style={{ left: slot.x, top: slot.y, borderColor: color }}
            >
              {bodyDisplayName(body.id, body.name).toUpperCase()}
            </div>
          </div>
        )
      })}
    </div>
  )
}
