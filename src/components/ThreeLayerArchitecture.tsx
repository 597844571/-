import { } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'

const LAYERS = [
  {
    id: 0,
    title: '算力基础设施层',
    subtitle: 'LAYER 01 · 底座',
    desc: '算力基础设施是整个生态的底座，为企业 AI 应用、数据处理、资产记录和区域服务提供计算能力支撑',
    color: '#4ab8ff',
    items: ['数据机房', 'GPU服务器', '标准机柜', '网络交换', '存储阵列', '冷却系统', '电力系统', '安全监控', '运维体系'],
    depth: 'bottom',
  },
  {
    id: 1,
    title: '数据资产流通层',
    subtitle: 'LAYER 02 · 引擎',
    desc: '数据资产流通层承载用户消费权益、资产释放、交易流通、出金结算与增长池价值支撑，是平台价值循环的核心引擎',
    color: '#31f4ff',
    items: ['消费生成', '资产账户', '每日释放', '交易账户', '闪兑卖出', '内部互转', '银行卡出金', '手续费分成', '通缩销毁', '增长池支撑'],
    depth: 'middle',
  },
  {
    id: 2,
    title: '区域生态运营层',
    subtitle: 'LAYER 03 · 生态',
    desc: '区域生态运营层连接用户、商家、企业、服务网点和区域合作伙伴，推动项目从单点试点走向全国复制',
    color: '#7c5cff',
    items: ['普通会员', '商家', '企业客户', '服务网点', '团队长', '合伙人', '联合创始人', '区域代理', '本地生活', '全国消费网络'],
    depth: 'top',
  },
]

export default function ThreeLayerArchitecture() {
  const { setSection, activeLayer, setActiveLayer } = useExhibitionStore()

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3 opacity-[0.12]"
          style={{ background: 'linear-gradient(to top, #4ab8ff, transparent)' }}
        />
        <div
          className="absolute top-1/3 left-0 right-0 h-1/3 opacity-[0.12]"
          style={{ background: 'linear-gradient(to top, #31f4ff, transparent)' }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-1/3 opacity-[0.12]"
          style={{ background: 'linear-gradient(to top, #8a6fff, transparent)' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl 3xl:max-w-5xl 4k:max-w-6xl px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="text-xs text-primary-cyan tracking-[0.4em] mb-3 uppercase">
            Three-Layer Value Architecture
          </div>
          <h2 className="text-3xl font-bold text-glow-blue tracking-wider">
            三层价值架构
          </h2>
        </motion.div>

        {/* Layer stack */}
        <div className="space-y-4">
          {LAYERS.map((layer, i) => {
            const isActive = activeLayer === layer.id
            const isReversed = i === 0 // Bottom layer displayed at bottom
            return (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, y: isReversed ? 30 : -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative"
              >
                <button
                  onClick={() => setActiveLayer(isActive ? -1 : layer.id)}
                  className="w-full p-5 rounded-xl border transition-all text-left relative overflow-hidden"
                  style={{
                    borderColor: isActive ? layer.color + '50' : 'rgba(126,190,255,0.12)',
                    background: isActive ? layer.color + '10' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  {/* Glow effect */}
                  {isActive && (
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{ background: `radial-gradient(ellipse at center, ${layer.color}, transparent 70%)` }}
                    />
                  )}

                  <div className="relative z-10 flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{
                        background: layer.color + '20',
                        color: layer.color,
                        border: `1px solid ${layer.color}30`,
                      }}
                    >
                      0{layer.id + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] tracking-wider mb-1" style={{ color: layer.color }}>
                        {layer.subtitle}
                      </div>
                      <h3 className="text-lg font-bold text-text-main mb-1">{layer.title}</h3>
                      <p className="text-xs text-text-sub leading-relaxed">{layer.desc}</p>

                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 flex flex-wrap gap-1.5"
                          >
                            {layer.items.map((item) => (
                              <span
                                key={item}
                                className="px-2.5 py-1 rounded text-[10px] border"
                                style={{
                                  color: layer.color,
                                  borderColor: layer.color + '25',
                                  background: layer.color + '08',
                                }}
                              >
                                {item}
                              </span>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </button>

                {/* Flow connector between layers */}
                {i < LAYERS.length - 1 && (
                  <div className="flex justify-center py-2">
                    <motion.div
                      className="w-0.5 h-6"
                      style={{
                        background: `linear-gradient(to bottom, ${layer.color}40, ${LAYERS[i + 1].color}40)`,
                      }}
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center gap-4 mt-8"
        >
          <button
            onClick={() => setSection('machineRoom')}
            className="px-6 py-2.5 rounded-lg glass-panel text-primary-blue text-xs border border-primary-blue/30 hover:border-primary-blue/60 transition-all"
          >
            进入三维机房
          </button>
          <button
            onClick={() => setSection('assetFlow')}
            className="px-6 py-2.5 rounded-lg glass-panel text-primary-cyan text-xs border border-primary-cyan/30 hover:border-primary-cyan/60 transition-all"
          >
            查看资产流转引擎
          </button>
        </motion.div>
      </div>
    </div>
  )
}
