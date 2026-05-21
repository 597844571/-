import { motion, AnimatePresence } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'
import { hasUserScenario, loadEffectiveScenario } from '../utils/scenarioStorage'

interface Props {
  open: boolean
  onClose: () => void
}

export default function PresentationStartDialog({ open, onClose }: Props) {
  const { setPresentationMode, setShowRoadshowDeck } = useExhibitionStore()

  const scenario = loadEffectiveScenario()
  const isCustom = hasUserScenario()

  const handleStart = () => {
    onClose()
    setPresentationMode(true)
  }

  const handleEdit = () => {
    onClose()
    setShowRoadshowDeck(true)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(3, 5, 10, 0.75)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-[420px] rounded-2xl p-8"
            style={{
              background: 'linear-gradient(180deg, rgba(11, 20, 36, 0.95), rgba(7, 16, 28, 0.95))',
              border: '1px solid rgba(126, 190, 255, 0.15)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 40px rgba(74,184,255,0.06)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部发光条 */}
            <div
              className="absolute top-0 left-8 right-8 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(74,184,255,0.4), transparent)',
              }}
            />

            {/* 标题 */}
            <h2
              className="text-xl font-bold text-center mb-2"
              style={{ color: 'var(--text-main)' }}
            >
              开始路演推演
            </h2>
            <p
              className="text-sm text-center mb-6"
              style={{ color: 'var(--text-sub)' }}
            >
              {isCustom
                ? `当前使用自定义方案「${scenario.name}」`
                : `当前使用默认方案「${scenario.name}」`}
            </p>

            {/* 方案摘要 */}
            <div
              className="rounded-xl p-4 mb-6 space-y-2"
              style={{
                background: 'rgba(74, 184, 255, 0.04)',
                border: '1px solid rgba(74, 184, 255, 0.1)',
              }}
            >
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>路演身份</span>
                <span style={{ color: 'var(--text-main)' }}>
                  {scenario.identity === 'partner_10000' && '1万合伙人'}
                  {scenario.identity === 'partner_30000' && '3万合伙人'}
                  {scenario.identity === 'partner_50000' && '5万合伙人'}
                  {scenario.identity === 'cofounder' && '联合创始人'}
                  {scenario.identity === 'regional_agent' && '区域代理'}
                  {scenario.identity === 'team_leader' && '团队长'}
                  {scenario.identity === 'member' && '普通会员'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>个人投入</span>
                <span style={{ color: 'var(--gold-core)' }}>¥{scenario.personalInvestment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>推演周期</span>
                <span style={{ color: 'var(--text-main)' }}>{scenario.projectionMonths} 个月</span>
              </div>
            </div>

            {/* 按钮组 */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleStart}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, rgba(74,184,255,0.15), rgba(124,92,255,0.15))',
                  color: 'var(--blue-core)',
                  border: '1px solid rgba(74, 184, 255, 0.35)',
                  boxShadow: '0 0 16px rgba(74,184,255,0.1)',
                }}
              >
                开始路演
              </button>

              <button
                onClick={handleEdit}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/[0.04]"
                style={{
                  background: 'transparent',
                  color: 'var(--text-sub)',
                  border: '1px solid rgba(126, 190, 255, 0.15)',
                }}
              >
                编辑路演参数
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-xs transition-all hover:text-text-sub"
                style={{
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: '1px solid transparent',
                }}
              >
                取消
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
