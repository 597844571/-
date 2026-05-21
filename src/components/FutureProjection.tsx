import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'
import futurePlanData from '../data/futurePlan.json'

export default function FutureProjection() {
  const { setSection } = useExhibitionStore()
  const [activePhase, setActivePhase] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)

  useEffect(() => {
    if (!autoPlay) return
    const timer = setInterval(() => {
      setActivePhase((p) => (p >= futurePlanData.length - 1 ? 0 : p + 1))
    }, 3500)
    return () => clearInterval(timer)
  }, [autoPlay])

  const currentPhase = futurePlanData[activePhase]

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative z-10 w-full max-w-5xl 3xl:max-w-6xl 4k:max-w-7xl px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-[11px] tracking-[0.4em] mb-3 uppercase font-medium" style={{ color: '#8a6fff90' }}>
            Future Projection
          </div>
          <h2
            className="text-3xl font-bold tracking-wider mb-2 text-text-main" style={{ textShadow: '0 0 24px rgba(138,111,255,0.25)' }}
          >
            全国生态未来推演
          </h2>
          <p className="text-sm text-text-sub">
            从区域试点到全国生态成型
          </p>
        </motion.div>

        {/* Phase selector */}
        <div className="flex justify-center gap-2 mb-8">
          {futurePlanData.map((phase, i) => (
            <button
              key={phase.id}
              onClick={() => {
                setActivePhase(i)
                setAutoPlay(false)
              }}
              className={`relative px-4 py-2 rounded-lg text-[10px] transition-all border ${activePhase === i ? '' : 'hover:text-text-sub hover:bg-white/[0.04]'}`}
              style={
                activePhase === i
                  ? {
                      background: 'var(--primary-purple)1E',
                      color: '#8a6fff',
                      borderColor: 'rgba(138, 111, 255, 0.35)',
                      boxShadow: '0 0 12px rgba(138,111,255,0.1)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.02)',
                      color: '#4a5a7a',
                      borderColor: 'transparent',
                    }
              }
            >
              阶段 {i + 1}
              {activePhase === i && (
                <motion.div
                  layoutId="phase-indicator-v13"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                  style={{ background: '#8a6fff' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Visual stage */}
          <div className="col-span-7">
            <div
              className="rounded-xl p-6 h-80 flex flex-col items-center justify-center relative overflow-hidden border"
              style={{
                background: 'rgba(15, 25, 48, 0.5)',
                borderColor: 'var(--border-purple)',
              }}
            >
              {/* Animated background */}
              <div className="absolute inset-0">
                {activePhase >= 0 && (
                  <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                  >
                    <div className="w-full h-full relative">
                      {Array.from({ length: 16 }).map((_, i) => {
                        const isLit = i <= activePhase * 2 + 3
                        return (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                              left: `${12 + (i % 4) * 22}%`,
                              top: `${18 + Math.floor(i / 4) * 22}%`,
                              background: isLit ? '#31f4ff' : 'rgba(111, 127, 159, 0.15)',
                              boxShadow: isLit ? '0 0 14px rgba(49,244,255,0.5)' : 'none',
                            }}
                            animate={{
                              scale: isLit ? [1, 1.3, 1] : 1,
                              opacity: isLit ? [0.5, 1, 0.5] : 0.2,
                            }}
                            transition={{
                              duration: 2 + i * 0.15,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />
                        )
                      })}
                      {/* Connection lines */}
                      {activePhase >= 1 && (
                        <svg className="absolute inset-0 w-full h-full">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <motion.line
                              key={i}
                              x1={`${18 + (i % 4) * 22}%`}
                              y1={`${22 + Math.floor(i / 4) * 22}%`}
                              x2={`${28 + ((i + 1) % 4) * 22}%`}
                              y2={`${22 + Math.floor((i + 1) / 4) * 22}%`}
                              stroke="rgba(49, 244, 255, 0.25)"
                              strokeWidth={1}
                              strokeDasharray="4 4"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1.5, delay: i * 0.15 }}
                            />
                          ))}
                        </svg>
                      )}
                      {/* Growth pool glow */}
                      {activePhase >= 4 && (
                        <motion.div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                          style={{
                            width: 70 + activePhase * 12,
                            height: 70 + activePhase * 12,
                            background: 'radial-gradient(circle, rgba(138,111,255,0.25) 0%, transparent 70%)',
                          }}
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Phase label */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPhase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="relative z-10 text-center"
                >
                  <div
                    className="text-6xl font-bold mb-3 text-primary-purple"
                    style={{ textShadow: '0 0 30px rgba(138,111,255,0.35)' }}
                  >
                    {String(activePhase + 1).padStart(2, '0')}
                  </div>
                  <div className="text-lg mb-2 text-text-sub">
                    {currentPhase.title}
                  </div>
                  <div className="text-xs max-w-sm text-text-muted">
                    {currentPhase.visual}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Description panel */}
          <div className="col-span-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhase.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-5 rounded-xl h-full border"
                style={{
                  background: 'var(--bg-panel-strong)',
                  backdropFilter: 'blur(20px)',
                  borderColor: 'var(--border-purple)',
                }}
              >
                <div className="text-[10px] mb-3 uppercase tracking-wider text-primary-purple">
                  阶段 {activePhase + 1} / {futurePlanData.length}
                </div>
                <h3 className="text-lg font-bold mb-4 text-text-main">
                  {currentPhase.title}
                </h3>
                <p className="text-sm leading-relaxed mb-6 text-text-sub">
                  {currentPhase.description}
                </p>

                {activePhase === 6 && (
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      background: 'rgba(246, 201, 107, 0.06)',
                      borderColor: 'rgba(246, 201, 107, 0.15)',
                    }}
                  >
                    <div className="text-[10px] mb-1" style={{ color: '#f6c96b90' }}>2026 规划目标</div>
<div className="text-2xl font-bold mb-1 text-accent-gold" style={{ textShadow: '0 0 12px rgba(246,201,107,0.25)' }}>
                      80,000 - 100,000
                    </div>
                    <div className="text-xs text-text-sub">消费算力会员规划</div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className="px-6 py-2.5 rounded-lg text-xs border transition-all hover:border-border-light/40"
            style={
              autoPlay
                ? {
                    background: 'var(--primary-purple)1E',
                    color: '#8a6fff',
                    borderColor: 'rgba(138, 111, 255, 0.35)',
                  }
                : {
                    background: 'rgba(255,255,255,0.02)',
                    color: '#6f7f9f',
                    borderColor: 'var(--border-light)',
                  }
            }
          >
            {autoPlay ? '暂停推演' : '启动全国生态未来推演'}
          </button>
          <button
            onClick={() => setSection('map')}
            className="px-5 py-2.5 rounded-lg text-xs border transition-all text-text-muted hover:text-text-sub hover:bg-white/[0.04] hover:border-border-light/40" style={{ borderColor: 'rgba(126,190,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
          >
            返回全国地图
          </button>
        </div>
      </div>
    </div>
  )
}
