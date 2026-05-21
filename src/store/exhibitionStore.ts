import { create } from 'zustand'

export type ExhibitionSection =
  | 'intro'
  | 'strategic'
  | 'architecture'
  | 'resources'
  | 'map'
  | 'regionalModel'
  | 'machineRoom'
  | 'consumption'
  | 'assetFlow'
  | 'growthPool'
  | 'rights'
  | 'enterprise'
  | 'identityGuide'
  | 'cooperation'
  | 'future'
  | 'archive'
  | 'ending'

export type MapMode =
  | 'nodes'
  | 'heat'
  | 'cooperation'
  | 'growth'
  | 'future'

export type IdentityType =
  | 'member'
  | 'team_leader'
  | 'partner_10000'
  | 'partner_30000'
  | 'partner_50000'
  | 'cofounder'
  | 'regional_agent'

export type ViewerIdentity =
  | 'leader'
  | 'enterprise'
  | 'partner'
  | 'user'
  | 'merchant'
  | 'agent'
  | 'cofounder_viewer'

export type ExhibitionMode = 'client' | 'presenter'

export interface ExhibitionState {
  // Navigation
  currentSection: ExhibitionSection
  previousSection: ExhibitionSection | null
  setSection: (section: ExhibitionSection) => void
  goBack: () => void

  // Map
  mapMode: MapMode
  setMapMode: (mode: MapMode) => void
  selectedRegion: string | null
  setSelectedRegion: (region: string | null) => void
  selectedMachineRoom: string | null
  setSelectedMachineRoom: (room: string | null) => void

  // Machine Room
  selectedHardware: string | null
  setSelectedHardware: (hw: string | null) => void
  showMachineDocs: boolean
  setShowMachineDocs: (show: boolean) => void

  // Consumption
  consumptionScene: string | null
  setConsumptionScene: (scene: string | null) => void
  consumptionAmount: number | null
  setConsumptionAmount: (amount: number | null) => void

  // Identity
  currentIdentity: IdentityType
  setCurrentIdentity: (identity: IdentityType) => void

  // Viewer identity guide
  viewerIdentity: ViewerIdentity | null
  setViewerIdentity: (identity: ViewerIdentity | null) => void

  // Enterprise scene
  enterpriseType: string | null
  setEnterpriseType: (type: string | null) => void

  // Future projection
  futurePhase: number
  setFuturePhase: (phase: number) => void

  // Presentation mode
  isPresentationMode: boolean
  setPresentationMode: (active: boolean) => void
  presentationStep: number
  setPresentationStep: (step: number) => void
  isPresentationPaused: boolean
  setPresentationPaused: (paused: boolean) => void

  // Exhibition mode: client / presenter
  exhibitionMode: ExhibitionMode
  setExhibitionMode: (mode: ExhibitionMode) => void
  showPresenterDrawer: boolean
  setShowPresenterDrawer: (show: boolean) => void

  // Intro
  introComplete: boolean
  setIntroComplete: (complete: boolean) => void

  // Three-layer architecture
  activeLayer: number
  setActiveLayer: (layer: number) => void

  // Regional model
  regionalPhase: number
  setRegionalPhase: (phase: number) => void

  // Cooperation roadmap
  roadmapPhase: number
  setRoadmapPhase: (phase: number) => void

  // Archive
  selectedArchive: string | null
  setSelectedArchive: (archive: string | null) => void
}

export const useExhibitionStore = create<ExhibitionState>((set) => ({
  currentSection: 'intro',
  previousSection: null,
  setSection: (section) =>
    set((state) => ({
      previousSection: state.currentSection,
      currentSection: section,
    })),
  goBack: () =>
    set((state) => ({
      currentSection: state.previousSection ?? 'map',
      previousSection: null,
    })),

  mapMode: 'nodes',
  setMapMode: (mode) => set({ mapMode: mode }),
  selectedRegion: null,
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  selectedMachineRoom: null,
  setSelectedMachineRoom: (room) => set({ selectedMachineRoom: room }),

  selectedHardware: null,
  setSelectedHardware: (hw) => set({ selectedHardware: hw }),
  showMachineDocs: false,
  setShowMachineDocs: (show) => set({ showMachineDocs: show }),

  consumptionScene: null,
  setConsumptionScene: (scene) => set({ consumptionScene: scene }),
  consumptionAmount: null,
  setConsumptionAmount: (amount) => set({ consumptionAmount: amount }),

  currentIdentity: 'member',
  setCurrentIdentity: (identity) => set({ currentIdentity: identity }),

  viewerIdentity: null,
  setViewerIdentity: (identity) => set({ viewerIdentity: identity }),

  enterpriseType: null,
  setEnterpriseType: (type) => set({ enterpriseType: type }),

  futurePhase: 0,
  setFuturePhase: (phase) => set({ futurePhase: phase }),

  isPresentationMode: false,
  setPresentationMode: (active) => set({ isPresentationMode: active, presentationStep: active ? 0 : -1 }),
  presentationStep: -1,
  setPresentationStep: (step) => set({ presentationStep: step }),
  isPresentationPaused: false,
  setPresentationPaused: (paused) => set({ isPresentationPaused: paused }),

  exhibitionMode: 'client',
  setExhibitionMode: (mode) => set({ exhibitionMode: mode }),
  showPresenterDrawer: false,
  setShowPresenterDrawer: (show) => set({ showPresenterDrawer: show }),

  introComplete: false,
  setIntroComplete: (complete) => set({ introComplete: complete }),

  activeLayer: 0,
  setActiveLayer: (layer) => set({ activeLayer: layer }),

  regionalPhase: 0,
  setRegionalPhase: (phase) => set({ regionalPhase: phase }),

  roadmapPhase: 0,
  setRoadmapPhase: (phase) => set({ roadmapPhase: phase }),

  selectedArchive: null,
  setSelectedArchive: (archive) => set({ selectedArchive: archive }),
}))
