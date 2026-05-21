import { } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'
import { IconDoc, IconDatacenter, IconPartner, IconMap, IconManagement, IconEnterprise, IconChart } from './ExhibitionIcons'

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  intro: IconDoc,
  datacenter: IconDatacenter,
  cooperation: IconPartner,
  regional: IconMap,
  rights: IconManagement,
  enterprise: IconEnterprise,
  investment: IconChart,
}

const ARCHIVES = [
  {
    id: 'intro',
    title: '项目介绍',
    type: 'PDF',
    size: '2.4 MB',
    desc: '神枢算力权益通项目整体介绍，包含项目定位、商业模式和生态体系',
  },
  {
    id: 'datacenter',
    title: '机房资料',
    type: 'PDF',
    size: '5.1 MB',
    desc: '全国高标准数据机房分布、设备配置和运维能力说明',
  },
  {
    id: 'cooperation',
    title: '合作模式',
    type: 'PDF',
    size: '1.8 MB',
    desc: '区域代理、合伙人、联合创始人等多层级合作模式详解',
  },
  {
    id: 'regional',
    title: '区域方案',
    type: 'PDF',
    size: '3.2 MB',
    desc: '重点区域落地方案、样板模型和扩张路径规划',
  },
  {
    id: 'rights',
    title: '权益规则',
    type: 'PDF',
    size: '1.5 MB',
    desc: '消费权益、数据资产释放、交易流通和出金规则',
  },
  {
    id: 'enterprise',
    title: '企业服务方案',
    type: 'PDF',
    size: '2.8 MB',
    desc: '面向本地生活、电商、产业园区和AI企业的服务方案',
  },
  {
    id: 'investment',
    title: '平台招商方案',
    type: 'PDF',
    size: '2.1 MB',
    desc: '平台招商政策、商户入驻流程和运营支持体系',
  },
]

export default function StrategicArchive() {
  const { selectedArchive, setSelectedArchive } = useExhibitionStore()
  const archive = ARCHIVES.find((a) => a.id === selectedArchive)

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative z-10 w-full max-w-5xl 3xl:max-w-6xl 4k:max-w-7xl px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="text-xs text-primary-cyan tracking-[0.4em] mb-3 uppercase">
            Strategic Archive
          </div>
          <h2 className="text-3xl font-bold text-glow-blue tracking-wider mb-2">
            战略资料舱
          </h2>
          <p className="text-sm text-text-sub">
            项目资料沉淀与商务跟进支持
          </p>
        </motion.div>

        <div className="grid grid-cols-12 gap-6">
          {/* Archive cards */}
          <div className="col-span-7">
            <div className="grid grid-cols-2 gap-4">
              {ARCHIVES.map((a, i) => {
                const isActive = selectedArchive === a.id
                return (
                  <motion.button
                    key={a.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setSelectedArchive(isActive ? null : a.id)}
                    className="relative p-4 rounded-xl border text-left transition-all"
                    style={{
                      borderColor: isActive
                        ? 'rgba(74,184,255,0.4)'
                        : 'rgba(126,190,255,0.12)',
                      background: isActive
                        ? 'rgba(74,184,255,0.08)'
                        : 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {(() => {
                        const IconComp = ICON_MAP[a.id]
                        return IconComp ? <div className="flex-shrink-0 text-primary-blue"><IconComp className="w-6 h-6" /></div> : null
                      })()}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-text-main mb-0.5">
                          {a.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] text-text-muted">
                          <span className="px-1.5 py-0.5 rounded bg-white/5">{a.type}</span>
                          <span>{a.size}</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Preview panel */}
          <div className="col-span-5">
            <AnimatePresence mode="wait">
              {archive ? (
                <motion.div
                  key={archive.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-panel-strong rounded-xl p-6 h-full flex flex-col"
                >
                  {(() => {
                    const IconComp = ICON_MAP[archive.id]
                    return IconComp ? <div className="mb-3 text-primary-blue"><IconComp className="w-10 h-10" /></div> : null
                  })()}
                  <h3 className="text-lg font-bold text-primary-blue mb-1">
                    {archive.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-primary-blue/10 text-primary-blue border border-primary-blue/20">
                      {archive.type}
                    </span>
                    <span className="text-[10px] text-text-muted">{archive.size}</span>
                  </div>
                  <p className="text-sm text-text-sub leading-relaxed mb-6">
                    {archive.desc}
                  </p>
                  <div className="mt-auto space-y-2">
                    <button className="w-full py-2.5 rounded-lg bg-primary-blue/10 text-primary-blue text-xs border border-primary-blue/30 hover:bg-primary-blue/20 transition-all">
                      预览资料
                    </button>
                    <button className="w-full py-2.5 rounded-lg glass-panel text-primary-cyan text-xs border border-primary-cyan/30 hover:border-primary-cyan/60 transition-all">
                      下载资料
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="glass-panel-strong rounded-xl p-6 h-full flex items-center justify-center">
                  <p className="text-xs text-text-muted text-center">
                    点击左侧资料卡片
                    <br />
                    预览或下载项目资料
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
