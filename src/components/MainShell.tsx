import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExhibitionStore, type ExhibitionSection } from '../store/exhibitionStore'

/* ============================================================
   V2.0 展厅导航轨道
   命名统一为展厅风格，避免"系统/后台/管理"等词汇
   ============================================================ */

const NAV_GROUPS = [
  {
    label: '总览',
    items: [
      { key: 'strategic' as ExhibitionSection, label: '数字展厅' },
    ],
  },
  {
    label: '布局',
    items: [
      { key: 'map' as ExhibitionSection, label: '全国布局' },
      { key: 'machineRoom' as ExhibitionSection, label: '算力机房' },
      { key: 'regionalModel' as ExhibitionSection, label: '区域扩张' },
    ],
  },
  {
    label: '架构',
    items: [
      { key: 'architecture' as ExhibitionSection, label: '价值架构' },
      { key: 'assetFlow' as ExhibitionSection, label: '资产引擎' },
      { key: 'consumption' as ExhibitionSection, label: '消费权益' },
    ],
  },
  {
    label: '权益',
    items: [
      { key: 'rights' as ExhibitionSection, label: '权益体系' },
      { key: 'growthPool' as ExhibitionSection, label: '增长沙盘' },
    ],
  },
  {
    label: '未来',
    items: [
      { key: 'future' as ExhibitionSection, label: '未来蓝图' },
      { key: 'archive' as ExhibitionSection, label: '资料舱' },
    ],
  },
]

export default function MainShell({ children }: { children: ReactNode }) {
  const {
    currentSection,
    setSection,
    isPresentationMode,
    setPresentationMode,
  } = useExhibitionStore()

  const showNav = currentSection !== 'intro'

  return (
    <div className="relative w-full h-full">
      {/* Content area */}
      <div className="w-full h-full">{children}</div>

      {/* Floating Navigation — 展厅导航轨道 */}
      <AnimatePresence>
        {showNav && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
            style={{
              background: 'linear-gradient(180deg, rgba(3,5,10,0.92) 0%, rgba(3,5,10,0.4) 60%, transparent 100%)',
            }}
          >
            {/* Brand */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #4AB8FF20, #7C5CFF20)',
                  border: '1px solid rgba(74,184,255,0.25)',
                  boxShadow: '0 0 12px rgba(74,184,255,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
                }}
              >
                <span className="text-white text-xs font-bold">神</span>
              </div>
              <div>
                <div className="text-sm font-bold tracking-wider" style={{ color: 'var(--text-main)' }}>
                  神枢算力权益通
                </div>
                <div className="text-[10px] tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  全国算力生态数字展厅
                </div>
              </div>
            </div>

            {/* Nav links — 展厅导航轨道 */}
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
                                color: 'var(--blue-core)',
                                border: '1px solid rgba(74, 184, 255, 0.3)',
                                boxShadow: '0 0 12px rgba(74,184,255,0.1)',
                              }
                            : {
                                color: 'var(--text-muted)',
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

            {/* Actions — 一键讲解 */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setPresentationMode(!isPresentationMode)}
                className={`px-4 py-2 rounded-lg text-xs border transition-all ${isPresentationMode ? '' : 'hover:text-accent-gold hover:border-accent-gold/25'}`}
                style={
                  isPresentationMode
                    ? {
                        background: 'rgba(246, 201, 107, 0.12)',
                        color: 'var(--gold-core)',
                        borderColor: 'rgba(246, 201, 107, 0.35)',
                        boxShadow: '0 0 12px rgba(246,201,107,0.1)',
                      }
                    : {
                        background: 'rgba(15, 25, 48, 0.5)',
                        color: 'var(--text-muted)',
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

      {/* Bottom status bar — V2.0 */}
      {showNav && (
        <div
          className="absolute bottom-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-2.5 border-t"
          style={{
            background: 'rgba(3, 5, 10, 0.7)',
            backdropFilter: 'blur(12px) saturate(140%)',
            borderColor: 'rgba(126, 190, 255, 0.08)',
          }}
        >
          <div className="flex items-center gap-6 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: 'var(--cyan-flow)' }}
              />
              展厅运行中
            </span>
            <span>神枢全国算力生态数字展厅 V2.0</span>
            <span>路演推演模式</span>
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('zh-CN')} | 神枢算力权益通
          </div>
        </div>
      )}
    </div>
  )
}
