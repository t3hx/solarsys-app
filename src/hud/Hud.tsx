/**
 * @module hud/Hud
 * @description Superposition HUD : cadre et quatre coins SVG positionnes en pixels depuis
 * `hudLayout` (plus de SVG etire, audit A12), indicateur de zoom, controles du bas (vitesse,
 * langue), interface de focus et tiroir de menu. Toute zone cliquable est un vrai bouton.
 */
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SolarSystem } from '@/data/model'
import { CornerNE } from '@/hud/corners/CornerNE'
import { CornerNW } from '@/hud/corners/CornerNW'
import { CornerSE } from '@/hud/corners/CornerSE'
import { CornerSW } from '@/hud/corners/CornerSW'
import { LangSwitcher } from '@/hud/controls/LangSwitcher'
import { TimeScaleControl } from '@/hud/controls/TimeScaleControl'
import { DrawerMenu } from '@/hud/drawer/DrawerMenu'
import { FocusUi } from '@/hud/focus/FocusUi'
import styles from '@/hud/Hud.module.css'
import { hudLayout, hudScale, uiScale } from '@/hud/hudLayout'
import { useWindowSize } from '@/hud/useWindowSize'
import { ZoomIndicator } from '@/hud/zoom/ZoomIndicator'
import { useCameraStore } from '@/store/camera'

export function Hud({ system }: { system: SolarSystem }) {
  const { t } = useTranslation()
  const { width, height, devicePixelRatio } = useWindowSize()
  const layout = useMemo(
    () => hudLayout(width, height, hudScale(height, devicePixelRatio)),
    [width, height, devicePixelRatio],
  )
  const controlsScale = uiScale(height, devicePixelRatio)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const zoomLevel = useCameraStore((state) => state.zoomLevel)
  const zoomMode = useCameraStore((state) => state.zoomMode)

  return (
    <div className={styles.hud}>
      <svg
        className={styles.frame}
        data-testid="hud-frame"
        aria-hidden="true"
      >
        {layout.lines.map(([x1, y1, x2, y2], index) => (
          <line
            key={index}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
          />
        ))}
      </svg>

      <CornerNW
        box={layout.nw}
        onClick={() => setDrawerOpen(true)}
      />
      <CornerNE box={layout.ne} />
      <CornerSW
        box={layout.sw}
        system={system}
      />
      <CornerSE box={layout.se} />
      <ZoomIndicator
        box={layout.zoom}
        level={zoomLevel}
        mode={zoomMode}
      />

      <div
        className={styles.bottomControls}
        style={{ transform: `translateX(-50%) scale(${controlsScale})` }}
      >
        <div
          className={styles.controlGroup}
          data-tutorial-target="time"
        >
          <span className={styles.controlLabel}>{t('hud.timeSpeed')}</span>
          <TimeScaleControl />
        </div>
        <div
          className={styles.controlGroup}
          data-tutorial-target="lang"
        >
          <span className={styles.controlLabel}>{t('hud.lang')}</span>
          <LangSwitcher />
        </div>
      </div>

      <FocusUi scale={controlsScale} />

      <DrawerMenu
        key={drawerOpen ? 'open' : 'closed'}
        system={system}
        box={layout.drawer}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}
