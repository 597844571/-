import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'

const PHASES = [
  {
    id: 1,
    title: '区域沟通与资源匹配',
    platform: '提供区域评估模型、算力资源清单、合作方案模板',
    partner: '提供区域产业情况、目标客户画像、本地资源',
    goal: '确定合作意向和区域适配性',
    output: '区域合作备忘录',
  },
  {
    id: 2,
    title: '确定试点城市 / 园区 / 企业',
    platform: '提供选址建议、机房接入方案、算力配额',
    partner: '确定试点场地、协调本地资源',
    goal: '锁定首个落地场景',
    output: '试点落地协议',
  },
  {
    id: 3,
    title: '接入算力资源与消费场景',
    platform: '部署算力节点、搭建消费平台、接入支付系统',
    partner: '配合场地准备、本地商户招募',
    goal: '基础设施和消费入口就绪',
    output: '算力节点上线 + 消费场景开通',
  },
  {
    id: 4,
    title: '建立服务网点与运营团队',
    platform: '提供运营培训、品牌支持、系统工具',
    partner: '组建本地运营团队、开设服务网点',
    goal: '区域运营体系成型',
    output: '服务网点开业 + 团队到位',
  },
  {
    id: 5,
    title: '启动会员与商户生态',
    platform: '会员系统、数据资产规则、营销活动支持',
    partner: '会员招募、商户接入、本地推广',
    goal: '生态用户和商户规模起步',
    output: '首批会员 + 签约商户',
  },
  {
    id: 6,
    title: '接入数据资产流转规则',
    platform: '数据资产账户、释放规则、交易流通、出金通道',
    partner: '用户教育、合规配合、日常运营',
    goal: '数据资产生态运转',
    output: '资产流通体系运行',
  },
  {
    id: 7,
    title: '形成区域样板并复制推广',
    platform: '样板数据复盘、复制方案、扩张支持',
    partner: '区域扩张、新城市拓展',
    goal: '从单点走向区域网络',
    output: '可复制的区域运营模型',
  },
]

export default function CooperationRoadmap() {
  const { setSection, roadmapPhase, setRoadmapPhase } = useExhibitionStore()
  const [activePhase, setActivePhase] = useState<number | null>(roadmapPhase)
  const phase = PHASES.find((p) => p.id === activePhase)

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
            Cooperation Roadmap
          </div>
          <h2 className="text-3xl font-bold text-glow-blue tracking-wider mb-2">
            合作落地路线图
          </h2>
          <p className="text-sm text-text-sub">
            从资源匹配到区域样板复制的完整路径
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative mb-6">
          {/* Connection line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-white/5" />

          <div className="flex justify-between relative">
            {PHASES.map((p) => {
              const isActive = activePhase === p.id
              const isPast = activePhase !== null && p.id < activePhase
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePhase(isActive ? null : p.id)
                    setRoadmapPhase(isActive ? 0 : p.id)
                  }}
                  className="relative flex flex-col items-center gap-2 z-10"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2"
                    style={{
                      background: isActive
                        ? 'rgba(74,184,255,0.2)'
                        : isPast
                        ? 'rgba(74,184,255,0.1)'
                        : 'rgba(255,255,255,0.03)',
                      borderColor: isActive
                        ? '#4ab8ff'
                        : isPast
                        ? 'rgba(74,184,255,0.3)'
                        : 'rgba(126,190,255,0.15)',
                      color: isActive ? '#4ab8ff' : isPast ? '#4ab8ff80' : '#6f7f9f',
                      boxShadow: isActive ? '0 0 20px rgba(74,184,255,0.3)' : 'none',
                    }}
                  >
                    {p.id}
                  </div>
                  <span
                    className="text-[9px] text-center max-w-[80px] leading-tight"
                    style={{ color: isActive ? '#4ab8ff' : '#6f7f9f' }}
                  >
                    {p.title.slice(0, 6)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          {phase ? (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel-strong rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-[10px] text-primary-blue mb-1">
                    PHASE {String(phase.id).padStart(2, '0')} / 07
                  </div>
                  <h3 className="text-lg font-bold text-text-main">{phase.title}</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-primary-blue/5 border border-primary-blue/10">
                  <div className="text-[10px] text-primary-blue mb-1">平台提供</div>
                  <p className="text-xs text-text-sub">{phase.platform}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary-cyan/5 border border-primary-cyan/10">
                  <div className="text-[10px] text-primary-cyan mb-1">合作方提供</div>
                  <p className="text-xs text-text-sub">{phase.partner}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent-gold/5 border border-accent-gold/10">
                  <div className="text-[10px] text-accent-gold mb-1">阶段目标</div>
                  <p className="text-xs text-text-sub">{phase.goal}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary-purple/5 border border-primary-purple/10">
                  <div className="text-[10px] text-primary-purple mb-1">阶段产出</div>
                  <p className="text-xs text-text-sub">{phase.output}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass-panel-strong rounded-xl p-6 text-center">
              <p className="text-xs text-text-muted">
                点击上方阶段节点，查看合作落地详情
              </p>
            </div>
          )}
        </AnimatePresence>

        {/* Bottom nav */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setSection('enterprise')}
            className="px-6 py-2.5 rounded-lg glass-panel text-text-secondary text-xs border border-border-light hover:text-text-main transition-all"
          >
            返回企业服务
          </button>
          <button
            onClick={() => setSection('future')}
            className="px-6 py-2.5 rounded-lg glass-panel text-primary-cyan text-xs border border-primary-cyan/30 hover:border-primary-cyan/60 transition-all"
          >
            未来推演
          </button>
        </div>
      </div>
    </div>
  )
}
