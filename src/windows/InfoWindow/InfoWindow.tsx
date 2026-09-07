/**
 * @module windows/InfoWindow/InfoWindow
 * @description Fenetre d'information du corps selectionne : titre traduit, grille de
 * metriques, onglets Analyse (description markdown) et Faits (liste animee).
 * Se ferme par la croix, un clic exterieur ou la deselection ; fermer deselectionne.
 */
import { Icon } from '@iconify/react'
import * as Tabs from '@radix-ui/react-tabs'
import { gsap } from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SolarSystem } from '@/data/model'
import { bodyDisplayName } from '@/i18n'
import { useInteractionStore } from '@/store/interaction'
import { HudWindow } from '@/windows/HudWindow'
import styles from '@/windows/InfoWindow/InfoWindow.module.css'
import { MetricsGrid } from '@/windows/InfoWindow/MetricsGrid'
import { renderRichText } from '@/windows/richText'

type Tab = 'analysis' | 'facts'

export function InfoWindow({ system }: { system: SolarSystem }) {
  const { t, i18n } = useTranslation()
  const selectedId = useInteractionStore((state) => state.selectedId)
  const infoOpen = useInteractionStore((state) => state.infoOpen)
  const [tab, setTab] = useState<Tab>('analysis')

  // * Dernier corps affiche, conserve pendant l'animation de fermeture (pas de flash)
  const [displayedId, setDisplayedId] = useState(selectedId)
  if (selectedId !== null && selectedId !== displayedId) setDisplayedId(selectedId)

  const body = displayedId ? system.byId.get(displayedId) : undefined
  const open = infoOpen && body !== undefined
  const title = body ? bodyDisplayName(body.id, body.name) : ''
  const descriptionKey = `bodies.${body?.id}.description`
  const factsKey = `bodies.${body?.id}.facts`
  const description =
    body && i18n.exists(descriptionKey) ? t(descriptionKey) : t('info.noSelection')
  const rawFacts = body && i18n.exists(factsKey) ? t(factsKey, { returnObjects: true }) : []
  const facts = Array.isArray(rawFacts)
    ? rawFacts.filter((f): f is string => typeof f === 'string')
    : []

  const factsRef = useRef<HTMLUListElement>(null)
  useEffect(() => {
    if (!open || tab !== 'facts' || !factsRef.current) return undefined
    const items = factsRef.current.querySelectorAll('li')
    if (items.length === 0) return undefined
    const tween = gsap.fromTo(
      items,
      { opacity: 0, x: -20, scale: 0.97 },
      { opacity: 1, x: 0, scale: 1, duration: 0.4, stagger: 0.12, ease: 'power2.out' },
    )
    return () => {
      tween.kill()
    }
  }, [open, tab, displayedId])

  const close = () => {
    const interaction = useInteractionStore.getState()
    interaction.setInfoOpen(false)
    interaction.select(null)
  }

  return (
    <HudWindow
      open={open}
      title={title}
      onClose={close}
    >
      {body && (
        <MetricsGrid
          body={body}
          earth={system.byId.get('earth')}
        />
      )}
      <Tabs.Root
        value={tab}
        onValueChange={(value) => setTab(value as Tab)}
      >
        <Tabs.List
          className={styles.tabList}
          aria-label={title}
        >
          <Tabs.Trigger
            className={styles.tab}
            value="analysis"
          >
            <Icon
              icon="solar:document-text-bold-duotone"
              className={styles.tabIcon}
            />
            {t('info.tabs.analysis')}
          </Tabs.Trigger>
          <Tabs.Trigger
            className={styles.tab}
            value="facts"
          >
            <Icon
              icon="solar:star-bold-duotone"
              className={styles.tabIcon}
            />
            {t('info.tabs.facts')}
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content
          value="analysis"
          className={styles.body}
        >
          <div
            className={styles.description}
            data-testid="body-description"
            dangerouslySetInnerHTML={{ __html: renderRichText(description) }}
          />
        </Tabs.Content>
        <Tabs.Content
          value="facts"
          className={styles.body}
        >
          {facts.length > 0 ? (
            <ul
              ref={factsRef}
              className={styles.facts}
            >
              {facts.map((fact) => (
                <li
                  key={fact}
                  className={styles.fact}
                  data-testid="fact-item"
                  dangerouslySetInnerHTML={{ __html: renderRichText(fact) }}
                />
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>{t('info.noFacts')}</p>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </HudWindow>
  )
}
