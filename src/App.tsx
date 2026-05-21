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
import GrowthPoolFlywheel from './components/GrowthPoolFlywheel'
import RightsSeatSandbox from './components/RightsSeatSandbox'
import EnterpriseScene from './components/EnterpriseScene'
import IdentityGuide from './components/IdentityGuide'
import CooperationRoadmap from './components/CooperationRoadmap'
import FutureProjection from './components/FutureProjection'
import StrategicArchive from './components/StrategicArchive'
import PresentationPlayer from './components/PresentationPlayer'
import EndingPage from './components/EndingPage'

const sectionComponents: Record<string, React.FC> = {
  strategic: StrategicOverview,
  architecture: ThreeLayerArchitecture,
  resources: ResourceWall,
  map: NationalMapStage,
  regionalModel: RegionalModel,
  machineRoom: MachineRoom3D,
  consumption: ConsumptionDemo,
  assetFlow: AssetFlowEngine,
  growthPool: GrowthPoolFlywheel,
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
  const { currentSection, introComplete, isPresentationMode } = useExhibitionStore()

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
      {isPresentationMode && <PresentationPlayer />}
    </div>
  )
}

export default App
