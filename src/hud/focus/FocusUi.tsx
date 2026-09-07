/**
 * @module hud/focus/FocusUi
 * @description Interface du mode focus, visible pendant le suivi d'un corps selectionne :
 * symbole du corps (haut droite), bouton « en savoir plus » (haut centre) qui ouvre la
 * fenetre d'information, et invite « Espace pour quitter » clignotante (bas centre).
 */
import { useTranslation } from 'react-i18next'
import { BodySymbol } from '@/hud/BodySymbol'
import styles from '@/hud/focus/focus.module.css'
import { useInteractionStore } from '@/store/interaction'

export function FocusUi({ scale }: { scale: number }) {
  const { t } = useTranslation()
  const selectedId = useInteractionStore((state) => state.selectedId)
  const isFollowing = useInteractionStore((state) => state.isFollowing)
  const infoOpen = useInteractionStore((state) => state.infoOpen)
  const setInfoOpen = useInteractionStore((state) => state.setInfoOpen)

  if (!selectedId || !isFollowing) return null

  return (
    <div
      className={styles.container}
      data-testid="focus-ui"
    >
      <div
        className={styles.symbol}
        style={{ transform: `scale(${scale})` }}
      >
        <BodySymbol bodyId={selectedId} />
      </div>
      <div
        className={styles.topCenter}
        style={{ transform: `translateX(-50%) scale(${scale})` }}
      >
        <button
          type="button"
          className={styles.infoButton}
          aria-pressed={infoOpen}
          onClick={() => setInfoOpen(!infoOpen)}
        >
          {t('hud.wantToKnowMore')}
        </button>
      </div>
      <div
        className={styles.bottomCenter}
        style={{ transform: `translateX(-50%) scale(${scale})` }}
      >
        <p className={styles.exitPrompt}>{t('hud.exitFocus')}</p>
      </div>
    </div>
  )
}
