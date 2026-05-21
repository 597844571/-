import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'
import { IconAuthority, IconOperators, IconDatacenter, IconTeam, IconManagement, IconTech } from './ExhibitionIcons'

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  authority: IconAuthority,
  operators: IconOperators,
  datacenter: IconDatacenter,
  team: IconTeam,
  management: IconManagement,
  tech: IconTech,
}

const RESOURCES = [
  {
    id: 'authority',
    title: '权威背景',
    desc: '依托上级单位在信息技术、标准化管理领域的长期积累，建立规范、安全、可靠的项目运营基础',
    tags: ['信息技术', '标准化管理', '规范运营'],
    color: '#4ab8ff',
  },
  {
    id: 'operators',
    title: '三大运营商合作',
    desc: '深度合作运营商资源，接入全国布局的高标准数据机房，构建稳定、高效、安全的算力资源网络',
    tags: ['运营商', '数据机房', '算力网络'],
    color: '#31f4ff',
  },
  {
    id: 'datacenter',
    title: '高标准数据机房',
    desc: '全国多区域高标准数据机房接入，具备 GPU 算力、高速网络、存储阵列和智能运维能力',
    tags: ['GPU算力', '高速网络', '智能运维'],
    color: '#8a6fff',
  },
  {
    id: 'team',
    title: '专业运营团队',
    desc: '汇聚数据中心、云计算、网络通信和平台运营领域人才，为项目持续运营提供支撑',
    tags: ['数据中心', '云计算', '平台运营'],
    color: '#4ab8ff',
  },
  {
    id: 'management',
    title: '规范管理体系',
    desc: '通过标准化管理、运维监测和安全保障机制，为平台长期运营提供基础保障',
    tags: ['标准化', '运维监测', '安全保障'],
    color: '#31f4ff',
  },
  {
    id: 'tech',
    title: '技术研发能力',
    desc: '具备算力调度、数据处理、平台开发和系统集成的全栈技术能力',
    tags: ['算力调度', '数据处理', '系统集成'],
    color: '#8a6fff',
  },
]

export default function ResourceWall() {
  const { } = useExhibitionStore()
  const [selected, setSelected] = useState<string | null>(null)
  const resource = RESOURCES.find((r) => r.id === selected)

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative z-10 w-full max-w-5xl 3xl:max-w-6xl 4k:max-w-7xl px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="text-[11px] tracking-[0.4em] mb-3 uppercase font-medium" style={{ color: '#31f4ff90' }}>
            Strategic Resources
          </div>
          <h2
            className="text-3xl font-bold tracking-wider mb-2 text-text-main" style={{ textShadow: '0 0 20px rgba(74,184,255,0.2)' }}
          >
            战略资源墙
          </h2>
          <p className="text-sm text-text-sub">
            项目资源、可信基础与战略支撑
          </p>
        </motion.div>

        <div className="grid grid-cols-12 gap-6">
          {/* Resource cards grid */}
          <div className="col-span-7">
            <div className="grid grid-cols-2 gap-4">
              {RESOURCES.map((r, i) => {
                const isActive = selected === r.id
                return (
                  <motion.button
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelected(isActive ? null : r.id)}
                    className="relative p-4 rounded-xl border text-left transition-all overflow-hidden"
                    style={{
                      borderColor: isActive ? r.color + '45' : 'rgba(126, 190, 255, 0.10)',
                      background: isActive ? r.color + '08' : 'rgba(255,255,255,0.02)',
                      boxShadow: isActive ? `0 4px 20px ${r.color}15` : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = r.color + '25'
                        e.currentTarget.style.background = r.color + '04'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'rgba(126, 190, 255, 0.10)'
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }
                    }}
                  >
                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse at 30% 30%, ${r.color}08, transparent 70%)`,
                      }}
                    />

                    <div className="relative z-10">
                      {(() => {
                      const IconComp = ICON_MAP[r.id]
                      return IconComp ? (
                        <div className="mb-2" style={{ color: r.color }}>
                          <IconComp className="w-6 h-6" />
                        </div>
                      ) : null
                    })()}
                      <h3 className="text-sm font-bold mb-1 text-text-main">{r.title}</h3>
                      <p className="text-[10px] leading-relaxed line-clamp-2 text-text-muted">
                        {r.desc}
                      </p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Detail drawer */}
          <div className="col-span-5">
            <AnimatePresence mode="wait">
              {resource ? (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, x: 30, rotateY: -8 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  exit={{ opacity: 0, x: 30, rotateY: -8 }}
                  transition={{ duration: 0.4 }}
                  className="p-6 h-full rounded-xl border"
                  style={{
                    background: 'var(--bg-panel-strong)',
                    backdropFilter: 'blur(24px) saturate(160%)',
                    borderColor: resource.color + '30',
                    boxShadow: `0 12px 40px rgba(0,0,0,0.4), 0 0 30px ${resource.color}10`,
                  }}
                >
                  {(() => {
                    const IconComp = ICON_MAP[resource.id]
                    return IconComp ? (
                      <div className="mb-3" style={{ color: resource.color }}>
                        <IconComp className="w-10 h-10" />
                      </div>
                    ) : null
                  })()}
                  <h3 className="text-lg font-bold mb-1" style={{ color: resource.color }}>
                    {resource.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-5 text-text-sub">
                    {resource.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {resource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md text-[10px] border"
                        style={{
                          color: resource.color,
                          borderColor: resource.color + '25',
                          background: resource.color + '08',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div
                  className="p-6 h-full rounded-xl border flex items-center justify-center"
                  style={{
                    background: 'var(--bg-panel-weak)',
                    borderColor: 'rgba(126, 190, 255, 0.08)',
                  }}
                >
                  <p className="text-xs text-center text-text-muted">
                    点击左侧资源卡片
                    <br />
                    查看战略支撑详情
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
