/**
 * @module hud/corners/CornerSE
 * @description Coin sud-est : bouton triangle de la vue tactique. Une seule source de verite
 * (`isTactical` du store) ; l'icone se transforme par GSAP quand l'etat change (audit B7).
 * La touche Espace est geree par `useKeyboardShortcuts`, pas ici (audit B11).
 */
import { Icon } from '@iconify/react'
import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styles from '@/hud/corners/corners.module.css'
import type { Box } from '@/hud/hudLayout'
import { cornerSizes } from '@/hud/hudLayout'
import { useInteractionStore } from '@/store/interaction'

const MORPH_DURATION = 1.0

export function CornerSE({ box }: { box: Box }) {
  const { t } = useTranslation()
  const isTactical = useInteractionStore((state) => state.isTactical)
  const toggleTactical = useInteractionStore((state) => state.toggleTactical)
  const normalRef = useRef<HTMLDivElement>(null)
  const tacticalRef = useRef<HTMLDivElement>(null)
  const previous = useRef(isTactical)
  const { width, height } = cornerSizes.se
  const scale = box.width / width

  useEffect(() => {
    const normal = normalRef.current
    const tactical = tacticalRef.current
    if (!normal || !tactical) return undefined
    if (previous.current === isTactical) {
      gsap.set(normal, { scale: isTactical ? 0 : 1, opacity: isTactical ? 0 : 1 })
      gsap.set(tactical, { scale: isTactical ? 1 : 0, opacity: isTactical ? 1 : 0 })
      return undefined
    }
    previous.current = isTactical
    const from = isTactical ? normal : tactical
    const to = isTactical ? tactical : normal
    const timeline = gsap
      .timeline()
      .to(from, {
        scale: 0.8,
        opacity: 0,
        rotation: isTactical ? 180 : -180,
        duration: MORPH_DURATION,
        ease: 'power2.in',
      })
      .to(
        to,
        { scale: 1, opacity: 1, rotation: 0, duration: MORPH_DURATION, ease: 'power2.out' },
        MORPH_DURATION,
      )
    return () => {
      timeline.kill()
    }
  }, [isTactical])

  return (
    <div
      className={styles.corner}
      style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
      data-tutorial-target="tactical"
    >
      <svg
        className={styles.corner}
        style={{ left: 0, top: 0, width: '100%', height: '100%' }}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
      >
        <path d="M48 8L8 48" />
        <path
          d="M38 48H48V38"
          strokeOpacity={0.5}
          strokeWidth={3}
          strokeLinecap="square"
        />
      </svg>
      <button
        type="button"
        className={`${styles.button} ${styles.tacticalButton}`}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: box.width,
          height: box.height,
          background: 'none',
          border: 'none',
          padding: 0,
        }}
        aria-label={t('hud.tacticalView')}
        aria-pressed={isTactical}
        onClick={toggleTactical}
      >
        <svg
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible',
          }}
          viewBox={`0 0 ${width} ${height}`}
          aria-hidden="true"
        >
          <path
            className={styles.triangle}
            d="M34.3282 0L-0.1544 34.4189L-0.0728 0L34.3282 0Z"
          />
        </svg>
        <div
          className={styles.iconWrapper}
          style={{ transform: `scale(${scale})` }}
        >
          <div
            ref={normalRef}
            className={styles.iconContainer}
          >
            <Icon icon="solar:black-hole-bold" />
          </div>
          <div
            ref={tacticalRef}
            className={styles.iconContainer}
          >
            <Icon icon="solar:asteroid-linear" />
          </div>
        </div>
      </button>
    </div>
  )
}
