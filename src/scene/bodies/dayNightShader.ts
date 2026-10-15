/**
 * @module scene/bodies/dayNightShader
 * @description Injection GLSL dans un MeshStandardMaterial (`onBeforeCompile`) : l'emissivite
 * (lumieres des villes) n'est visible que du cote nuit. Le facteur nuit est un smoothstep sur
 * le produit scalaire normale · direction de la lumiere. Le Soleil etant a l'origine de la
 * scene, la position de la lumiere est un uniform constant.
 */
import { Vector3 } from 'three'

export interface ShaderLike {
  uniforms: Record<string, { value: unknown }>
  vertexShader: string
  fragmentShader: string
}

export function injectDayNightShader<T extends ShaderLike>(shader: T): T {
  shader.uniforms.uLightPosition = { value: new Vector3(0, 0, 0) }

  shader.vertexShader = `varying vec3 vWorldPosition;\nvarying vec3 vWorldNormal;\n${shader.vertexShader}`
  shader.vertexShader = shader.vertexShader.replace(
    '#include <worldpos_vertex>',
    `#include <worldpos_vertex>
    // Sans ombres ni envmap, Three ne declare pas worldPosition : on la calcule ici
    vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);`,
  )

  shader.fragmentShader = `uniform vec3 uLightPosition;\nvarying vec3 vWorldPosition;\nvarying vec3 vWorldNormal;\n${shader.fragmentShader}`
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <emissivemap_fragment>',
    `#include <emissivemap_fragment>
    vec3 lightDirection = normalize(uLightPosition - vWorldPosition);
    float lightDot = dot(normalize(vWorldNormal), lightDirection);
    float dayFactor = smoothstep(0.0, 0.15, lightDot);
    float nightFactor = 1.0 - dayFactor;
    totalEmissiveRadiance *= nightFactor;`,
  )

  return shader
}
