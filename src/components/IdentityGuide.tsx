import { useState } from 'react'
import { motion } from 'framer-motion'
import { useExhibitionStore, type ViewerIdentity } from '../store/exhibitionStore'
import { IconLeader, IconEnterprise, IconPartner, IconUser, IconMerchant, IconAgent, IconCofounder } from './ExhibitionIcons'

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  leader: IconLeader,
  enterprise: IconEnterprise,
  partner: IconPartner,
  user: IconUser,
  merchant: IconMerchant,
  agent: IconAgent,
  cofounder_viewer: IconCofounder,
}

const IDENTITIES: Array<{
  key: ViewerIdentity
  label: string
  desc: string
  path: string[]
  color: string
}> = [
  {
    key: 'leader',
    label: '机关 / 园区领导',
    desc: '关注战略高度、区域布局和产业价值',
    path: ['战略总览', '全国地图', '区域样板', '企业服务', '未来规划'],
    color: '#4ab8ff',
  },
  {
    key: 'enterprise',
    label: '企业客户',
    desc: '关注算力资源、服务能力与合作模式',
    path: ['企业场景', '算力机房', '服务能力', '合作模式', '案例推演'],
    color: '#31f4ff',
  },
  {
    key: 'partner',
    label: '渠道合作伙伴',
    desc: '关注消费生态、权益体系和增长机会',
    path: ['全国地图', '消费生态', '权益席位', '区域代理', '增长池'],
    color: '#8a6fff',
  },
  {
    key: 'user',
    label: '普通用户',
    desc: '关注消费权益、数据资产和出金路径',
    path: ['消费场景', '数据资产', '释放交易', '出金路径'],
    color: '#4ab8ff',
  },
  {
    key: 'merchant',
    label: '商家',
    desc: '关注获客渠道、会员生态和数字化运营',
    path: ['企业服务', '消费生态', '会员体系', '服务网点'],
    color: '#31f4ff',
  },
  {
    key: 'agent',
    label: '区域代理',
    desc: '关注区域机会、代理权益和落地支持',
    path: ['区域样板', '权益席位', '合作路线', '增长池'],
    color: '#f6c96b',
  },
  {
    key: 'cofounder_viewer',
    label: '联合创始人',
    desc: '关注核心收益、全网分成和战略决策',
    path: ['权益席位', '增长飞轮', '资产流转', '未来推演'],
    color: '#f6c96b',
  },
]

const PATH_MAP: Record<string, string> = {
  '战略总览': 'strategic',
  '全国地图': 'map',
  '区域样板': 'regionalModel',
  '企业服务': 'enterprise',
  '未来规划': 'future',
  '企业场景': 'enterprise',
  '算力机房': 'machineRoom',
  '服务能力': 'enterprise',
  '合作模式': 'cooperation',
  '案例推演': 'future',
  '消费生态': 'consumption',
  '权益席位': 'rights',
  '区域代理': 'rights',
  '增长池': 'growthPool',
  '消费场景': 'consumption',
  '数据资产': 'assetFlow',
  '释放交易': 'assetFlow',
  '出金路径': 'assetFlow',
  '会员体系': 'rights',
  '服务网点': 'rights',
  '合作路线': 'cooperation',
  '增长飞轮': 'growthPool',
  '资产流转': 'assetFlow',
  '未来推演': 'future',
}

export default function IdentityGuide() {
  const { setSection, setViewerIdentity } = useExhibitionStore()
  const [selected, setSelected] = useState<ViewerIdentity | null>(null)
  const identity = IDENTITIES.find((i) => i.key === selected)

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
            Identity Guide
          </div>
          <h2 className="text-3xl font-bold text-glow-blue tracking-wider mb-2">
            客户身份导览
          </h2>
          <p className="text-sm text-text-sub">
            选择您的身份，获取定制化参观路径
          </p>
        </motion.div>

        {/* Identity cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {IDENTITIES.map((id, i) => {
            const isActive = selected === id.key
            return (
              <motion.button
                key={id.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => {
                  setSelected(isActive ? null : id.key)
                  setViewerIdentity(isActive ? null : id.key)
                }}
                className="relative p-5 rounded-xl border text-center transition-all"
                style={{
                  borderColor: isActive ? id.color + '50' : 'rgba(126,190,255,0.12)',
                  background: isActive ? id.color + '10' : 'rgba(255,255,255,0.02)',
                }}
              >
                {(() => {
                  const IconComp = ICON_MAP[id.key]
                  return IconComp ? <div className="mb-3" style={{ color: id.color }}><IconComp className="w-7 h-7" /></div> : null
                })()}
                <h3 className="text-sm font-bold text-text-main mb-1">{id.label}</h3>
                <p className="text-[10px] text-text-sub leading-relaxed">{id.desc}</p>
              </motion.button>
            )
          })}
        </div>

        {/* Recommended path */}
        {identity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel-strong rounded-xl p-6"
          >
            <div className="text-xs text-text-muted mb-4 tracking-wider">
              推荐参观路径
            </div>
            <div className="flex items-center gap-3">
              {identity.path.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const section = PATH_MAP[step] as any
                      if (section) setSection(section)
                    }}
                    className="px-4 py-2 rounded-lg text-xs border transition-all hover:scale-105"
                    style={{
                      color: identity.color,
                      borderColor: identity.color + '40',
                      background: identity.color + '10',
                    }}
                  >
                    {step}
                  </button>
                  {i < identity.path.length - 1 && (
                    <span className="text-text-muted text-lg">→</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
