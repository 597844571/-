import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useExhibitionStore } from './store/exhibitionStore'
import GlobalBackground from './components/GlobalBackground'
import IntroSequence from './components/IntroSequence'
import MainShell from './components/MainShell'
import StrategicOverview from './components/StrategicOverview'
import ThreeLayerArchitecture from './components/ThreeLayerArchitecture'
import ResourceWall from './components/ResourceWall'
import NationalMapStage from './components/NationalMapStage'
import RegionalModel from './components/RegionalModel'
import MachineRoom3D from './components/MachineRoom3D'
import ConsumptionDemo from './components/ConsumptionDemo'
import AssetFlowEngine from './components/AssetFlowEngine'
import RightsSeatSandbox from './components/RightsSeatSandbox'
import PartnerGrowthSandbox from './components/PartnerGrowthSandbox'
import EnterpriseScene from './components/EnterpriseScene'
import IdentityGuide from './components/IdentityGuide'
import CooperationRoadmap from './components/CooperationRoadmap'
import FutureProjection from './components/FutureProjection'
import StrategicArchive from './components/StrategicArchive'
import PresentationPlayer from './components/PresentationPlayer'
import EndingPage from './components/EndingPage'
import RoadshowDeck from './components/RoadshowDeck'
import { loadEffectiveScenario } from './utils/scenarioStorage'

const sectionComponents: Record<string, React.FC> = {
  strategic: StrategicOverview,
  architecture: ThreeLayerArchitecture,
  resources: ResourceWall,
  map: NationalMapStage,
  regionalModel: RegionalModel,
  machineRoom: MachineRoom3D,
  consumption: ConsumptionDemo,
  assetFlow: AssetFlowEngine,
  growthPool: PartnerGrowthSandbox,
  rights: RightsSeatSandbox,
  enterprise: EnterpriseScene,
  identityGuide: IdentityGuide,
  cooperation: CooperationRoadmap,
  future: FutureProjection,
  archive: StrategicArchive,
  ending: EndingPage,
}

function SectionWrapper({ sectionKey }: { sectionKey: string }) {
  const Component = sectionComponents[sectionKey]
  if (!Component) return null

  return (
    <motion.div
      key={sectionKey}
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.99 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full h-full"
    >
      <Component />
    </motion.div>
  )
}

function App() {
  const { currentSection, introComplete, isPresentationMode, showRoadshowDeck, setShowRoadshowDeck, setCurrentScenario } = useExhibitionStore()

  // 初始化：加载有效方案到 currentScenario
  useEffect(() => {
    setCurrentScenario(loadEffectiveScenario())
  }, [setCurrentScenario])

  // 全局快捷键：Ctrl+Shift+G 打开路演参数舱
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        e.preventDefault()
        setShowRoadshowDeck(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setShowRoadshowDeck])

  if (!introComplete) {
    return <IntroSequence />
  }

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'var(--bg-deep, #02040a)' }}>
      <GlobalBackground />
      <MainShell>
        <AnimatePresence mode="wait">
          <SectionWrapper sectionKey={currentSection} />
        </AnimatePresence>
      </MainShell>

      {/* 路演模式播放器 */}
      {isPresentationMode && <PresentationPlayer />}

      {/* 路演参数舱 */}
      <RoadshowDeck open={showRoadshowDeck} onClose={() => setShowRoadshowDeck(false)} />

      {/* 右下角参数舱触发齿轮（极低透明度） */}
      <button
        onClick={() => setShowRoadshowDeck(true)}
        className="fixed bottom-16 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full transition-all hover:opacity-60 opacity-0 hover:opacity-40"
        style={{
          color: 'var(--text-muted)',
        }}
        title="路演参数舱 (Ctrl+Shift+G)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  )
}

export default App
