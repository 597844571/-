import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'

const PRESENTATION_STEPS = [
  { section: 'strategic' as const, title: '数字经济进入算力时代', text: '数字经济进入算力时代，数据成为核心生产要素，区域需要新型数字基础设施。' },
  { section: 'map' as const, title: '神枢构建全国算力生态网络', text: '神枢以算力基础设施为底座，构建覆盖全国的算力资源网络。' },
  { section: 'machineRoom' as const, title: '算力基础设施提供底层支撑', text: '高标准数据机房、GPU服务器、网络交换和存储阵列，为数据资产生态提供底层支撑。' },
  { section: 'consumption' as const, title: '消费场景成为数据资产生成入口', text: '用户通过优选区、商城、本地生活等消费场景参与平台，每一次消费都成为数据资产积累的起点。' },
  { section: 'assetFlow' as const, title: '数据资产进入流通引擎', text: '消费生成数据资产，按规则释放后进入交易、出金、分成和增长池支撑路径。' },
  { section: 'growthPool' as const, title: '增长池驱动生态价值循环', text: '消费生态与算力收益共同注入增长池，推动数据资产、合作伙伴和区域生态形成持续循环。' },
  { section: 'rights' as const, title: '合伙人与区域代理推动全国布局', text: '平台通过多层级权益体系，连接普通会员到区域代理，共同推动全国生态布局。' },
  { section: 'future' as const, title: '从区域样板走向全国生态', text: '从核心区域试点到全国算力生态网络成型，神枢将逐步构建面向全国的数字算力价值网络。' },
]

export default function PresentationPlayer() {
  const {
    isPresentationMode,
    setPresentationMode,
    setPresentationStep,
    isPresentationPaused,
    setPresentationPaused,
    setSection,
  } = useExhibitionStore()

  const [localStep, setLocalStep] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentStep = PRESENTATION_STEPS[localStep]

  useEffect(() => {
    if (!isPresentationMode || isPresentationPaused) return

    timerRef.current = setTimeout(() => {
      if (localStep < PRESENTATION_STEPS.length - 1) {
        const next = localStep + 1
        setLocalStep(next)
        setPresentationStep(next)
        setSection(PRESENTATION_STEPS[next].section)
      } else {
        // End of presentation
        setPresentationMode(false)
        setSection('ending')
      }
    }, 15000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [localStep, isPresentationMode, isPresentationPaused, setPresentationStep, setPresentationMode, setSection])

  useEffect(() => {
    if (isPresentationMode) {
      setLocalStep(0)
      setPresentationStep(0)
      setSection(PRESENTATION_STEPS[0].section)
    }
  }, [isPresentationMode, setPresentationStep, setSection])

  const handleSkip = () => {
    if (localStep < PRESENTATION_STEPS.length - 1) {
      const next = localStep + 1
      setLocalStep(next)
      setPresentationStep(next)
      setSection(PRESENTATION_STEPS[next].section)
    } else {
      setPresentationMode(false)
      setSection('ending')
    }
  }

  const handleRestart = () => {
    setLocalStep(0)
    setPresentationStep(0)
    setSection(PRESENTATION_STEPS[0].section)
  }

  if (!isPresentationMode) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[60] pointer-events-none"
      >
        {/* Narration panel */}
        <motion.div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-auto"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-panel-strong rounded-xl px-8 py-5 min-w-[600px] max-w-[800px]">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] text-primary-blue tracking-wider">
                {String(localStep + 1).padStart(2, '0')} / {String(PRESENTATION_STEPS.length).padStart(2, '0')}
              </span>
              <span className="text-xs font-bold text-text-main">{currentStep?.title}</span>
              {isPresentationPaused && (
                <span className="px-2 py-0.5 rounded text-[9px] bg-accent-gold/10 text-accent-gold border border-accent-gold/20">
                  已暂停
                </span>
              )}
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={localStep}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-sm text-text-secondary leading-relaxed"
              >
                {currentStep?.text}
              </motion.p>
            </AnimatePresence>

            {/* Progress bar */}
            <div className="mt-4 h-0.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary-blue"
                initial={{ width: 0 }}
                animate={{ width: `${((localStep + 1) / PRESENTATION_STEPS.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => setPresentationPaused(!isPresentationPaused)}
                className="px-4 py-1.5 rounded-lg glass-panel text-[10px] text-text-secondary border border-border-light hover:text-text-main transition-all"
              >
                {isPresentationPaused ? '继续' : '暂停'}
              </button>
              <button
                onClick={handleSkip}
                className="px-4 py-1.5 rounded-lg glass-panel text-[10px] text-text-secondary border border-border-light hover:text-text-main transition-all"
              >
                跳过当前章节
              </button>
              <button
                onClick={handleRestart}
                className="px-4 py-1.5 rounded-lg glass-panel text-[10px] text-text-secondary border border-border-light hover:text-text-main transition-all"
              >
                重新播放
              </button>
              <button
                onClick={() => {
                  setPresentationMode(false)
                  setSection('map')
                }}
                className="px-4 py-1.5 rounded-lg glass-panel text-[10px] text-red-400 border border-red-400/20 hover:border-red-400/40 transition-all"
              >
                退出讲解模式
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
