/**
 * @module hud/drawer/BodiesAccordion
 * @description Accordeon des corps celestes : par corps, fil de fer, axes et grille ; par
 * orbite (si le corps en a une), axes et grille. Un seul panneau ouvert a la fois.
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { allBodies } from '@/data/lookup'
import type { SolarSystem } from '@/data/model'
import { DebugCheckbox } from '@/hud/drawer/DebugCheckbox'
import styles from '@/hud/drawer/DrawerMenu.module.css'
import { bodyDisplayName } from '@/i18n'
import { useDebugStore } from '@/store/debug'

export function BodiesAccordion({ system }: { system: SolarSystem }) {
  const { t } = useTranslation()
  const [openId, setOpenId] = useState<string | null>(null)
  const debug = useDebugStore()

  return (
    <div>
      {allBodies(system).map((body) => {
        const name = bodyDisplayName(body.id, body.name)
        const open = openId === body.id
        const panelId = `body-panel-${body.id}`
        return (
          <div
            key={body.id}
            className={styles.accordionItem}
          >
            <button
              type="button"
              className={styles.accordionHeader}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenId(open ? null : body.id)}
            >
              <span>{name}</span>
              <svg
                className={styles.chevron}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {open && (
              <div
                id={panelId}
                role="region"
                aria-label={name}
                className={styles.accordionPanel}
              >
                <p className={styles.sectionLabel}>{t('drawer.body')}</p>
                <DebugCheckbox
                  label={t('drawer.wireframe')}
                  checked={debug.isWireframe(body.id)}
                  onToggle={() => debug.toggleWireframe(body.id)}
                />
                <DebugCheckbox
                  label={t('drawer.axesHelper')}
                  checked={debug.hasBodyAxes(body.id)}
                  onToggle={() => debug.toggleBodyAxes(body.id)}
                />
                <DebugCheckbox
                  label={t('drawer.gridHelper')}
                  checked={debug.hasBodyGrid(body.id)}
                  onToggle={() => debug.toggleBodyGrid(body.id)}
                />
                {body.orbit && (
                  <>
                    <p className={styles.sectionLabel}>{t('drawer.orbit')}</p>
                    <DebugCheckbox
                      label={t('drawer.axesHelper')}
                      checked={debug.hasOrbitAxes(body.id)}
                      onToggle={() => debug.toggleOrbitAxes(body.id)}
                    />
                    <DebugCheckbox
                      label={t('drawer.gridHelper')}
                      checked={debug.hasOrbitGrid(body.id)}
                      onToggle={() => debug.toggleOrbitGrid(body.id)}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
