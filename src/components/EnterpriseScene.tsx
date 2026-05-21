import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'
import { IconLocalLife, IconEcommerce, IconIndustrial, IconAI, IconDataService, IconRegionalOp } from './ExhibitionIcons'

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  local_life: IconLocalLife,
  ecommerce: IconEcommerce,
  industrial_park: IconIndustrial,
  ai_enterprise: IconAI,
  data_service: IconDataService,
  regional_operator: IconRegionalOp,
}

const ENTERPRISE_TYPES = [
  {
    id: 'local_life',
    name: '本地生活企业',
    needs: ['获客', '消费转化', '会员沉淀', '数字化运营'],
    capabilities: ['本地生活消费场景', '数据资产激励', '会员生态', '服务网点支持'],
  },
  {
    id: 'ecommerce',
    name: '电商企业',
    needs: ['流量入口', '消费闭环', '用户留存', '数据资产'],
    capabilities: ['算力通商城', '消费算力权益', '会员体系', '渠道合作'],
  },
  {
    id: 'industrial_park',
    name: '产业园区',
    needs: ['企业算力服务', '数字化转型', '产业集聚', '区域运营'],
    capabilities: ['算力机房资源', '企业AI服务', '数据处理', '生态运营'],
  },
  {
    id: 'ai_enterprise',
    name: 'AI 应用企业',
    needs: ['算力资源', '数据处理', '模型推理', '稳定部署'],
    capabilities: ['GPU算力机房', '算力调度', '网络节点', '数据处理服务'],
  },
  {
    id: 'data_service',
    name: '数据服务企业',
    needs: ['数据基础设施', '算力支撑', '流通机制', '安全保障'],
    capabilities: ['数据存储阵列', '算力网络', '资产流通规则', '安全监控'],
  },
  {
    id: 'regional_operator',
    name: '区域运营商',
    needs: ['区域资源', '合作模式', '运营体系', '收益分成'],
    capabilities: ['区域代理体系', '算力节点接入', '消费生态', '合作伙伴收益'],
  },
]

export default function EnterpriseScene() {
  const { setSection, enterpriseType, setEnterpriseType } = useExhibitionStore()
  const [selected, setSelected] = useState<string | null>(enterpriseType)
  const enterprise = ENTERPRISE_TYPES.find((e) => e.id === selected)

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
            Enterprise Service Scenarios
          </div>
          <h2 className="text-3xl font-bold text-glow-blue tracking-wider mb-2">
            企业服务场景
          </h2>
          <p className="text-sm text-text-sub">
            神枢不仅面向消费用户，也面向企业和区域产业场景
          </p>
        </motion.div>

        {/* Enterprise selector cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {ENTERPRISE_TYPES.map((et, i) => {
            const isActive = selected === et.id
            return (
              <motion.button
                key={et.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => {
                  setSelected(isActive ? null : et.id)
                  setEnterpriseType(isActive ? null : et.id)
                }}
                className="relative p-5 rounded-xl border text-left transition-all"
                style={{
                  borderColor: isActive ? 'rgba(74,184,255,0.4)' : 'rgba(126,190,255,0.12)',
                  background: isActive ? 'rgba(74,184,255,0.08)' : 'rgba(255,255,255,0.02)',
                }}
              >
                {(() => {
                  const IconComp = ICON_MAP[et.id]
                  return IconComp ? (
                    <div className="mb-3 text-primary-blue">
                      <IconComp className="w-7 h-7" />
                    </div>
                  ) : null
                })()}
                <h3 className="text-sm font-bold text-text-main mb-1">{et.name}</h3>
                <div className="flex flex-wrap gap-1 mt-2">
                  {et.needs.slice(0, 2).map((n) => (
                    <span
                      key={n}
                      className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-text-muted"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          {enterprise && (
            <motion.div
              key={enterprise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel-strong rounded-xl p-6"
            >
              <div className="grid grid-cols-3 gap-6">
                <div>
                  {(() => {
                    const IconComp = ICON_MAP[enterprise.id]
                    return IconComp ? <div className="mb-2 text-primary-blue"><IconComp className="w-8 h-8" /></div> : null
                  })()}
                  <h3 className="text-lg font-bold text-primary-blue mb-1">
                    {enterprise.name}
                  </h3>
                  <p className="text-xs text-text-sub">企业身份</p>
                </div>
                <div>
                  <div className="text-[10px] text-text-muted mb-2 tracking-wider">典型需求</div>
                  <div className="flex flex-wrap gap-1.5">
                    {enterprise.needs.map((n) => (
                      <span
                        key={n}
                        className="px-2 py-1 rounded text-[10px] bg-primary-blue/10 text-primary-blue border border-primary-blue/20"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-text-muted mb-2 tracking-wider">平台能力</div>
                  <div className="flex flex-wrap gap-1.5">
                    {enterprise.capabilities.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-1 rounded text-[10px] bg-primary-cyan/10 text-primary-cyan border border-primary-cyan/20"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom nav */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => setSection('machineRoom')}
            className="px-6 py-2.5 rounded-lg glass-panel text-primary-blue text-xs border border-primary-blue/30 hover:border-primary-blue/60 transition-all"
          >
            查看算力机房
          </button>
          <button
            onClick={() => setSection('cooperation')}
            className="px-6 py-2.5 rounded-lg glass-panel text-primary-cyan text-xs border border-primary-cyan/30 hover:border-primary-cyan/60 transition-all"
          >
            合作落地路线
          </button>
        </div>
      </div>
    </div>
  )
}
