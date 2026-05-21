import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'

const PILLARS = [
  {
    id: 'infrastructure',
    title: '算力基础设施',
    subtitle: '底座',
    desc: '数据机房、GPU服务器、网络交换、存储阵列、冷却电力系统，为企业AI应用和数据处理提供底层支撑',
    color: '#4ab8ff',
    glow: 'rgba(74,184,255,0.25)',
    items: ['数据机房', 'GPU服务器', '网络交换', '存储阵列', '冷却系统', '电力系统'],
  },
  {
    id: 'asset',
    title: '数据资产流通',
    subtitle: '牵引',
    desc: '消费生成数据资产、每日释放、交易流通、出金结算，形成平台价值循环的核心引擎',
    color: '#31f4ff',
    glow: 'rgba(49,244,255,0.25)',
    items: ['消费生成', '资产账户', '每日释放', '交易流通', '出金结算', '增长池'],
  },
  {
    id: 'ecosystem',
    title: '区域生态运营',
    subtitle: '路径',
    desc: '连接用户、商家、企业、服务网点和区域合作伙伴，推动项目从单点试点走向全国复制',
    color: '#8a6fff',
    glow: 'rgba(138,111,255,0.25)',
    items: ['普通会员', '商家企业', '服务网点', '合伙人', '区域代理', '全国网络'],
  },
]

export default function StrategicOverview() {
  const { setSection } = useExhibitionStore()
  const [activePillar, setActivePillar] = useState<number | null>(null)

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[900px] h-[900px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(74,184,255,0.06) 0%, transparent 55%)' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl 3xl:max-w-6xl 4k:max-w-7xl px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="text-[11px] tracking-[0.4em] mb-3 uppercase font-medium" style={{ color: '#31f4ff90' }}>
            全国数字算力生态战略总览
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-wider mb-4 text-text-main"
            style={{ textShadow: '0 0 24px rgba(74,184,255,0.25), 0 0 60px rgba(74,184,255,0.08)' }}
          >
            神枢不是单一消费平台
          </h2>
          <p className="text-sm md:text-base max-w-2xl mx-auto leading-relaxed text-text-sub">
            而是以算力基础设施为底座、以数据资产流通为牵引、以区域生态运营为路径，
            构建面向全国的数字算力生态网络
          </p>
        </motion.div>

        {/* Three pillars */}
        <div className="flex items-end justify-center gap-5 mb-12">
          {PILLARS.map((pillar, i) => {
            const isActive = activePillar === i
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.18 }}
                className="relative flex-1 max-w-xs"
              >
                {/* Light beam from top */}
                <div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 w-px h-8 opacity-40"
                  style={{ background: `linear-gradient(to bottom, ${pillar.color}, transparent)` }}
                />

                <button
                  onClick={() => setActivePillar(isActive ? null : i)}
                  className="w-full p-5 rounded-xl border text-left transition-all relative overflow-hidden"
                  style={{
                    borderColor: isActive ? pillar.color + '50' : 'rgba(126, 190, 255, 0.10)',
                    background: isActive ? pillar.color + '10' : 'rgba(255,255,255,0.02)',
                    boxShadow: isActive
                      ? `0 8px 32px ${pillar.glow}, 0 0 60px ${pillar.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`
                      : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = pillar.color + '30'
                      e.currentTarget.style.background = pillar.color + '06'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(126, 190, 255, 0.10)'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                    }
                  }}
                >
                  {/* Inner glow */}
                  {isActive && (
                    <div
                      className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{ background: `radial-gradient(ellipse at center, ${pillar.color}, transparent 70%)` }}
                    />
                  )}

                  <div className="relative z-10">
                    <div
                      className="text-[10px] tracking-[0.2em] mb-2 uppercase font-medium"
                      style={{ color: pillar.color }}
                    >
                      {pillar.subtitle}
                    </div>
                    <h3 className="text-base font-bold mb-2 text-text-main">
                      {pillar.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-text-sub">
                      {pillar.desc}
                    </p>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 flex flex-wrap gap-1.5"
                        >
                          {pillar.items.map((item) => (
                            <span
                              key={item}
                              className="px-2.5 py-1 rounded-md text-[10px] border"
                              style={{
                                color: pillar.color,
                                borderColor: pillar.color + '25',
                                background: pillar.color + '08',
                              }}
                            >
                              {item}
                            </span>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Connection line */}
        <div className="flex justify-center mb-10">
          <svg width="500" height="24" viewBox="0 0 500 24" className="opacity-40">
            <defs>
              <linearGradient id="connGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4ab8ff" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#31f4ff" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#8a6fff" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <line x1="0" y1="12" x2="500" y2="12" stroke="url(#connGrad)" strokeWidth="1" strokeDasharray="8 6" />
            {/* Animated dot */}
            <circle r="2.5" fill="#31f4ff">
              <animate attributeName="cx" values="0;500" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-center gap-4"
        >
          <button
            onClick={() => setSection('architecture')}
            className="px-8 py-3.5 rounded-xl text-sm border transition-all hover:border-[rgba(74,184,255,0.55)] hover:shadow-[0_0_20px_rgba(74,184,255,0.15)] text-primary-blue border-border-medium"
            style={{ background: 'var(--primary-blue)14' }}
          >
            查看三层价值架构
          </button>
          <button
            onClick={() => setSection('map')}
            className="px-8 py-3.5 rounded-xl text-sm border transition-all hover:border-[rgba(49,244,255,0.5)] hover:shadow-[0_0_20px_rgba(49,244,255,0.12)] text-primary-cyan"
            style={{ background: 'var(--primary-cyan)0D',
              borderColor: 'var(--border-light)' }}
          >
            查看全国布局
          </button>
        </motion.div>
      </div>
    </div>
  )
}
