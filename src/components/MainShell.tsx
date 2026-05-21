import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExhibitionStore, type ExhibitionSection } from '../store/exhibitionStore'

const NAV_GROUPS = [
  {
    label: '战略',
    items: [
      { key: 'strategic' as ExhibitionSection, label: '战略总览' },
      { key: 'architecture' as ExhibitionSection, label: '三层架构' },
      { key: 'resources' as ExhibitionSection, label: '资源背书' },
    ],
  },
  {
    label: '布局',
    items: [
      { key: 'map' as ExhibitionSection, label: '全国布局' },
      { key: 'regionalModel' as ExhibitionSection, label: '区域样板' },
      { key: 'machineRoom' as ExhibitionSection, label: '三维机房' },
    ],
  },
  {
    label: '生态',
    items: [
      { key: 'consumption' as ExhibitionSection, label: '消费权益' },
      { key: 'assetFlow' as ExhibitionSection, label: '资产流转' },
      { key: 'growthPool' as ExhibitionSection, label: '增长飞轮' },
      { key: 'rights' as ExhibitionSection, label: '权益沙盘' },
    ],
  },
  {
    label: '合作',
    items: [
      { key: 'enterprise' as ExhibitionSection, label: '企业服务' },
      { key: 'identityGuide' as ExhibitionSection, label: '身份导览' },
      { key: 'cooperation' as ExhibitionSection, label: '落地路线' },
      { key: 'future' as ExhibitionSection, label: '未来推演' },
    ],
  },
  {
    label: '资料',
    items: [
      { key: 'archive' as ExhibitionSection, label: '资料舱' },
    ],
  },
]

export default function MainShell({ children }: { children: ReactNode }) {
  const { currentSection, setSection, isPresentationMode, setPresentationMode } =
    useExhibitionStore()

  const showNav = currentSection !== 'intro'

  return (
    <div className="relative w-full h-full">
      {/* Content area */}
      <div className="w-full h-full">{children}</div>

      {/* Floating Navigation */}
      <AnimatePresence>
        {showNav && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
            style={{
              background: 'linear-gradient(180deg, rgba(2,4,10,0.92) 0%, rgba(2,4,10,0.4) 60%, transparent 100%)',
            }}
          >
            {/* Brand */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #4ab8ff20, #8a6fff20)',
                  border: '1px solid rgba(74,184,255,0.25)',
                  boxShadow: '0 0 12px rgba(74,184,255,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
                }}
              >
                <span className="text-white text-xs font-bold">神</span>
              </div>
              <div>
                <div className="text-sm font-bold tracking-wider text-text-main">
                  神枢算力权益通
                </div>
                <div className="text-[10px] tracking-widest text-text-muted">
                  SHENSHU POWER
                </div>
              </div>
            </div>

            {/* Nav links - grouped */}
            <div className="flex items-center gap-1">
              {NAV_GROUPS.map((group, gi) => (
                <div key={group.label} className="flex items-center">
                  <div
                    className="rounded-full px-1.5 py-1 flex items-center gap-0.5"
                    style={{
                      background: 'var(--bg-panel)',
                      backdropFilter: 'blur(16px) saturate(140%)',
                      border: '1px solid rgba(126, 190, 255, 0.12)',
                    }}
                  >
                    {group.items.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setSection(item.key)}
                        className={`px-3 py-1.5 rounded-full text-[11px] transition-all ${
                          currentSection === item.key
                            ? 'font-medium'
                            : 'hover:text-text-sub hover:bg-white/[0.04]'
                        }`}
                        style={
                          currentSection === item.key
                            ? {
                                background: 'rgba(74, 184, 255, 0.12)',
                                color: '#4ab8ff',
                                border: '1px solid rgba(74, 184, 255, 0.3)',
                                boxShadow: '0 0 12px rgba(74,184,255,0.1)',
                              }
                            : {
                                color: '#6f7f9f',
                                border: '1px solid transparent',
                              }
                        }

                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  {gi < NAV_GROUPS.length - 1 && (
                    <span className="mx-1.5 text-[10px]" style={{ color: 'rgba(111, 127, 159, 0.15)' }}>|</span>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setPresentationMode(!isPresentationMode)}
                className={`px-4 py-2 rounded-lg text-xs border transition-all ${isPresentationMode ? '' : 'hover:text-accent-gold hover:border-accent-gold/25'}`}
                style={
                  isPresentationMode
                    ? {
                        background: 'rgba(246, 201, 107, 0.12)',
                        color: '#f6c96b',
                        borderColor: 'rgba(246, 201, 107, 0.35)',
                        boxShadow: '0 0 12px rgba(246,201,107,0.1)',
                      }
                    : {
                        background: 'rgba(15, 25, 48, 0.5)',
                        color: '#6f7f9f',
                        borderColor: 'var(--border-light)',
                      }
                }

              >
                {isPresentationMode ? '退出讲解' : '一键讲解'}
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Bottom status bar */}
      {showNav && (
        <div
          className="absolute bottom-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-2.5 border-t"
          style={{
            background: 'rgba(2, 4, 10, 0.7)',
            backdropFilter: 'blur(12px) saturate(140%)',
            borderColor: 'rgba(126, 190, 255, 0.08)',
          }}
        >
          <div className="flex items-center gap-6 text-[10px] text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              系统运行中
            </span>
            <span>全国算力生态数字展厅 V1.3</span>
            <span>离线演示模式</span>
          </div>
          <div className="text-[10px] text-text-muted">
            {new Date().toLocaleDateString('zh-CN')} | 神枢算力权益通
          </div>
        </div>
      )}
    </div>
  )
}
