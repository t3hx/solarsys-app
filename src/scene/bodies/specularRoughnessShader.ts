/**
 * @module scene/bodies/specularRoughnessShader
 * @description Utilise la carte speculaire d'un corps directement comme `roughnessMap` :
 * Three lit la rugosite dans le canal vert, or la carte speculaire code la brillance
 * (eau claire, terres sombres). L'injection remplace la lecture par son inverse, avec un
 * plancher pour l'eau (le reflet du Soleil sur l'ocean vu de l'espace est large et doux).
 * Remplace la conversion par canvas 2D (8K, 134 Mo en memoire, texture canvas a televerser)
 * qui dependait du navigateur.
 */
export interface RoughnessShaderLike {
  uniforms: Record<string, { value: unknown }>
  fragmentShader: string
}

export function injectSpecularRoughness<T extends RoughnessShaderLike>(
  shader: T,
  minRoughness: number,
): T {
  shader.uniforms.uMinRoughness = { value: minRoughness }
  shader.fragmentShader = `uniform float uMinRoughness;\n${shader.fragmentShader}`
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <roughnessmap_fragment>',
    `float roughnessFactor = roughness;
    #ifdef USE_ROUGHNESSMAP
    vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
    // Carte speculaire : brillance dans le canal vert → rugosite = 1 - brillance, plancher eau
    roughnessFactor *= max(1.0 - texelRoughness.g, uMinRoughness);
    #endif`,
  )
  return shader
}
