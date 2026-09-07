/**
 * @module hud/drawer/DrawerMenu
 * @description Tiroir de menu en HTML (plus de foreignObject, audit A12) : vue accueil
 * (Options, A propos), vue options (bascules globales, accordeon des corps), cartouche
 * nom + version, bouton fermer. Le parent le remonte a chaque ouverture (`key`), ce qui
 * ramene la vue a l'accueil.
 */
import { Icon } from '@iconify/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { allBodies } from '@/data/lookup'
import type { SolarSystem } from '@/data/model'
import { BodiesAccordion } from '@/hud/drawer/BodiesAccordion'
import styles from '@/hud/drawer/DrawerMenu.module.css'
import type { Box } from '@/hud/hudLayout'
import { useDebugStore } from '@/store/debug'
import { useInteractionStore } from '@/store/interaction'

const PRODUCT_NAME = 'SOLARSYS'

export interface DrawerMenuProps {
  system: SolarSystem
  box: Box
  open: boolean
  onClose: () => void
}

type DrawerView = 'home' | 'options'

export function DrawerMenu({ system, box, open, onClose }: DrawerMenuProps) {
  const { t } = useTranslation()
  const [view, setView] = useState<DrawerView>('home')

  if (!open) return null

  return (
    <aside
      className={styles.drawer}
      style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
      aria-label={t('hud.menu')}
    >
      <div className={styles.content}>
        <div className={styles.scrollable}>
          {view === 'home' ? (
            <HomeView
              onOptions={() => setView('options')}
              onAbout={() => {
                useInteractionStore.getState().setAboutOpen(true)
                onClose()
              }}
            />
          ) : (
            <OptionsView
              system={system}
              onBack={() => setView('home')}
            />
          )}
        </div>
        <Cartouche />
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
        >
          {t('drawer.close')}
        </button>
      </div>
    </aside>
  )
}

function HomeView({ onOptions, onAbout }: { onOptions: () => void; onAbout: () => void }) {
  const { t } = useTranslation()
  return (
    <>
      <div className={styles.homeTitle}>
        <svg
          className={styles.homeTitleSvg}
          viewBox="0 0 400 48"
          aria-hidden="true"
        >
          <line
            x1={0}
            y1={24}
            x2={16}
            y2={24}
            stroke="var(--color-hud)"
            strokeWidth={1}
            opacity={0.4}
          />
          <polygon
            points="16,20 22,24 16,28"
            fill="var(--color-hud)"
            opacity={0.5}
          />
          <text
            x={30}
            y={32}
            className={styles.homeTitleText}
            fill="white"
          >
            {PRODUCT_NAME}
          </text>
          <line
            x1={240}
            y1={24}
            x2={400}
            y2={24}
            stroke="var(--color-hud)"
            strokeWidth={0.5}
            opacity={0.2}
          />
        </svg>
      </div>
      <nav className={styles.navLinks}>
        <button
          type="button"
          className={styles.navLink}
          onClick={onOptions}
        >
          <Icon
            icon="solar:settings-minimalistic-broken"
            className={styles.navIcon}
          />
          <span>{t('drawer.options')}</span>
          <Icon
            icon="solar:arrow-right-broken"
            className={styles.navArrow}
          />
        </button>
        <button
          type="button"
          className={styles.navLink}
          onClick={onAbout}
        >
          <Icon
            icon="solar:info-circle-broken"
            className={styles.navIcon}
          />
          <span>{t('drawer.about')}</span>
          <Icon
            icon="solar:arrow-right-broken"
            className={styles.navArrow}
          />
        </button>
      </nav>
    </>
  )
}

function OptionsView({ system, onBack }: { system: SolarSystem; onBack: () => void }) {
  const { t } = useTranslation()
  const bodyIds = allBodies(system).map((body) => body.id)
  const orbitIds = allBodies(system)
    .filter((body) => body.orbit)
    .map((body) => body.id)
  const globalWireframe = useDebugStore((state) => state.globalWireframe)
  const globalAxes = useDebugStore((state) => state.globalAxes)
  const globalGrids = useDebugStore((state) => state.globalGrids)
  const debug = useDebugStore.getState()

  const toggles = [
    {
      label: t('drawer.toggleWireframe'),
      on: globalWireframe,
      toggle: () => debug.toggleGlobalWireframe(bodyIds),
    },
    {
      label: t('drawer.toggleAxes'),
      on: globalAxes,
      toggle: () => debug.toggleGlobalAxes(bodyIds, orbitIds),
    },
    {
      label: t('drawer.toggleGrids'),
      on: globalGrids,
      toggle: () => debug.toggleGlobalGrids(bodyIds, orbitIds),
    },
  ]

  return (
    <>
      <h2 className={styles.optionsTitle}>{t('drawer.optionsTitle')}</h2>
      <button
        type="button"
        className={styles.backButton}
        onClick={onBack}
      >
        <Icon icon="solar:arrow-left-broken" />
        <span>{t('drawer.back')}</span>
      </button>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('drawer.globalToggles')}</h3>
        <div className={styles.toggles}>
          {toggles.map(({ label, on, toggle }) => (
            <button
              key={label}
              type="button"
              className={styles.debugButton}
              onClick={toggle}
            >
              <span>{label}</span>
              <span
                className={styles.debugState}
                data-on={on}
              >
                {on ? t('drawer.on') : t('drawer.off')}
              </span>
            </button>
          ))}
        </div>
      </section>

      <hr className={styles.separator} />

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('drawer.celestialBodies')}</h3>
        <BodiesAccordion system={system} />
      </section>
    </>
  )
}

function Cartouche() {
  return (
    <div className={styles.cartouche}>
      <svg
        className={styles.cartoucheSvg}
        viewBox="0 0 320 28"
        aria-hidden="true"
      >
        <rect
          x={0.5}
          y={0.5}
          width={319}
          height={27}
          rx={3}
          fill="none"
          stroke="var(--color-hud)"
          strokeWidth={0.5}
          opacity={0.3}
        />
        <line
          x1={8}
          y1={14}
          x2={18}
          y2={14}
          stroke="var(--color-hud)"
          strokeWidth={1}
          opacity={0.5}
        />
        <text
          x={24}
          y={18}
          className={styles.cartoucheName}
          fill="var(--color-hud)"
        >
          {PRODUCT_NAME}
        </text>
        <line
          x1={218}
          y1={6}
          x2={218}
          y2={22}
          stroke="var(--color-hud)"
          strokeWidth={0.5}
          opacity={0.3}
        />
        <rect
          x={228}
          y={6}
          width={42}
          height={16}
          rx={3}
          fill="var(--color-hud)"
          opacity={0.15}
        />
        <rect
          x={228}
          y={6}
          width={42}
          height={16}
          rx={3}
          fill="none"
          stroke="var(--color-hud)"
          strokeWidth={0.5}
          opacity={0.4}
        />
        <text
          x={249}
          y={18}
          className={styles.cartoucheVersion}
          fill="var(--color-hud)"
          textAnchor="middle"
        >
          v{__APP_VERSION__}
        </text>
        <line
          x1={280}
          y1={14}
          x2={312}
          y2={14}
          stroke="var(--color-hud)"
          strokeWidth={0.5}
          opacity={0.3}
        />
      </svg>
    </div>
  )
}
