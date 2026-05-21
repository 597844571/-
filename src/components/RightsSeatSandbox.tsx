import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'
import rightsData from '../data/rights.json'

const IDENTITIES = [
  { key: 'member', label: '普通会员', color: '#4ab8ff' },
  { key: 'team_leader', label: '团队长', color: '#31f4ff' },
  { key: 'partner_10000', label: '1万合伙人', color: '#6a8fff' },
  { key: 'partner_30000', label: '3万合伙人', color: '#8a6fff' },
  { key: 'partner_50000', label: '5万合伙人', color: '#a85cff' },
  { key: 'cofounder', label: '联合创始人', color: '#f6c96b' },
  { key: 'regional_agent', label: '区域代理', color: '#ff9d4c' },
]

export default function RightsSeatSandbox() {
  const { currentIdentity, setCurrentIdentity, setSection } = useExhibitionStore()
  const [showDetail, setShowDetail] = useState(false)
  const identity = rightsData.find((r) => r.id === currentIdentity)
  const identityIndex = IDENTITIES.findIndex((i) => i.key === currentIdentity)

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative z-10 w-full max-w-6xl px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-[11px] tracking-[0.4em] mb-3 uppercase font-medium" style={{ color: '#f6c96b90' }}>
            Rights Seat Sandbox
          </div>
          <h2
            className="text-3xl font-bold tracking-wider mb-2 text-text-main" style={{ textShadow: '0 0 24px rgba(246,201,107,0.2)' }}
          >
            权益席位沙盘
          </h2>
          <p className="text-sm text-text-sub">
            多层级权益体系可视化
          </p>
        </motion.div>

        <div className="grid grid-cols-12 gap-8">
          {/* Seat rings visualization */}
          <div className="col-span-7 flex justify-center items-center">
            <div className="relative" style={{ width: 400, height: 400 }}>
              {/* Animated rings */}
              {IDENTITIES.map((_, i) => {
                const radius = 36 + i * 24
                const isActive = i <= identityIndex
                return (
                  <motion.div
                    key={i}
                    className="absolute rounded-full border"
                    style={{
                      width: radius * 2,
                      height: radius * 2,
                      left: 200 - radius,
                      top: 200 - radius,
                      borderColor: isActive ? IDENTITIES[i].color + '35' : 'rgba(111, 127, 159, 0.08)',
                      borderWidth: isActive ? 1.5 : 1,
                      boxShadow: isActive ? `0 0 ${14 + i * 2}px ${IDENTITIES[i].color}20` : 'none',
                    }}
                    animate={{
                      scale: isActive ? [1, 1.015, 1] : 1,
                    }}
                    transition={{
                      duration: 2.5 + i * 0.3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )
              })}

              {/* Center core */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(74,184,255,0.15), rgba(138,111,255,0.15))',
                    border: '1px solid rgba(74,184,255,0.25)',
                    boxShadow: '0 0 30px rgba(74,184,255,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="text-center">
                    <div className="text-[11px] font-bold text-text-main">神枢</div>
                    <div className="text-[9px] text-text-muted">算力权益通</div>
                  </div>
                </motion.div>
              </div>

              {/* Node labels */}
              {IDENTITIES.map((id, i) => {
                const radius = 36 + i * 24
                const angle = -90 + i * 23
                const rad = (angle * Math.PI) / 180
                const x = 200 + Math.cos(rad) * (radius + 18)
                const y = 200 + Math.sin(rad) * (radius + 18)
                const isActive = i <= identityIndex
                return (
                  <motion.button
                    key={id.key}
                    className="absolute text-[9px] whitespace-nowrap px-2 py-1 rounded-md border transition-all"
                    style={{
                      left: x,
                      top: y,
                      transform: 'translate(-50%, -50%)',
                      color: isActive ? id.color : '#4a5a7a',
                      borderColor: isActive ? id.color + '30' : 'transparent',
                      background: isActive ? id.color + '08' : 'transparent',
                    }}
                    onClick={() => {
                      setCurrentIdentity(id.key as any)
                      setShowDetail(true)
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {id.label}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Identity selector & details */}
          <div className="col-span-5 space-y-4">
            {/* Identity tabs */}
            <div
              className="rounded-xl p-4 border"
              style={{
                background: 'var(--bg-panel)',
                backdropFilter: 'blur(16px)',
                borderColor: 'var(--border-light)',
              }}
            >
              <div className="text-[10px] tracking-wider mb-3 uppercase text-text-muted">选择身份</div>
              <div className="flex flex-wrap gap-1.5">
                {IDENTITIES.map((id) => (
                  <button
                    key={id.key}
                    onClick={() => {
                      setCurrentIdentity(id.key as any)
                      setShowDetail(true)
                    }}
                    className="px-3 py-1.5 rounded-lg text-[10px] transition-all border"
                    style={
                      currentIdentity === id.key
                        ? {
                            background: id.color + '12',
                            color: id.color,
                            borderColor: id.color + '35',
                            boxShadow: `0 0 12px ${id.color}15`,
                          }
                        : {
                            background: 'rgba(255,255,255,0.03)',
                            color: '#6f7f9f',
                            borderColor: 'transparent',
                          }
                    }
                    onMouseEnter={(e) => {
                      if (currentIdentity !== id.key) {
                        e.currentTarget.style.background = id.color + '06'
                        e.currentTarget.style.color = '#b0c4e8'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentIdentity !== id.key) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                        e.currentTarget.style.color = '#6f7f9f'
                      }
                    }}
                  >
                    {id.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Detail card */}
            <AnimatePresence mode="wait">
              {identity && showDetail && (
                <motion.div
                  key={identity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-5 rounded-xl border"
                  style={{
                    background: 'var(--bg-panel-strong)',
                    backdropFilter: 'blur(20px)',
                    borderColor: IDENTITIES[identityIndex]?.color + '25' || 'rgba(126,190,255,0.15)',
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold mb-1" style={{ color: IDENTITIES[identityIndex]?.color || '#f0f4ff' }}>
                        {identity.name}
                      </h3>
                      <p className="text-xs text-text-muted">{identity.subtitle}</p>
                    </div>
                    {identity.seats && identity.seats !== '不限' && (
                      <span
                        className="px-2 py-1 rounded text-[10px] border text-accent-gold"
                        style={{ borderColor: 'rgba(246,201,107,0.2)',
                          background: 'rgba(246,201,107,0.06)' }}
                      >
                        {identity.seats}
                      </span>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="text-[10px] mb-1 uppercase tracking-wider text-text-muted">门槛</div>
                    <div className="text-xs text-text-sub">{identity.threshold}</div>
                  </div>

                  <div>
                    <div className="text-[10px] mb-2 uppercase tracking-wider text-text-muted">权益</div>
                    <div className="space-y-1.5">
                      {identity.benefits.map((b, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-2 text-xs text-text-sub"
                        >
                          <span
                            className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                            style={{ background: IDENTITIES[identityIndex]?.color || '#4ab8ff' }}
                          />
                          {b}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setSection('growthPool')}
            className="px-5 py-2 rounded-lg text-xs border transition-all text-text-muted hover:text-text-sub hover:bg-white/[0.04] hover:border-border-light/40" style={{ borderColor: 'rgba(126,190,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
          >
            返回增长飞轮
          </button>
          <button
            onClick={() => setSection('future')}
            className="px-5 py-2 rounded-lg text-xs border transition-all text-primary-cyan hover:border-[rgba(49,244,255,0.5)] hover:shadow-[0_0_16px_rgba(49,244,255,0.1)]" style={{ borderColor: 'rgba(49,244,255,0.25)', background: 'rgba(49,244,255,0.05)' }}
          >
            全国生态未来推演
          </button>
        </div>
      </div>
    </div>
  )
}
