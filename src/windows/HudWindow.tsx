/**
 * @module windows/HudWindow
 * @description Fenetre HUD commune (fenetres d'information et « a propos », audit A6) :
 * fond qui ferme au clic exterieur, ouverture par clip-path, contour anime, en-tete avec
 * titre et bouton fermer. Reste montee le temps de l'animation de fermeture.
 */
import { Icon } from '@iconify/react'
import type { ReactNode } from 'react'
import { useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styles from '@/windows/HudWindow.module.css'
import { useAnimatedBorder } from '@/windows/useAnimatedBorder'
import { useDelayedUnmount } from '@/windows/useDelayedUnmount'

const CLOSE_ANIMATION_MS = 500

export interface HudWindowProps {
  open: boolean
  title: string
  onClose: () => void
  /** Centree verticalement (fenetre « a propos ») plutot qu'en haut */
  centered?: boolean
  children: ReactNode
}

export function HudWindow({ open, title, onClose, centered = false, children }: HudWindowProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const windowRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const { mounted, closing } = useDelayedUnmount(open, CLOSE_ANIMATION_MS)
  const paths = useAnimatedBorder(windowRef, svgRef, open)

  if (!mounted) return null

  return (
    <div
      className={[styles.backdrop, centered ? styles.centered : '', closing ? styles.closing : '']
        .filter(Boolean)
        .join(' ')}
      data-testid="window-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={windowRef}
        className={styles.window}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <svg
          ref={svgRef}
          className={styles.border}
          aria-hidden="true"
        >
          {paths.map((d) => (
            <path
              key={d}
              d={d}
            />
          ))}
        </svg>
        <header className={styles.header}>
          <h2
            id={titleId}
            className={styles.title}
          >
            {title}
          </h2>
          <button
            type="button"
            className={styles.close}
            aria-label={t('drawer.close')}
            onClick={onClose}
          >
            <Icon icon="solar:close-circle-broken" />
          </button>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}
