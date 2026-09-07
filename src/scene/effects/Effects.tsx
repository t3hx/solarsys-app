/**
 * @module scene/effects/Effects
 * @description Post-traitement : bloom leger sur toute la scene (meme reglage que la
 * version Vue : seuil 0, intensite 0.4) et contour du corps cible (blanc au survol,
 * vert a la selection). Le contour n'est monte que lorsqu'un corps est cible.
 */
import { Bloom, EffectComposer, Outline } from '@react-three/postprocessing'
import { useShallow } from 'zustand/react/shallow'
import { outlineConfig } from '@/config/rendering'
import { outlineTarget } from '@/scene/effects/outlineTarget'
import { useRegistry } from '@/scene/registry'
import { useInteractionStore } from '@/store/interaction'

export function Effects() {
  const registry = useRegistry()
  const target = useInteractionStore(useShallow((state) => outlineTarget(state)))
  const mesh = target ? registry.getBody(target.id)?.mesh : undefined
  const color = target?.kind === 'selected' ? outlineConfig.selectedColor : outlineConfig.hoverColor

  return (
    <EffectComposer
      autoClear={false}
      multisampling={outlineConfig.multisampling}
    >
      <Bloom
        intensity={outlineConfig.bloomIntensity}
        luminanceThreshold={0}
        luminanceSmoothing={0.9}
        radius={outlineConfig.bloomRadius}
        mipmapBlur
      />
      {mesh ? (
        <Outline
          selection={mesh}
          visibleEdgeColor={color}
          hiddenEdgeColor={color}
          edgeStrength={outlineConfig.edgeStrength}
          blur
        />
      ) : null}
    </EffectComposer>
  )
}
