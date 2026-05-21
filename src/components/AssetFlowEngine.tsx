import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'
import assetFlowData from '../data/assetFlow.json'
import { IconConsume, IconAsset, IconRelease, IconTrade, IconFlash, IconTransfer, IconCashout, IconFee, IconBurn, IconPool } from './ExhibitionIcons'

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  consume: IconConsume,
  asset: IconAsset,
  release: IconRelease,
  trade: IconTrade,
  flash_swap: IconFlash,
  transfer: IconTransfer,
  cashout: IconCashout,
  fee_share: IconFee,
  burn: IconBurn,
  growth_pool: IconPool,
}

const FLOW_STEPS = [
  { id: 'consume', label: '用户消费', x: 0, y: 0 },
  { id: 'asset', label: '获得数据资产', x: 1, y: 0 },
  { id: 'release', label: '每日释放', x: 2, y: 0 },
  { id: 'trade', label: '交易账户', x: 3, y: 0 },
  { id: 'flash_swap', label: '闪兑卖出', x: 4, y: -1 },
  { id: 'transfer', label: '内部互转', x: 4, y: 0 },
  { id: 'cashout', label: '银行卡出金', x: 4, y: 1 },
  { id: 'fee_share', label: '手续费分成', x: 3, y: 1.5 },
  { id: 'burn', label: '通缩销毁', x: 2, y: 1.5 },
  { id: 'growth_pool', label: '增长池支撑', x: 1.5, y: 2.5 },
]

const CONNECTIONS = [
  ['consume', 'asset'],
  ['asset', 'release'],
  ['release', 'trade'],
  ['trade', 'flash_swap'],
  ['trade', 'transfer'],
  ['trade', 'cashout'],
  ['cashout', 'fee_share'],
  ['flash_swap', 'fee_share'],
  ['fee_share', 'burn'],
  ['fee_share', 'growth_pool'],
  ['burn', 'growth_pool'],
]

export default function AssetFlowEngine() {
  const { setSection } = useExhibitionStore()
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [currentRunStep, setCurrentRunStep] = useState(0)
  const runTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runSequence = [
    'consume', 'asset', 'release', 'trade',
    'flash_swap', 'fee_share', 'burn', 'growth_pool'
  ]

  const startFlow = () => {
    setRunning(true)
    setCurrentRunStep(0)
  }

  useEffect(() => {
    if (!running) return
    if (currentRunStep >= runSequence.length) {
      setRunning(false)
      return
    }
    setActiveStep(runSequence[currentRunStep])
    runTimer.current = setTimeout(() => {
      setCurrentRunStep((s) => s + 1)
    }, 1200)
    return () => {
      if (runTimer.current) clearTimeout(runTimer.current)
    }
  }, [running, currentRunStep])

  const selectedNode = assetFlowData.find((n) => n.id === activeStep)

  // Grid layout positions
  const getPos = (id: string) => {
    const step = FLOW_STEPS.find((s) => s.id === id)
    if (!step) return { x: 0, y: 0 }
    return {
      x: 12 + step.x * 22,
      y: 20 + step.y * 22,
    }
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative z-10 w-full max-w-6xl px-8">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-glow-blue tracking-wider mb-2">
            数据资产流转引擎
          </h2>
          <p className="text-sm text-text-muted">
            消费、数据资产、释放、交易、出金、手续费分成、销毁、增长池之间的关系
          </p>
        </div>

        {/* Control buttons */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={startFlow}
            disabled={running}
            className="px-6 py-2.5 rounded-lg bg-primary-blue/15 text-primary-blue text-xs border border-primary-blue/40 hover:bg-primary-blue/25 transition-all disabled:opacity-50"
          >
            {running ? '流转中...' : '启动一次资产流转'}
          </button>
          <button
            onClick={() => setActiveStep('release')}
            className="px-5 py-2.5 rounded-lg glass-panel text-text-secondary text-xs border border-border-light hover:text-text-main transition-all"
          >
            查看释放规则
          </button>
          <button
            onClick={() => setActiveStep('cashout')}
            className="px-5 py-2.5 rounded-lg glass-panel text-text-secondary text-xs border border-border-light hover:text-text-main transition-all"
          >
            查看出金路径
          </button>
        </div>

        {/* Flow diagram */}
        <div className="relative glass-panel rounded-xl p-8" style={{ minHeight: 420 }}>
          <svg className="absolute inset-0 w-full h-full" style={{ minHeight: 420 }}>
            {/* Connections */}
            {CONNECTIONS.map(([from, to]) => {
              const p1 = getPos(from)
              const p2 = getPos(to)
              const isActive = running && runSequence.slice(0, currentRunStep).includes(from)
              return (
                <motion.line
                  key={`${from}-${to}`}
                  x1={`${p1.x}%`}
                  y1={`${p1.y}%`}
                  x2={`${p2.x}%`}
                  y2={`${p2.y}%`}
                  stroke={isActive ? '#38f2ff' : 'rgba(74, 184, 255, 0.15)'}
                  strokeWidth={isActive ? 2 : 1}
                  strokeDasharray={isActive ? '6 4' : '4 4'}
                  className={isActive ? 'data-flow' : ''}
                />
              )
            })}
          </svg>

          {/* Nodes */}
          {FLOW_STEPS.map((step) => {
            const pos = getPos(step.id)
            const isActive = activeStep === step.id
            const wasActive = running && runSequence.slice(0, currentRunStep).includes(step.id)
            return (
              <motion.div
                key={step.id}
                className="absolute"
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => setActiveStep(step.id === activeStep ? null : step.id)}
                  className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                    isActive || wasActive
                      ? 'bg-primary-blue/15 border border-primary-blue/50 glow-blue'
                      : 'bg-bg-panel border border-border-light hover:border-primary-blue/30'
                  }`}
                >
                  {(() => {
                    const IconComp = ICON_MAP[step.id]
                    return IconComp ? <div className="text-primary-blue"><IconComp className="w-5 h-5" /></div> : null
                  })()}
                  <span className="text-[10px] text-text-secondary whitespace-nowrap">
                    {step.label}
                  </span>
                  {(isActive || wasActive) && (
                    <motion.div
                      className="absolute -inset-1 rounded-xl border border-primary-blue/30"
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-4 glass-panel-strong rounded-xl p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-primary-blue mb-1">
                    {selectedNode.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {selectedNode.description}
                  </p>
                </div>
                <button
                  onClick={() => setActiveStep(null)}
                  className="text-text-muted hover:text-text-main"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex gap-4">
        <button
          onClick={() => setSection('consumption')}
          className="glass-panel px-5 py-2 rounded-lg text-xs text-text-secondary border border-border-light hover:text-text-main transition-all"
        >
          返回消费权益
        </button>
        <button
          onClick={() => setSection('growthPool')}
          className="glass-panel px-5 py-2 rounded-lg text-xs text-primary-cyan border border-primary-cyan/30 hover:border-primary-cyan/60 transition-all"
        >
          增长池与生态飞轮
        </button>
      </div>
    </div>
  )
}
