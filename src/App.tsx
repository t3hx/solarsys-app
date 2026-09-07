/**
 * ~ Racine de l'application : charge les donnees puis monte la scene 3D.
 * Le HUD, les fenetres et l'onboarding arrivent dans les phases suivantes
 * (voir docs/react-migration-plan.md). Le titre reste un repere minimal en attendant.
 */
import { useSolarSystem } from '@/data/useSolarSystem'
import { SolarSystemCanvas } from '@/scene/SolarSystemCanvas'

export function App() {
  const data = useSolarSystem()

  return (
    <>
      {data.status === 'ready' && <SolarSystemCanvas system={data.system} />}
      <header className="pointer-events-none fixed top-4 left-4 z-10">
        <h1 className="text-hud font-sans text-sm font-semibold tracking-[0.4em] uppercase">
          solarsys
        </h1>
      </header>
      {data.status === 'error' && (
        <p
          role="alert"
          className="fixed bottom-4 left-4 z-10 font-mono text-sm text-red-400"
        >
          Failed to load solar system data: {data.message}
        </p>
      )}
    </>
  )
}
