import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'
import type { PartnerGrowthScenario, PartnerIdentity } from '../data/roadshowPreset'
import { IDENTITY_LABELS, DEFAULT_SCENARIO } from '../data/roadshowPreset'
import { saveScenario, resetToDefault, loadEffectiveScenario } from '../utils/scenarioStorage'

interface Props {
  open: boolean
  onClose: () => void
}

const IDENTITY_OPTIONS: { value: PartnerIdentity; label: string }[] = [
  { value: 'member', label: IDENTITY_LABELS.member },
  { value: 'team_leader', label: IDENTITY_LABELS.team_leader },
  { value: 'partner_10000', label: IDENTITY_LABELS.partner_10000 },
  { value: 'partner_30000', label: IDENTITY_LABELS.partner_30000 },
  { value: 'partner_50000', label: IDENTITY_LABELS.partner_50000 },
  { value: 'cofounder', label: IDENTITY_LABELS.cofounder },
  { value: 'regional_agent', label: IDENTITY_LABELS.regional_agent },
]

export default function RoadshowDeck({ open, onClose }: Props) {
  const { setCurrentScenario } = useExhibitionStore()
  const [scenario, setScenario] = useState<PartnerGrowthScenario>(DEFAULT_SCENARIO)
  const [savedToast, setSavedToast] = useState(false)

  // 加载当前有效方案
  useEffect(() => {
    if (open) {
      setScenario(loadEffectiveScenario())
    }
  }, [open])

  const update = <K extends keyof PartnerGrowthScenario>(
    key: K,
    value: PartnerGrowthScenario[K]
  ) => {
    setScenario((prev) => ({ ...prev, [key]: value }))
  }

  const handleStart = () => {
    // 保存到 localStorage
    saveScenario(scenario)
    // 实时同步到主画面
    setCurrentScenario(scenario)
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2000)
    onClose()
  }

  const handleReset = () => {
    if (confirm('确定恢复默认方案？当前自定义数据将被清除。')) {
      resetToDefault()
      setScenario(DEFAULT_SCENARIO)
      setCurrentScenario(DEFAULT_SCENARIO)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90]"
            style={{ background: 'rgba(3, 5, 10, 0.5)' }}
            onClick={onClose}
          />

          {/* 抽屉 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[95] w-[480px] flex flex-col"
            style={{
              background: 'linear-gradient(180deg, rgba(11, 20, 36, 0.98), rgba(7, 16, 28, 0.98))',
              borderLeft: '1px solid rgba(126, 190, 255, 0.12)',
              boxShadow: '-16px 0 48px rgba(0,0,0,0.4)',
            }}
          >
            {/* 顶部 */}
            <div className="flex items-center justify-between px-6 py-5 border-b"
              style={{ borderColor: 'rgba(126, 190, 255, 0.08)' }}
            >
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
                  路演推演参数
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  调整当前增长场景，保存后将刷新展示结果
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                style={{ color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {/* 表单内容 */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* 我的身份 */}
              <FieldGroup title="我的身份">
                <div className="grid grid-cols-2 gap-2">
                  {IDENTITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update('identity', opt.value)}
                      className="px-3 py-2 rounded-lg text-xs transition-all text-left"
                      style={
                        scenario.identity === opt.value
                          ? {
                              background: 'rgba(74, 184, 255, 0.12)',
                              color: 'var(--blue-core)',
                              border: '1px solid rgba(74, 184, 255, 0.3)',
                            }
                          : {
                              background: 'rgba(255,255,255,0.03)',
                              color: 'var(--text-sub)',
                              border: '1px solid transparent',
                            }
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </FieldGroup>

              {/* 我的投入 */}
              <FieldGroup title="我的投入">
                <NumberInput
                  value={scenario.personalInvestment}
                  onChange={(v) => update('personalInvestment', v)}
                  min={0}
                  step={1000}
                  prefix="¥"
                />
              </FieldGroup>

              {/* 客户邀请 */}
              <FieldGroup title="客户邀请">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] block mb-1" style={{ color: 'var(--text-muted)' }}>
                      已邀请客户数
                    </label>
                    <NumberInput
                      value={scenario.invitedCustomers}
                      onChange={(v) => update('invitedCustomers', v)}
                      min={0}
                      step={1}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] block mb-1" style={{ color: 'var(--text-muted)' }}>
                      转化率 (%)
                    </label>
                    <NumberInput
                      value={Math.round(scenario.conversionRate * 100)}
                      onChange={(v) => update('conversionRate', v / 100)}
                      min={0}
                      max={100}
                      step={5}
                      suffix="%"
                    />
                  </div>
                </div>
              </FieldGroup>

              {/* 客户投入 */}
              <FieldGroup title="客户投入">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] block mb-1" style={{ color: 'var(--text-muted)' }}>
                      客户平均投入
                    </label>
                    <NumberInput
                      value={scenario.averageCustomerInvestment}
                      onChange={(v) => update('averageCustomerInvestment', v)}
                      min={0}
                      step={500}
                      prefix="¥"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] block mb-1" style={{ color: 'var(--text-muted)' }}>
                      月均新增客户
                    </label>
                    <NumberInput
                      value={scenario.monthlyNewCustomers}
                      onChange={(v) => update('monthlyNewCustomers', v)}
                      min={0}
                      step={1}
                    />
                  </div>
                </div>
              </FieldGroup>

              {/* 增长节奏 */}
              <FieldGroup title="增长节奏">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] block mb-1" style={{ color: 'var(--text-muted)' }}>
                      月均增长率 (%)
                    </label>
                    <NumberInput
                      value={Math.round(scenario.monthlyGrowthRate * 100)}
                      onChange={(v) => update('monthlyGrowthRate', v / 100)}
                      min={0}
                      max={100}
                      step={1}
                      suffix="%"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] block mb-1" style={{ color: 'var(--text-muted)' }}>
                      推演周期
                    </label>
                    <div className="flex gap-2">
                      {[12, 24, 36].map((m) => (
                        <button
                          key={m}
                          onClick={() => update('projectionMonths', m as 12 | 24 | 36)}
                          className="flex-1 py-2 rounded-lg text-xs transition-all"
                          style={
                            scenario.projectionMonths === m
                              ? {
                                  background: 'rgba(74, 184, 255, 0.12)',
                                  color: 'var(--blue-core)',
                                  border: '1px solid rgba(74, 184, 255, 0.3)',
                                }
                              : {
                                  background: 'rgba(255,255,255,0.03)',
                                  color: 'var(--text-sub)',
                                  border: '1px solid transparent',
                                }
                          }
                        >
                          {m} 月
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </FieldGroup>

              {/* 方案名称 */}
              <FieldGroup title="方案名称">
                <input
                  type="text"
                  value={scenario.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--text-main)',
                    border: '1px solid rgba(126, 190, 255, 0.15)',
                  }}
                  placeholder="输入方案名称..."
                />
              </FieldGroup>
            </div>

            {/* 底部按钮 */}
            <div
              className="px-6 py-4 border-t space-y-2"
              style={{ borderColor: 'rgba(126, 190, 255, 0.08)' }}
            >
              <button
                onClick={handleStart}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, rgba(74,184,255,0.15), rgba(124,92,255,0.15))',
                  color: 'var(--blue-core)',
                  border: '1px solid rgba(74, 184, 255, 0.35)',
                }}
              >
                开始推演
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl text-xs transition-all hover:bg-white/[0.04]"
                  style={{
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid rgba(126, 190, 255, 0.12)',
                  }}
                >
                  恢复默认
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-xs transition-all hover:bg-white/[0.04]"
                  style={{
                    background: 'transparent',
                    color: 'var(--text-sub)',
                    border: '1px solid rgba(126, 190, 255, 0.12)',
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          </motion.div>

          {/* 保存成功提示 */}
          <AnimatePresence>
            {savedToast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-lg text-xs"
                style={{
                  background: 'rgba(74, 184, 255, 0.15)',
                  color: 'var(--blue-core)',
                  border: '1px solid rgba(74, 184, 255, 0.3)',
                }}
              >
                方案已保存，展示结果已刷新
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}

/* ========== 子组件 ========== */

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-medium mb-3" style={{ color: 'var(--text-main)' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function NumberInput({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  prefix = '',
  suffix = '',
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
}) {
  return (
    <div className="flex items-center">
      {prefix && (
        <span className="text-xs px-2 py-2 rounded-l-lg border border-r-0" style={{
          background: 'rgba(255,255,255,0.04)',
          color: 'var(--text-muted)',
          borderColor: 'rgba(126, 190, 255, 0.15)',
        }}>
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 px-3 py-2 text-xs outline-none transition-colors"
        style={{
          background: 'rgba(255,255,255,0.04)',
          color: 'var(--text-main)',
          border: '1px solid rgba(126, 190, 255, 0.15)',
          borderRadius: prefix || suffix ? '0' : '0.5rem',
        }}
      />
      {suffix && (
        <span className="text-xs px-2 py-2 rounded-r-lg border border-l-0" style={{
          background: 'rgba(255,255,255,0.04)',
          color: 'var(--text-muted)',
          borderColor: 'rgba(126, 190, 255, 0.15)',
        }}>
          {suffix}
        </span>
      )}
    </div>
  )
}
