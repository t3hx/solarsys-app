/**
 * @module store/interaction
 * @description Etat des interactions : corps survole, corps selectionne, suivi camera et
 * vue tactique. Seule source de verite, sans objet Three (les meshes sont dans le registre).
 *
 * Regles :
 * - le survol est ignore tant qu'un corps est selectionne ;
 * - selectionner (ou deselectionner) coupe le suivi et quitte la vue tactique ;
 * - le suivi n'est actif que si un corps est selectionne (bascule par CameraRig en fin
 *   d'animation de focus) ;
 * - entrer en vue tactique suspend le suivi, CameraRig le restaure a la sortie.
 */
import { create } from 'zustand'

export interface InteractionState {
  hoveredId: string | null
  selectedId: string | null
  isFollowing: boolean
  isTactical: boolean
  hover: (id: string | null) => void
  select: (id: string | null) => void
  setFollowing: (following: boolean) => void
  setTactical: (tactical: boolean) => void
  toggleTactical: () => void
  reset: () => void
}

const initialState = {
  hoveredId: null,
  selectedId: null,
  isFollowing: false,
  isTactical: false,
}

export const useInteractionStore = create<InteractionState>()((set, get) => ({
  ...initialState,
  hover: (id) => {
    if (get().selectedId !== null) return
    if (get().hoveredId !== id) set({ hoveredId: id })
  },
  select: (id) => set({ selectedId: id, hoveredId: null, isFollowing: false, isTactical: false }),
  setFollowing: (following) => {
    if (following && get().selectedId === null) return
    set({ isFollowing: following })
  },
  setTactical: (tactical) => set({ isTactical: tactical }),
  toggleTactical: () =>
    set((state) =>
      state.isTactical ? { isTactical: false } : { isTactical: true, isFollowing: false },
    ),
  reset: () => set(initialState),
}))
