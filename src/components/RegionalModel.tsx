import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'

const PHASES = [
  {
    id: 0,
    title: '浙江样板',
    desc: '以浙江为核心，打通算力节点、消费生态、服务网点和数据资产流通规则',
    regions: ['浙江'],
    color: '#4ab8ff',
  },
  {
    id: 1,
    title: '长三角复制',
    desc: '将浙江样板向江苏、上海等长三角区域复制，形成区域协同',
    regions: ['浙江', '江苏', '上海'],
    color: '#31f4ff',
  },
  {
    id: 2,
    title: '华南拓展',
    desc: '向广东、深圳等华南重点区域拓展，接入算力节点和消费场景',
    regions: ['浙江', '江苏', '上海', '广东', '深圳'],
    color: '#7c5cff',
  },
  {
    id: 3,
    title: '华中联动',
    desc: '华中地区接入，形成东西联动格局',
    regions: ['浙江', '江苏', '上海', '广东', '深圳', '湖北', '河南'],
    color: '#4ab8ff',
  },
  {
    id: 4,
    title: '西南协同',
    desc: '西南地区协同接入，扩大全国覆盖',
    regions: ['浙江', '江苏', '上海', '广东', '深圳', '湖北', '河南', '四川', '重庆'],
    color: '#31f4ff',
  },
  {
    id: 5,
    title: '全国网络成型',
    desc: '全国算力节点、消费场景、数据资产流转和区域合作体系形成完整网络',
    regions: ['浙江', '江苏', '上海', '广东', '深圳', '湖北', '河南', '四川', '重庆', '北京', '西安'],
    color: '#7c5cff',
  },
]

const REGION_COORDS: Record<string, { x: number; y: number }> = {
  '北京': { x: 58, y: 22 },
  '浙江': { x: 75, y: 55 },
  '江苏': { x: 72, y: 48 },
  '上海': { x: 78, y: 52 },
  '广东': { x: 65, y: 75 },
  '深圳': { x: 68, y: 78 },
  '湖北': { x: 60, y: 55 },
  '河南': { x: 58, y: 42 },
  '四川': { x: 42, y: 55 },
  '重庆': { x: 45, y: 58 },
  '西安': { x: 48, y: 42 },
}

export default function RegionalModel() {
  const { setSection, regionalPhase, setRegionalPhase } = useExhibitionStore()
  const [activePhase, setActivePhase] = useState(regionalPhase)
  const [autoPlay, setAutoPlay] = useState(false)

  useEffect(() => {
    if (!autoPlay) return
    const timer = setInterval(() => {
      setActivePhase((p) => {
        const next = p >= PHASES.length - 1 ? 0 : p + 1
        setRegionalPhase(next)
        return next
      })
    }, 2500)
    return () => clearInterval(timer)
  }, [autoPlay, setRegionalPhase])

  const phase = PHASES[activePhase]
  const activeRegions = phase?.regions || []

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative z-10 w-full max-w-5xl 3xl:max-w-6xl 4k:max-w-7xl px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-xs text-primary-cyan tracking-[0.4em] mb-3 uppercase">
            Regional Model
          </div>
          <h2 className="text-3xl font-bold text-glow-blue tracking-wider mb-2">
            区域样板推演
          </h2>
          <p className="text-sm text-text-sub">
            从浙江样板出发，逐步构建全国数字算力生态网络
          </p>
        </motion.div>

        <div className="grid grid-cols-12 gap-6">
          {/* Map visualization */}
          <div className="col-span-7">
            <div className="glass-panel-strong rounded-xl p-6 h-80 relative overflow-hidden">
              {/* Simplified China map background */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-20">
                <path
                  d="M20,25 Q30,15 45,20 T65,18 T80,25 T85,40 T82,55 T75,70 T65,80 T50,82 T35,78 T25,65 T18,50 T20,25Z"
                  fill="none"
                  stroke="#4ab8ff"
                  strokeWidth="0.3"
                />
              </svg>

              {/* Region nodes */}
              {Object.entries(REGION_COORDS).map(([name, coord]) => {
                const isActive = activeRegions.includes(name)
                const wasActive = PHASES.slice(0, activePhase)
                  .some((p) => p.regions.includes(name))
                return (
                  <motion.div
                    key={name}
                    className="absolute"
                    style={{
                      left: `${coord.x}%`,
                      top: `${coord.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    animate={{
                      scale: isActive ? [1, 1.06, 1] : 1,
                      opacity: isActive ? [0.7, 1, 0.7] : wasActive ? 0.5 : 0.2,
                    }}
                    transition={{ duration: 2.5, repeat: isActive ? Infinity : 0, ease: 'easeInOut' }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: isActive ? phase?.color : wasActive ? '#4ab8ff60' : '#4ab8ff20',
                        boxShadow: isActive
                          ? `0 0 15px ${phase?.color}80`
                          : wasActive
                          ? '0 0 8px rgba(74,184,255,0.3)'
                          : 'none',
                      }}
                    />
                    <div
                      className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] whitespace-nowrap"
                      style={{ color: isActive ? phase?.color : '#6f7f9f60' }}
                    >
                      {name}
                    </div>
                  </motion.div>
                )
              })}

              {/* Phase label */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase?.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-4 left-4"
                >
                  <div className="text-[10px] text-primary-blue mb-1">
                    PHASE {String(activePhase + 1).padStart(2, '0')}
                  </div>
                  <div className="text-sm font-bold text-text-main">{phase?.title}</div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Phase controls */}
          <div className="col-span-5">
            <div className="space-y-2">
              {PHASES.map((p) => {
                const isActive = activePhase === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePhase(p.id)
                      setRegionalPhase(p.id)
                      setAutoPlay(false)
                    }}
                    className={`w-full text-left p-3 rounded-lg text-xs transition-all border ${
                      isActive
                        ? 'bg-primary-blue/10 border-primary-blue/30'
                        : 'bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                        style={{
                          background: isActive ? p.color + '30' : 'rgba(255,255,255,0.05)',
                          color: isActive ? p.color : '#6f7f9f',
                        }}
                      >
                        {p.id + 1}
                      </span>
                      <span className={isActive ? 'text-text-main font-medium' : 'text-text-sub'}>
                        {p.title}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`w-full mt-4 py-2.5 rounded-lg text-xs border transition-all ${
                autoPlay
                  ? 'bg-primary-blue/15 text-primary-blue border-primary-blue/40'
                  : 'glass-panel text-text-secondary border-border-light hover:text-text-main'
              }`}
            >
              {autoPlay ? '暂停推演' : '启动区域样板推演'}
            </button>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setSection('map')}
            className="px-6 py-2.5 rounded-lg glass-panel text-text-secondary text-xs border border-border-light hover:text-text-main transition-all"
          >
            返回全国地图
          </button>
          <button
            onClick={() => setSection('future')}
            className="px-6 py-2.5 rounded-lg glass-panel text-primary-cyan text-xs border border-primary-cyan/30 hover:border-primary-cyan/60 transition-all"
          >
            全国生态未来推演
          </button>
        </div>
      </div>
    </div>
  )
}
