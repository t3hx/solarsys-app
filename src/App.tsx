/**
 * ~ Racine de l'application : charge les donnees, monte la scene 3D sous le prechargeur,
 * puis enchaine tutoriel (premiere visite) et scene avec HUD et fenetres.
 */
import { useSolarSystem } from '@/data/useSolarSystem'
import { Hud } from '@/hud/Hud'
import { Preloader } from '@/onboarding/Preloader'
import { Tutorial } from '@/onboarding/Tutorial'
import { hasSeenTutorial } from '@/onboarding/useTutorial'
import { useKeyboardShortcuts } from '@/scene/camera/useKeyboardShortcuts'
import { SolarSystemCanvas } from '@/scene/SolarSystemCanvas'
import { useAppStore } from '@/store/app'
import { AboutWindow } from '@/windows/AboutWindow/AboutWindow'
import { InfoWindow } from '@/windows/InfoWindow/InfoWindow'

export function App() {
  const data = useSolarSystem()
  const phase = useAppStore((state) => state.phase)
  useKeyboardShortcuts()

  return (
    <>
      <h1 className="sr-only">solarsys</h1>
      {data.status === 'ready' && (
        <>
          <SolarSystemCanvas system={data.system} />
          {phase !== 'preloading' && <Hud system={data.system} />}
          {phase === 'scene' && (
            <>
              <InfoWindow system={data.system} />
              <AboutWindow />
            </>
          )}
        </>
      )}
      {phase === 'preloading' && (
        <Preloader
          onComplete={() =>
            useAppStore.getState().finishPreloading({ tutorialSeen: hasSeenTutorial() })
          }
        />
      )}
      {phase === 'tutorial' && (
        <Tutorial onComplete={() => useAppStore.getState().finishTutorial()} />
      )}
      {data.status === 'error' && (
        <p
          role="alert"
          className="fixed bottom-4 left-4 z-[3000] font-mono text-sm text-red-400"
        >
          Failed to load solar system data: {data.message}
        </p>
      )}
    </>
  )
}
