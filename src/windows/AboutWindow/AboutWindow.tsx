/**
 * @module windows/AboutWindow/AboutWindow
 * @description Fenetre « a propos » : auteur, sources scientifiques, technologies (balayage
 * radar GSAP qui illumine chaque logo tour a tour).
 */
import { Icon } from '@iconify/react'
import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useInteractionStore } from '@/store/interaction'
import styles from '@/windows/AboutWindow/AboutWindow.module.css'
import { HudWindow } from '@/windows/HudWindow'

const AUTHOR = { name: 'Thibault D.', alias: 'aka T3hx' }

const SOURCES = [
  {
    name: 'NASA Science',
    icon: 'simple-icons:nasa',
    url: 'https://science.nasa.gov/solar-system/',
  },
  {
    name: 'Wikipedia',
    icon: 'simple-icons:wikipedia',
    url: 'https://fr.wikipedia.org/wiki/Syst%C3%A8me_solaire',
  },
  {
    name: 'Solar System Scope',
    icon: 'simple-icons:theplanetarysociety',
    url: 'https://www.solarsystemscope.com/',
  },
]

const STACK = [
  { name: 'React', icon: 'logos:react' },
  { name: 'React Three Fiber', icon: 'logos:threejs', invert: true },
  { name: 'Three.js', icon: 'logos:threejs', invert: true },
  { name: 'TypeScript', icon: 'logos:typescript-icon' },
  { name: 'Tailwind CSS', icon: 'logos:tailwindcss-icon' },
  { name: 'GSAP', icon: 'logos:greensock-icon' },
  { name: 'Docker', icon: 'logos:docker-icon' },
]

const SWEEP_DURATION = 2.5
const PAUSE = 1
const SCAN_START_DELAY_MS = 600

function useScanAnimation(
  gridRef: React.RefObject<HTMLDivElement | null>,
  lineRef: React.RefObject<HTMLDivElement | null>,
  open: boolean,
) {
  useEffect(() => {
    if (!open) return undefined
    let timeline: gsap.core.Timeline | null = null
    const timeout = window.setTimeout(() => {
      const grid = gridRef.current
      const line = lineRef.current
      if (!grid || !line) return
      const items = Array.from(grid.querySelectorAll('[data-tech-item]'))
      if (items.length === 0) return

      gsap.set(items, { opacity: 0.35, scale: 0.95 })
      gsap.set(line, { opacity: 1 })
      timeline = gsap.timeline({ repeat: -1 })

      const pulse = (item: Element, at: number) => {
        timeline!
          .to(
            item,
            {
              opacity: 1,
              scale: 1,
              boxShadow: '0 0 20px rgba(0, 255, 127, 0.3), inset 0 0 12px rgba(0, 255, 127, 0.05)',
              duration: 0.3,
              ease: 'power2.out',
            },
            at,
          )
          .to(
            item,
            {
              opacity: 0.35,
              scale: 0.95,
              boxShadow: '0 0 0px rgba(0, 255, 127, 0), inset 0 0 0px rgba(0, 255, 127, 0)',
              duration: 0.8,
              ease: 'power1.in',
            },
            at + 0.4,
          )
      }

      timeline.fromTo(
        line,
        { top: '-12px' },
        { top: 'calc(100% + 12px)', duration: SWEEP_DURATION, ease: 'power1.inOut' },
      )
      items.forEach((item, i) => pulse(item, (i / items.length) * SWEEP_DURATION))
      timeline.to({}, { duration: PAUSE })
      const upStart = SWEEP_DURATION + PAUSE
      timeline.fromTo(
        line,
        { top: 'calc(100% + 12px)' },
        { top: '-12px', duration: SWEEP_DURATION, ease: 'power1.inOut' },
        upStart,
      )
      ;[...items]
        .reverse()
        .forEach((item, i) => pulse(item, upStart + (i / items.length) * SWEEP_DURATION))
      timeline.to({}, { duration: PAUSE })
    }, SCAN_START_DELAY_MS)
    return () => {
      window.clearTimeout(timeout)
      timeline?.kill()
    }
  }, [open, gridRef, lineRef])
}

export function AboutWindow() {
  const { t } = useTranslation()
  const open = useInteractionStore((state) => state.aboutOpen)
  const gridRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  useScanAnimation(gridRef, lineRef, open)

  return (
    <HudWindow
      open={open}
      title={t('about.title')}
      onClose={() => useInteractionStore.getState().setAboutOpen(false)}
      centered
    >
      <div className={styles.content}>
        <section className={styles.section}>
          <span className={styles.label}>{t('about.createdBy')}</span>
          <span className={styles.author}>{AUTHOR.name}</span>
          <span className={styles.alias}>{AUTHOR.alias}</span>
        </section>

        <div className={styles.divider} />

        <section className={styles.section}>
          <span className={styles.label}>{t('about.dataSources')}</span>
          <div className={styles.sources}>
            {SOURCES.map((source) => (
              <a
                key={source.name}
                className={styles.source}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon
                  icon={source.icon}
                  className={styles.sourceIcon}
                />
                <span>{source.name}</span>
              </a>
            ))}
          </div>
          <span className={styles.thanks}>{t('about.dataSourcesThanks')}</span>
        </section>

        <div className={styles.divider} />

        <section className={styles.section}>
          <span className={styles.label}>{t('about.builtWith')}</span>
          <div
            ref={gridRef}
            className={styles.techGrid}
          >
            {STACK.map((tech) => (
              <div
                key={tech.name}
                className={styles.techItem}
                data-tech-item
                data-testid="tech-item"
              >
                <Icon
                  icon={tech.icon}
                  className={
                    tech.invert ? `${styles.techIcon} ${styles.techIconInvert}` : styles.techIcon
                  }
                />
                <span className={styles.techName}>{tech.name}</span>
              </div>
            ))}
            <div
              ref={lineRef}
              className={styles.scanLine}
            />
          </div>
        </section>
      </div>
    </HudWindow>
  )
}
