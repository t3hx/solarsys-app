/**
 * @module store/interaction
 * @description Etat des interactions : corps survole, corps selectionne, suivi camera et
 * vue tactique. Seule source de verite, sans objet Three (les meshes sont dans le registre).
 *
 * Regles :
 * - le survol est ignore tant qu'un corps est selectionne ;
 * - selectionner (ou deselectionner) coupe le suivi et quitte la vue tactique ; re-selectionner
 *   le corps deja selectionne ne change rien (sinon un clic en fin de glissement sur le corps
 *   suivi couperait le suivi), sauf quitter la vue tactique ;
 * - le suivi n'est actif que si un corps est selectionne (bascule par CameraRig en fin
 *   d'animation de focus) ;
 * - entrer en vue tactique suspend le suivi, CameraRig le restaure a la sortie ;
 * - `tacticalReady` ne devient vrai qu'a la fin de la transition camera (pose par
 *   CameraRig) et retombe des qu'on quitte la vue tactique : les habillages tactiques
 *   (couleurs, etiquettes) n'apparaissent qu'une fois la vue en place ;
 * - la fenetre d'information n'existe que pour un corps selectionne ; elle et la fenetre
 *   « a propos » s'excluent mutuellement, et selectionner un corps ferme « a propos ».
 */
import { create } from 'zustand'

export interface InteractionState {
  hoveredId: string | null
  selectedId: string | null
  isFollowing: boolean
  isTactical: boolean
  /** Vrai une fois la transition camera de la vue tactique terminee */
  tacticalReady: boolean
  infoOpen: boolean
  aboutOpen: boolean
  hover: (id: string | null) => void
  select: (id: string | null) => void
  setFollowing: (following: boolean) => void
  setTactical: (tactical: boolean) => void
  setTacticalReady: (ready: boolean) => void
  toggleTactical: () => void
  setInfoOpen: (open: boolean) => void
  setAboutOpen: (open: boolean) => void
  reset: () => void
}

const initialState = {
  hoveredId: null,
  selectedId: null,
  isFollowing: false,
  isTactical: false,
  tacticalReady: false,
  infoOpen: false,
  aboutOpen: false,
}

export const useInteractionStore = create<InteractionState>()((set, get) => ({
  ...initialState,
  hover: (id) => {
    if (get().selectedId !== null) return
    if (get().hoveredId !== id) set({ hoveredId: id })
  },
  select: (id) => {
    if (id !== null && id === get().selectedId) {
      if (get().isTactical) set({ isTactical: false, tacticalReady: false })
      return
    }
    set({
      selectedId: id,
      hoveredId: null,
      isFollowing: false,
      isTactical: false,
      tacticalReady: false,
      infoOpen: false,
      aboutOpen: false,
    })
  },
  setFollowing: (following) => {
    if (following && get().selectedId === null) return
    set({ isFollowing: following })
  },
  setTactical: (tactical) => set({ isTactical: tactical, tacticalReady: false }),
  setTacticalReady: (ready) => {
    if (ready && !get().isTactical) return
    set({ tacticalReady: ready })
  },
  toggleTactical: () =>
    set((state) =>
      state.isTactical
        ? { isTactical: false, tacticalReady: false }
        : { isTactical: true, tacticalReady: false, isFollowing: false },
    ),
  setInfoOpen: (open) => {
    if (open && get().selectedId === null) return
    set(open ? { infoOpen: true, aboutOpen: false } : { infoOpen: false })
  },
  setAboutOpen: (open) => set(open ? { aboutOpen: true, infoOpen: false } : { aboutOpen: false }),
  reset: () => set(initialState),
}))
