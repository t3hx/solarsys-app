# Plan de migration — Celestial Walker vers React + React Three Fiber

Date : 2026-09-05, mis à jour le 2026-09-07 avec les décisions ci-dessous. Ce plan s'appuie sur `docs/audit-2026-09.md`. Il est découpé en phases indépendantes, chacune livrable par une branche `feat/*` tirée de `dev`, avec tests et validation manuelle avant squash merge (règles globales).

## Décisions prises le 2026-09-07

| Sujet | Décision |
|-------|----------|
| Dépôts | Le dépôt Vue est renommé **`t3hx/solarsys-app-vue`** (gelé, aucun correctif B1–B13). Le nouveau dépôt **`t3hx/solarsys-app`** est créé, vide. Le `origin` du clone local Vue a été repointé vers `solarsys-app-vue`. |
| Nom du produit | **`solarsys`** remplace « Celestial Walker » partout : titre de page, préloader, drawer, cartouche, fenêtre À propos, textes du tutoriel, cookie (`solarsys_tutorial_seen`). |
| Image Docker | **`ghcr.io/t3hx/solarsys-app`**, taguée `latest` sur `main` + sha. |
| Production | L'app n'a jamais été déployée : la phase 9 inclut la création de l'application Dokploy, le domaine, les identifiants ghcr et le premier déploiement. |
| Caméra | `CameraControls` de drei (D3) validé. Résultat du prototype (phase 4, 2026-09-07) : CameraControls pour les entrées utilisateur et le suivi (`moveTo` par frame) ; les transitions scriptées (focus 1,5 s, tactique 2 s, reset) restent des tweens GSAP `power3.inOut` appliqués via `setLookAt(…, false)`, car l'événement `rest` de camera-controls arrive plusieurs secondes après la fin visuelle. |
| Ombres | **Supprimées** (pas de `castShadow`, pas d'option). |
| Linear | Projet **Solarsys** existant (id `a6dd0f2f-…`), vide : EPIC#1 et FEAT#1–#9 créés à partir de ce plan. |

---

## 0. Principes

1. **Parité d'abord, améliorations ensuite.** Les phases 1 à 7 reproduisent le comportement actuel ; la phase 8 traite les performances et les assets ; les corrections de l'audit sont intégrées « gratuitement » par la nouvelle architecture, pas rétro-portées en Vue.
2. **Réécriture de la couche scène, portage de la logique pure.** Kepler, conversion d'éléments orbitaux, unités, mise à l'échelle, formatage des métriques, extraction des textures, calcul des paths de bordure : ces modules n'ont aucune dépendance framework et sont copiés avec leurs tests.
3. **Plus jamais d'objet Three.js dans un état réactif.** Zustand ne contient que des données sérialisables (ids, flags, nombres). Les objets Three vivent dans des `ref` et un registre non réactif.
4. **Déclaratif partout où R3F le permet.** Helpers de debug, couches (nuages, anneaux), wireframe, sélection : du JSX conditionnel et des props, pas de `scene.add/remove` impératifs.
5. **TDD sur la logique, tests de rendu sur la scène, e2e léger sur les parcours.**

---

## 1. Décisions structurantes (à valider avant la phase 1)

| # | Décision | Recommandation | Alternative | Pourquoi |
|---|----------|----------------|-------------|----------|
| D1 | Emplacement du code | **Décidé** : nouveau dépôt `t3hx/solarsys-app`, version Vue renommée `t3hx/solarsys-app-vue` et gelée | — | Historique lisible, CI/CD et Dockerfile propres, pas de cohabitation Nuxt/Vite dans un même `package.json`. |
| D2 | Meta-framework | **Vite 6 + React 19, SPA** | Next.js (App Router) | Aucun SSR, aucun SEO, aucune API : Next n'apporte que de la complexité. Le `ClientOnly` et `isomorphic-dompurify` disparaissent. |
| D3 | Caméra | **`CameraControls` de drei** (lib `camera-controls`) | `OrbitControls` + port du proxy GSAP | `fitToSphere`, `setLookAt`, `smoothTime`, damping, transitions animées natives ; remplace ~250 lignes de `useCameraManager`. |
| D4 | Post-processing | **`@react-three/postprocessing`** (lib `postprocessing`) | `three/addons` EffectComposer via `useEffect` | Passes fusionnées (plus rapide que `UnrealBloomPass` + `OutlinePass` séparés), `Bloom` sélectif par seuil de luminance, `Outline` avec `selection`. |
| D5 | État global | **Zustand 5** avec slices | Jotai | Store hors React accessible depuis `useFrame` sans re-render (`getState()`), `subscribeWithSelector` pour réagir aux changements de sélection. |
| D6 | i18n | **react-i18next** avec les mêmes fichiers JSON | Lingui | Structure JSON compatible ; `$te` → `i18n.exists`, `tm/rt` → `t(key, { returnObjects: true })`. |
| D7 | UI kit | **Aucun** : Tailwind v4 + CSS Modules + Radix Tabs | shadcn/ui | Nuxt UI n'est utilisé que pour `UTabs`, `UIcon` et un `UButton` mort. |
| D8 | Icônes | **`@iconify/react`** avec collections `solar`, `logos`, `simple-icons` embarquées hors ligne (`@iconify-json/*` + `addCollection`) | SVG inline | Mêmes noms d'icônes qu'aujourd'hui, pas d'appel réseau vers l'API Iconify. |
| D9 | Textures | **KTX2/Basis en phase 8**, JPEG conservés jusqu'à la parité | Tout de suite | Ne pas mélanger migration et optimisation d'assets. |
| D10 | Tests | **Vitest + Testing Library + `@react-three/test-renderer` + Playwright** | Cypress | Cohérent avec Vite. |
| D11 | Hébergement | **Image nginx non-root** (`nginxinc/nginx-unprivileged`) servant `dist/` | Node + `serve` | Statique, minimal, conforme à la règle « utilisateur non-root ». |

---

## 2. Stack cible

| Rôle | Paquet | Version cible |
|------|--------|---------------|
| Build | `vite`, `@vitejs/plugin-react` | 6.x |
| UI | `react`, `react-dom` | 19.x |
| Langage | `typescript` (devDependency) | 5.9 |
| 3D | `three` | 0.183 (inchangé) |
| 3D React | `@react-three/fiber` | 9.x |
| Helpers 3D | `@react-three/drei` | 10.x (`CameraControls`, `useTexture`, `useKTX2`, `useProgress`, `Html`, `useCursor`) |
| Effets | `@react-three/postprocessing`, `postprocessing` | 3.x / 6.x |
| État | `zustand` | 5.x |
| Animation DOM | `gsap`, `@gsap/react` | 3.x |
| i18n | `i18next`, `react-i18next`, `i18next-browser-languagedetector` | 24 / 15 |
| Icônes | `@iconify/react`, `@iconify-json/solar`, `@iconify-json/logos`, `@iconify-json/simple-icons` | dernière |
| Markdown | `marked`, `dompurify` | 17 / 3 |
| Validation | `zod` | 4.x |
| Tabs | `@radix-ui/react-tabs` | 1.x |
| Styles | `tailwindcss`, `@tailwindcss/vite` | 4.x |
| Tests | `vitest`, `@testing-library/react`, `@react-three/test-renderer`, `@playwright/test` | dernière |
| Lint | `eslint` (flat), `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `prettier` | dernière |

Supprimés : tout `@nuxt/*`, `nuxt`, `vue*`, `@unhead/vue`, `isomorphic-dompurify`, `@antfu/eslint-config`.

---

## 3. Arborescence cible

```
src/
  main.tsx                    # Providers (i18n), <App/>
  App.tsx                     # Phases : preloading → tutorial → scene
  config/                     # Portés tels quels : scene.ts, rendering.ts, scaling.ts, zoom.ts, colors.ts
  data/
    schema.ts                 # zod : JSON brut (strings + unités)
    model.ts                  # Types du modèle normalisé (nombres, SI)
    normalize.ts              # JSON validé → modèle (une seule fois)
    loadSolarSystem.ts        # fetch + validate + normalize
    lookup.ts                 # Map<id, Body>, parents, satellites
  physics/
    kepler.ts                 # solveKepler, eccentricToTrueAnomaly, orbitalPosition(t)
    orbitalElements.ts        # convertOrbitalElements (écliptique → équateur solaire)
    units.ts                  # heures/jours/années, km/UA, masses terrestres
    scaling.ts                # km → unités 3D (corps, étoile, orbites, orbites locales)
    rotation.ts               # période → vitesse angulaire
  store/
    interaction.ts            # hoveredId, selectedId, isFollowing, isTactical, windows ouvertes
    simulation.ts             # speed, presets, paused
    debug.ts                  # wireframe/axes/grid par id + globaux
    camera.ts                 # distance, zoomLevel
    index.ts                  # useStore combiné (slices) + sélecteurs
  scene/
    registry.ts               # Map<id, { mesh, system, pivot, line, layers }> non réactif + hooks useRegisterBody/useRegisterOrbit
    SolarSystemCanvas.tsx     # <Canvas> : gl, dpr, camera, tone mapping
    SceneContents.tsx         # Suspense, Starfield, Sun, Planets, CameraRig, Effects, SimulationDriver
    Starfield.tsx
    bodies/
      Sun.tsx                 # MeshBasicMaterial + PointLight
      CelestialBody.tsx       # sphère + matériau data-driven + couches + helpers
      CloudLayer.tsx, AtmosphereLayer.tsx, RingLayer.tsx
      useBodyMaterial.ts      # map/normal/bump/roughness/emissive + presets rendering.config
      useDayNightShader.ts    # onBeforeCompile
      useRoughnessFromSpecular.ts
    orbits/
      Orbit.tsx               # <group Ω> <group i> { children } <OrbitLine/>
      OrbitLine.tsx           # points ellipse (physics) → <line>
      orbitGeometry.ts        # ellipsePoints(a, e, ω, n) pur, testé
    simulation/
      SimulationDriver.tsx    # useFrame : temps simulé, positions, rotations
    camera/
      CameraRig.tsx           # CameraControls + focus / follow / tactical / reset + distance → store
      useKeyboardShortcuts.ts # Space, Escape (un seul endroit)
    effects/
      Effects.tsx             # EffectComposer, Bloom, Outline (selection depuis registry)
    debug/
      BodyHelpers.tsx, OrbitHelpers.tsx   # JSX conditionnel
  hud/
    Hud.tsx                   # cadre + coins + zoom + contrôles bas + focus UI
    corners/CornerNW.tsx, CornerNE.tsx, CornerSE.tsx, CornerSW.tsx
    zoom/ZoomLevel.tsx, ZoomBars.tsx, zoomState.ts (pur)
    TimeScaleControl.tsx, LangSwitcher.tsx, BodySymbol.tsx, ExitFocusPrompt.tsx, InfoButton.tsx
    drawer/DrawerMenu.tsx, DrawerHome.tsx, DrawerOptions.tsx, BodiesAccordion.tsx, Checkbox.tsx
  windows/
    HudWindow.tsx             # conteneur commun (fade, clip-path, bordure animée, header, close)
    useAnimatedBorder.ts      # calculatePaths + timeline GSAP
    borderPaths.ts            # pur, testé
    InfoWindow/InfoWindow.tsx, MetricsGrid.tsx, MetricCard.tsx, buildMetrics.ts (pur, testé), formatters.ts
    AboutWindow/AboutWindow.tsx, useScanAnimation.ts
  onboarding/
    Preloader.tsx             # useProgress (drei) + préchargement explicite
    preloadTextures.ts        # extractTexturePaths (pur) + useTexture.preload
    Tutorial.tsx, useTutorial.ts, tutorialSteps.ts
  i18n/
    index.ts, locales/en.json, locales/fr.json
  styles/
    tokens.css                # palettes greeen/purpl/… en variables CSS
    global.css
public/
  data/solar_system_data.json
  textures/                   # phase 8 : *.ktx2
```

---

## 4. Correspondance Vue → React

| Aujourd'hui (Vue/Nuxt) | Demain (React/R3F) | Ce qui change |
|------------------------|--------------------|---------------|
| `useSceneOrchestrator` (334 l.) | `SolarSystemCanvas` + `SceneContents` | Le cycle de vie est l'arbre React ; R3F dispose automatiquement géométries/matériaux au démontage. Plus de flags `isSceneBaseInit`. |
| `useAnimationLoop` | `useFrame` dans `SimulationDriver`, `CameraRig`, `Effects` (ordre par `priority`) | Plus de `requestAnimationFrame` manuel ni de `Timer`. |
| `usePostProcessing` + `effectsState` + watchers | `<Effects>` avec `<Bloom/>` et `<Outline selection={…}/>` | La sélection est dérivée de `selectedId`/`hoveredId` + registre ; plus de `outlinedObjects` par nom. |
| `useCelestialBodyFactory` | `<CelestialBody>` + hooks matériaux | Textures via `useTexture` (Suspense). Même logique data-driven. Géométrie unitaire partagée + `scale`. |
| `useOrbitFactory` | `<Orbit>` + `<OrbitLine>` + `orbitGeometry.ts` | Le pivot est un `<group>` ; `userData` remplacé par des props typées. |
| `useSceneLoader` | `<SolarSystem>` mappe le modèle normalisé → `<Planet>` → `<Satellite>` | Plus de `registerCelestialBody` impératif : `useRegisterBody(id, ref)` dans un `useEffect`. |
| `useSimulationManager` | `physics/kepler.ts` (pur) + `SimulationDriver` | Le driver itère le registre. Le Soleil étant à l'origine, `uLightPosition` est constant `(0,0,0)` : plus de mise à jour par frame. |
| `useCameraManager`, `useTacticalView`, `cameraState` | `CameraRig` + slice `camera` | `CameraControls.fitToSphere` pour le focus, `setLookAt` animé pour la vue tactique, suivi par delta dans `useFrame`. Vitesse de simulation non modifiée par le focus (B5). |
| `useInteractionManager` (373 l.) | `onPointerOver/Out/Click` sur `<mesh>` et `<line>`, `useCursor`, `useKeyboardShortcuts` | Plus de raycaster manuel ni de boucle de hover par frame (A4). `raycaster.params.Line.threshold` ajusté dans `CameraRig` selon la distance. |
| `useVisualisation` + `visualisationState` | slice `debug` + `<BodyHelpers>`/`<OrbitHelpers>` + prop `wireframe` | Helpers en JSX conditionnel ; wireframe appliqué aussi aux couches (B3) ; toggles globaux forcent l'état (B2). |
| `useZoomManager` | `zoomState.ts` (pur : distance → niveau) + slice `camera` | Écrit par `CameraRig` seulement si le niveau change. |
| `usePreloader` + `textureCache` | `preloadTextures.ts` + `useProgress` | Le cache est celui de `useLoader` (dispose propre, B9). |
| `useSolarSystemData`, `useCelestialBodyLookup` | `loadSolarSystem()` + `lookup.ts` | Validation zod, modèle numérique (A5). |
| `useTutorial` (`useCookie`) | `useTutorial` (`localStorage` ou `js-cookie`) | — |
| `SceneOverlaySvg` (SVG 1920×1080 stretch + corrections) | `Hud` en `position: fixed` + coins SVG individuels + `scale()` CSS | Plus de `preserveAspectRatio="none"` ni de `foreignObject` (A12). |
| `ActionsDrawerMenu` (`foreignObject` + `ResizeObserver`) | `DrawerMenu` HTML | Simple panneau animé. |
| `InfosWindow` + `AboutWindow` | `HudWindow` + `useAnimatedBorder` partagés | Duplication A6 supprimée. |
| `BodyMetricsGrid` | `buildMetrics(body, earth, t)` pur + `MetricsGrid` | Testable, constantes depuis `physics/units.ts` (A7). |
| `<style scoped>` + `v-bind()` | CSS Modules + variables CSS depuis `tokens.css` | — |
| `$t`, `$te`, `tm`, `rt` | `useTranslation`, `i18n.exists`, `returnObjects` | — |
| `UTabs`, `Icon`, `UIcon` | Radix Tabs, `@iconify/react` | — |

---

## 5. État et registre

```ts
// store/interaction.ts
interface InteractionSlice {
  hoveredId: string | null
  selectedId: string | null
  isFollowing: boolean
  isTactical: boolean
  infoOpen: boolean
  aboutOpen: boolean
  select(id: string | null): void
  hover(id: string | null): void
  toggleTactical(): void
  // …
}

// scene/registry.ts (non réactif)
interface BodyEntry { id: string; mesh: Mesh; system: Group; layers: Mesh[] }
interface OrbitEntry { id: string; bodyId: string; pivot: Group; line: Line; a: number; e: number; omega: number; period: number; M0: number }
export const registry = { bodies: new Map<string, BodyEntry>(), orbits: new Map<string, OrbitEntry>() }
export function useRegisterBody(id, refs) { useEffect(() => { register; return unregister }, [id]) }
```

Règles :
- Les composants scène lisent le store avec des sélecteurs fins (`useStore(s => s.debug.wireframe[id])`) pour ne re-rendre que l'objet concerné.
- `useFrame` lit `useStore.getState()` (pas de hook) pour ne jamais re-rendre sur le temps.
- `CameraRig` s'abonne à `selectedId` via `subscribeWithSelector` pour déclencher `fitToSphere` une seule fois par changement.
- React StrictMode double-monte : `useRegisterBody` doit être idempotent (register/unregister symétriques).

---

## 6. Phases

Chaque phase : branche `feat/<slug>` depuis `dev`, un FEAT Linear, des TASK enfants, PR squash après validation manuelle. Les estimations sont des ordres de grandeur en jours de travail assisté.

### Phase 1 — Fondations du dépôt (1–2 j)
Branche `feat/project-scaffold`.
- Vite + React 19 + TS strict, alias `@/` unique, Tailwind v4, `tokens.css` (palettes actuelles), Prettier (config actuelle reprise), ESLint flat **versionné**.
- Vitest (jsdom) + Testing Library + `@react-three/test-renderer` ; Playwright avec un test smoke.
- CI GitHub Actions : `lint` → `typecheck` → `test` → `build` sur PR et `dev` ; build + push ghcr sur `main` ; job deploy Dokploy (webhook) sur `main`.
- Dockerfile multi-stage (`corepack` + pnpm épinglé, `nginxinc/nginx-unprivileged`, `.dockerignore`), `nginx.conf` avec cache long pour `/textures`.
- README minimal, `CLAUDE.md` versionné.
- Linear : projet, EPIC, FEATs.
Critère : `pnpm lint && pnpm typecheck && pnpm test && pnpm build` verts en CI, image Docker qui sert une page « hello ».

### Phase 2 — Données et physique (2 j)
Branche `feat/data-and-physics`.
- `data/schema.ts` (zod) validant `solar_system_data.json` tel quel ; `normalize.ts` → modèle numérique (`radiusKm`, `rotationPeriodHours`, `orbitalPeriodDays`, angles en radians, `rings?: { innerKm, outerKm, texture? }`, `moonCount` cohérent avec les satellites présents ou renommé `knownMoons`).
- `physics/kepler.ts`, `orbitalElements.ts`, `units.ts`, `scaling.ts`, `rotation.ts`, `orbits/orbitGeometry.ts`, `hud/zoom/zoomState.ts` : portés depuis les composables Vue, en pur.
- Tests : Kepler (e=0 → cercle, e=0.2488 Pluton convergence, périodes), conversion (i=0 → inchangé, cas Mercure), unités (Venus rétrograde négatif, Eris en jours), scaling (Terre ≈ 1.37 u, 1 UA = 250 u), zoom (seuils), schéma (JSON réel valide, JSON cassé rejeté).
Critère : couverture > 90 % sur `physics/` et `data/`.

### Phase 3 — Scène de base (3 j)
Branche `feat/scene-core`.
- `SolarSystemCanvas` (`gl`: antialias, ACES, exposure 1.2 ; `dpr=[1, 2]` ; caméra fov 75, near 0.1, far 500000, position (0, 75, 1000) ; pas d'ombres, décision du 2026-09-07).
- `Starfield` (même distribution), `Sun` (+ `PointLight` decay 1.5, intensité 3500), `Orbit`/`OrbitLine`, `CelestialBody` avec texture `main` seule, oblateness, inclinaison axiale (`rotation.order = 'ZYX'`), satellites imbriqués.
- `SimulationDriver` : temps simulé (jours), positions Kepler, rotations ; slice `simulation` + presets.
- `CameraRig` libre (`CameraControls`, min/max distance, `maxPolarAngle`).
- Tests : rendu avec `@react-three/test-renderer` (nombre de meshes = nombre de corps, hiérarchie), position d'un corps à t donné = valeur attendue.
Critère : capture d'écran comparable à la version Vue au même instant simulé.

### Phase 4 — Interaction et caméra (3 j)
Branche `feat/interaction-and-camera`.
- Pointer events sur corps et lignes d'orbite (seuil de ligne fonction de la distance caméra), `useCursor`, `hover`/`select` dans le store, `Escape`/`Space` centralisés.
- `Effects` : `Bloom` (intensité 0.4, seuil bas) + `Outline` (couleurs hover blanc / sélection vert, `edgeStrength 5`), surbrillance de la ligne d'orbite associée.
- Focus (`fitToSphere` + multiplicateur 1.5 + offset vertical 15 %), suivi par delta, vue tactique (hauteur 28000, durée 2 s, sauvegarde/restauration), reset, `cameraDistance` → `zoomLevel`.
- Tests : store (transitions select/hover/tactical), `zoomState`, composant `CameraRig` (appel `fitToSphere` sur sélection, mocké).
Critère : parcours clic → focus → Espace → reset identique à l'existant.

### Phase 5 — Features visuelles (3 j)
Branche `feat/body-visual-features`.
- `useBodyMaterial` (normal, bump, roughness depuis spéculaire via canvas, emissive nuit, presets `rendering.config`), `useDayNightShader`, `CloudLayer`, `AtmosphereLayer`, `RingLayer` (remap UV radial, fallback couleur), géométrie partagée.
- Aucune ombre : `castShadow`/`receiveShadow` et `lightingDefaults.shadow*` ne sont pas portés.
- Tests : `remapRingUVs` pur, `specularToRoughness` sur un canvas 2×2, snapshot du shader injecté.
Critère : Terre (jour/nuit, nuages, rugosité océans), Vénus (atmosphère), Saturne/Uranus (anneaux), Pluton (bump) visuellement conformes.

### Phase 6 — HUD (4–5 j)
Branche `feat/hud-overlay`.
- `Hud` : cadre, 4 coins (bouton MENU, nom de cible avec fondu, bouton triangle vue tactique avec morph d'icône GSAP), indicateur de zoom (barres, MAX, OUT OF RANGE, VOID), contrôles bas (vitesse, langue), `BodySymbol` (15 symboles SVG), `ExitFocusPrompt`, `InfoButton`.
- `DrawerMenu` : vues home/options, toggles globaux, accordéon corps + orbite, cartouche version.
- `BodyHelpers`/`OrbitHelpers` déclaratifs.
- Accessibilité : chaque zone cliquable est un `<button>` focusable.
- Tests : Testing Library sur le drawer (toggle → store), ZoomBars (n barres visibles), `BodySymbol` (id inconnu → rien).
Critère : HUD identique aux mêmes tailles d'écran (1920×1080, 1440×900, 1280×720, Retina).

### Phase 7 — Fenêtres, onboarding, i18n (2–3 j)
Branche `feat/windows-and-onboarding`.
- `HudWindow` + `useAnimatedBorder`, `InfoWindow` (tabs Analyse/Faits, `MetricsGrid`, markdown `marked` + `dompurify`), `AboutWindow` (scan radar GSAP, stack mise à jour : React, R3F, Three, TypeScript, Tailwind, GSAP, Docker).
- Renommage produit : « Celestial Walker » → « solarsys » dans le titre de page, le préloader, le drawer (titre SVG et cartouche), la fenêtre À propos, les textes du tutoriel (EN et FR) et le nom du cookie.
- `Preloader` (`useProgress`, fondu GSAP, phases preloading → tutorial → scene), `Tutorial` (spotlight par `data-tutorial-target`, persistance).
- i18n : `react-i18next`, détection navigateur + persistance, mêmes JSON, suppression des clés mortes.
- Tests : `buildMetrics` (Terre sans ratio, Jupiter ratio masse, unités années/jours), `borderPaths`, `formatters`, `useTutorial`.
Critère : parité complète ; checklist §7 validée manuellement.

### Phase 8 — Performance et assets (2–3 j)
Branche `perf/textures-and-rendering`.
- Script `scripts/convert-textures.mjs` (`toktx`/`basisu`) → KTX2 UASTC/ETC1S avec mipmaps ; résolutions : 2K par défaut, 4K Terre/Soleil, 8K Terre en LOD activé au-delà du niveau de zoom 8.
- `useKTX2` (drei) + `KTX2Loader` transcoder dans `public/basis/`.
- Chargement progressif : scène affichée dès les 2K, 8K en arrière-plan.
- DPR plafonné, bloom sélectif, mesure avant/après (temps jusqu'au premier rendu, VRAM via `renderer.info`, FPS sur un MacBook et un mobile).
Critère : premier rendu < 3 s sur connexion fibre (vs préchargement complet aujourd'hui), 60 fps stable sur Retina 1440p.

### Phase 9 — Mise en production (1–2 j)
Branche `ci/deploy-and-docs`.
- Playwright : chargement, clic planète, focus, ouverture info, changement de langue, vue tactique.
- Docs : README (EN), `DEV_GUIDE.md` (FR) réécrit pour R3F, `CLAUDE.md`.
- Première mise en production (l'app n'a jamais été déployée) : application Dokploy de type image Docker pointant sur `ghcr.io/t3hx/solarsys-app:latest`, identifiants ghcr (token lecture packages) saisis dans Dokploy, domaine + certificat, healthcheck sur `/`, webhook Dokploy appelé par le job `deploy` de la CI sur `main`. Aucun secret applicatif n'est nécessaire côté runtime (app statique) ; le webhook Dokploy est un secret GitHub Actions.
- Archivage du dépôt `solarsys-app-vue` sur GitHub une fois la prod validée.

---

## 7. Checklist de parité (validation manuelle avant chaque merge concerné)

- [ ] Préloader : barre de progression, compteur, états LOADING / PREPARING / READY, fondu.
- [ ] Tutoriel : 9 étapes, spotlight sur menu / zoom / temps / langue / tactique, skip, persistance.
- [ ] Scène : Soleil, 13 planètes et planètes naines, Lune ; orbites elliptiques ; inclinaisons ; rotations (Vénus, Uranus, Pluton rétrogrades) ; jour/nuit Terre ; nuages ; atmosphère Vénus ; anneaux Saturne (texture) et Uranus (couleur) ; bump Pluton.
- [ ] Survol : contour blanc + ligne d'orbite blanche + nom dans le coin SW. Sélection : contour vert + ligne verte, focus animé 1,5 s, suivi, symbole du corps, bouton « En savoir plus », prompt Espace.
- [ ] Espace quitte le focus, Échap désélectionne, clic dans le vide désélectionne, clic sur l'UI ne désélectionne pas.
- [ ] Vue tactique : montée à 28 000 u en 2 s, icône morphée, Espace ou re-clic pour sortir avec restauration.
- [ ] Zoom : 10 barres, MAX clignotant < 350 u, OUT OF RANGE rouge > 25 000 u, VOID violet près de la distance max.
- [ ] Vitesse : x0.01 / x0.1 / x1 / x10 ; le focus ne change plus la vitesse (comportement volontairement corrigé, B5).
- [ ] Drawer : home (Options / About), options (toggles globaux, accordéon corps + orbite), fermeture, cartouche.
- [ ] Fenêtre info : bordure animée, métriques avec ratios ⊕ et détails au survol, onglets Analyse / Faits avec markdown, fermeture (croix, clic extérieur, désélection).
- [ ] À propos : auteur, sources, stack animée ; s'exclut mutuellement avec la fenêtre info.
- [ ] Langue : EN/FR instantané, persistance.
- [ ] Redimensionnement fenêtre : canvas, HUD et effets suivent.
- [ ] Démontage / remontage (StrictMode) sans fuite ni warning console.

---

## 8. Risques et parades

| Risque | Impact | Parade |
|--------|--------|--------|
| Raycast des lignes : `Line2` de drei ne respecte pas `raycaster.params.Line.threshold` | Sélection d'orbite imprécise | Utiliser `<line>` natif (`LineBasicMaterial`) comme aujourd'hui ; `linewidth` n'a de toute façon aucun effet en WebGL. |
| Suivi caméra avec `CameraControls` (delta par frame) moins fluide que le lerp GSAP | Tremblement en suivi | `controls.smoothTime` bas pendant le suivi, ou appliquer le delta directement à `camera.position` + `controls.setTarget` sans transition (mode « rigide »). Prototype en phase 4 avant de figer D3. |
| Suspense + 22 textures : cascade de chargements | Premier rendu lent | Préchargement explicite (`useTexture.preload`) piloté par `Preloader`, puis montage de la scène. |
| StrictMode double-montage | Doubles enregistrements dans le registre | `useRegisterBody` idempotent, tests de montage/démontage. |
| `postprocessing` `Outline` : coût par frame | FPS | Activer l'`Outline` seulement si `hoveredId || selectedId`. |
| Icônes Iconify hors ligne | Icônes manquantes en prod | Collections embarquées (D8) ; test e2e vérifie la présence des SVG. |
| Parité visuelle du HUD sans le SVG « stretch » | Décalages sur écrans étroits | Capturer des références 1920×1080 / 1280×720 / mobile de la version Vue avant de commencer la phase 6. |

---

## 9. Suivi Linear et branches

Projet Linear : **Solarsys** (équipe T3H). Issues créées le 2026-09-07 :

```
T3H-182  solarsys - EPIC#1 - React Three Fiber migration
  T3H-183  solarsys - FEAT#1 - Project scaffold, CI and Docker          → feat/project-scaffold
  T3H-184  solarsys - FEAT#2 - Data schema and orbital physics core      → feat/data-and-physics
  T3H-185  solarsys - FEAT#3 - Core R3F scene and simulation             → feat/scene-core
  T3H-186  solarsys - FEAT#4 - Interaction, effects and camera rig       → feat/interaction-and-camera
  T3H-187  solarsys - FEAT#5 - Body visual features                      → feat/body-visual-features
  T3H-188  solarsys - FEAT#6 - HUD overlay and drawer                    → feat/hud-overlay
  T3H-189  solarsys - FEAT#7 - Windows, onboarding and i18n              → feat/windows-and-onboarding
  T3H-190  solarsys - FEAT#8 - Texture pipeline and rendering perf       → perf/textures-and-rendering
  T3H-191  solarsys - FEAT#9 - E2E, docs and first production deploy     → ci/deploy-and-docs
```

Chaque FEAT est découpé en TASK (ex. `solarsys - TASK#12 - Kepler solver with tests`) au démarrage de la phase. Un worktree Orca par agent, une branche par tâche.

---

## 10. Estimation globale

| Phase | Jours |
|-------|-------|
| 1 Fondations | 1–2 |
| 2 Données et physique | 2 |
| 3 Scène de base | 3 |
| 4 Interaction et caméra | 3 |
| 5 Features visuelles | 3 |
| 6 HUD | 4–5 |
| 7 Fenêtres, onboarding, i18n | 2–3 |
| 8 Performance et assets | 2–3 |
| 9 Mise en production | 1–2 |
| **Total** | **21–26** |

---

## 11. Questions ouvertes

Toutes tranchées le 2026-09-07, voir « Décisions prises » en tête de document. Reste à faire côté poste de travail : renommer le clone local `~/projects/solarsys-app` en `solarsys-app-vue` et cloner `t3hx/solarsys-app` à sa place.
