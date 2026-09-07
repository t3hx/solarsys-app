/**
 * ~ Racine de l'application : charge les donnees, monte la scene 3D et le HUD.
 * Les fenetres d'information et l'onboarding arrivent en phase 7.
 */
import { useSolarSystem } from '@/data/useSolarSystem'
import { Hud } from '@/hud/Hud'
import { useKeyboardShortcuts } from '@/scene/camera/useKeyboardShortcuts'
import { SolarSystemCanvas } from '@/scene/SolarSystemCanvas'

export function App() {
  const data = useSolarSystem()
  useKeyboardShortcuts()

  return (
    <>
      <h1 className="sr-only">solarsys</h1>
      {data.status === 'ready' && (
        <>
          <SolarSystemCanvas system={data.system} />
          <Hud system={data.system} />
        </>
      )}
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
