/**
 * @module hud/tactical/TacticalLabelsOverlay
 * @description Etiquettes de la vue tactique : boites a positions FIXES en deux colonnes
 * (moitie proche du Soleil a gauche de haut en bas, moitie lointaine a droite de bas en
 * haut), nom en majuscules blanches, bordure, tige et reticule anime dans la couleur
 * tactique du corps. Les boites sont cliquables et survolables comme les lignes d'orbite
 * (selection / survol du store). Seuls la tige et le reticule bougent : une boucle rAF les
 * cale sur la position ecran du corps lue dans `labelScreenPositions` (ecrite par le
 * traqueur de la scene), via refs, sans etat React. Monte uniquement en vue tactique.
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
  const hoveredId = useInteractionStore((state) => state.hoveredId)
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
  const reticleRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!isTactical) return undefined
    let frame = 0
    const update = () => {
      bodies.forEach((body, index) => {
        const leader = leaderRefs.current[index]
        const reticle = reticleRefs.current[index]
        const point = labelScreenPositions.get(body.id)
        if (!leader || !reticle || !point) return
        const slot = slots[index]
        const dx = point.x - slot.x
        const dy = point.y - slot.y
        leader.style.width = `${Math.hypot(dx, dy)}px`
        leader.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`
        reticle.style.transform = `translate(${point.x}px, ${point.y}px)`
      })
      frame = requestAnimationFrame(update)
    }
    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [isTactical, bodies, slots])

  if (!isTactical) return null

  return (
    <div className={styles.overlay}>
      {bodies.map((body, index) => {
        const slot = slots[index]
        const color = tacticalColors[body.id] ?? colors.white
        const active = hoveredId === body.id
        const dimmed = hoveredId !== null && !active
        return (
          <div
            key={body.id}
            className={`${styles.label} ${active ? styles.labelActive : ''} ${dimmed ? styles.labelDimmed : ''}`}
            style={{ color }}
          >
            <div
              ref={(element) => {
                leaderRefs.current[index] = element
              }}
              className={styles.leader}
              style={{ left: slot.x, top: slot.y, background: color }}
              aria-hidden="true"
            />
            <div
              ref={(element) => {
                reticleRefs.current[index] = element
              }}
              className={styles.reticleAnchor}
              aria-hidden="true"
            >
              <div className={styles.reticle} />
              <div className={styles.reticleDot} />
            </div>
            <button
              type="button"
              className={`${styles.box} ${slot.side === 'left' ? styles.boxLeft : styles.boxRight}`}
              style={{ left: slot.x, top: slot.y, borderColor: color }}
              data-hovered={active || undefined}
              onClick={() => useInteractionStore.getState().select(body.id)}
              onMouseEnter={() => useInteractionStore.getState().hover(body.id)}
              onMouseLeave={() => useInteractionStore.getState().hover(null)}
            >
              {bodyDisplayName(body.id, body.name).toUpperCase()}
            </button>
          </div>
        )
      })}
    </div>
  )
}
