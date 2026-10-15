/**
 * @module store/debug
 * @description Aides visuelles de debug : fil de fer par corps, axes et grilles par corps et
 * par orbite, et bascules globales qui forcent toutes les entrees a la meme valeur
 * (audit B2 : plus de desynchronisation entre global et individuel).
 * Ne contient que des identifiants et des booleens ; la scene rend les helpers en JSX.
 */
import { create } from 'zustand'

type Flags = Readonly<Record<string, boolean>>

export interface DebugState {
  wireframe: Flags
  bodyAxes: Flags
  bodyGrids: Flags
  orbitAxes: Flags
  orbitGrids: Flags
  globalWireframe: boolean
  globalAxes: boolean
  globalGrids: boolean
  isWireframe: (id: string) => boolean
  hasBodyAxes: (id: string) => boolean
  hasBodyGrid: (id: string) => boolean
  hasOrbitAxes: (id: string) => boolean
  hasOrbitGrid: (id: string) => boolean
  toggleWireframe: (id: string) => void
  toggleBodyAxes: (id: string) => void
  toggleBodyGrid: (id: string) => void
  toggleOrbitAxes: (id: string) => void
  toggleOrbitGrid: (id: string) => void
  toggleGlobalWireframe: (bodyIds: readonly string[]) => void
  toggleGlobalAxes: (bodyIds: readonly string[], orbitIds: readonly string[]) => void
  toggleGlobalGrids: (bodyIds: readonly string[], orbitIds: readonly string[]) => void
  reset: () => void
}

const initialState = {
  wireframe: {},
  bodyAxes: {},
  bodyGrids: {},
  orbitAxes: {},
  orbitGrids: {},
  globalWireframe: false,
  globalAxes: false,
  globalGrids: false,
}

function toggled(flags: Flags, id: string): Flags {
  return { ...flags, [id]: !flags[id] }
}

function forced(ids: readonly string[], value: boolean): Flags {
  return Object.fromEntries(ids.map((id) => [id, value]))
}

export const useDebugStore = create<DebugState>()((set, get) => ({
  ...initialState,
  isWireframe: (id) => get().wireframe[id] ?? false,
  hasBodyAxes: (id) => get().bodyAxes[id] ?? false,
  hasBodyGrid: (id) => get().bodyGrids[id] ?? false,
  hasOrbitAxes: (id) => get().orbitAxes[id] ?? false,
  hasOrbitGrid: (id) => get().orbitGrids[id] ?? false,
  toggleWireframe: (id) => set((state) => ({ wireframe: toggled(state.wireframe, id) })),
  toggleBodyAxes: (id) => set((state) => ({ bodyAxes: toggled(state.bodyAxes, id) })),
  toggleBodyGrid: (id) => set((state) => ({ bodyGrids: toggled(state.bodyGrids, id) })),
  toggleOrbitAxes: (id) => set((state) => ({ orbitAxes: toggled(state.orbitAxes, id) })),
  toggleOrbitGrid: (id) => set((state) => ({ orbitGrids: toggled(state.orbitGrids, id) })),
  toggleGlobalWireframe: (bodyIds) =>
    set((state) => {
      const value = !state.globalWireframe
      return { globalWireframe: value, wireframe: forced(bodyIds, value) }
    }),
  toggleGlobalAxes: (bodyIds, orbitIds) =>
    set((state) => {
      const value = !state.globalAxes
      return {
        globalAxes: value,
        bodyAxes: forced(bodyIds, value),
        orbitAxes: forced(orbitIds, value),
      }
    }),
  toggleGlobalGrids: (bodyIds, orbitIds) =>
    set((state) => {
      const value = !state.globalGrids
      return {
        globalGrids: value,
        bodyGrids: forced(bodyIds, value),
        orbitGrids: forced(orbitIds, value),
      }
    }),
  reset: () => set(initialState),
}))
