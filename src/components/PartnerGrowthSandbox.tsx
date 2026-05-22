import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'
import { IDENTITY_LABELS } from '../data/roadshowPreset'
import { loadEffectiveScenario } from '../utils/scenarioStorage'
import { getScenarioByIdentity } from '../data/identityScenarios'
import { calculateGrowth } from '../utils/growthCalculation'
import type { GrowthResult, MonthlyData } from '../utils/growthCalculation'
import type { PartnerIdentity, PartnerGrowthScenario } from '../data/roadshowPreset'

/* ============================================================
   V3.3 合伙权益增长沙盘 — ResizeObserver 自适应 · Flex 全比例
   ============================================================ */

const C = {
  dataBlue: '#4AB8FF',
  flowCyan: '#31F4FF',
  poolPurple: '#7C5CFF',
  equityGold: '#F6C96B',
  textMain: '#f0f4ff',
  textSub: '#b0c4e8',
  textMuted: '#6F7F9F',
  panelBg: 'rgba(8, 14, 28, 0.55)',
  panelBorder: 'rgba(74, 184, 255, 0.06)',
}

const IDENTITY_MULTIPLIERS: Record<string, number> = {
  member: 1, team_leader: 1.5, partner_10000: 2,
  partner_30000: 3, partner_50000: 4, cofounder: 6, regional_agent: 8,
}

const IDENTITY_ORDER: PartnerIdentity[] = [
  'member', 'team_leader', 'partner_10000', 'partner_30000',
  'partner_50000', 'cofounder', 'regional_agent',
]

const IDENTITY_META: Record<PartnerIdentity, { threshold: string; unlocks: string[] }> = {
  member: { threshold: '投入 ¥30,000', unlocks: ['产品礼包', '数据资产'] },
  team_leader: { threshold: '投入 ¥80,000', unlocks: ['团队补贴', '推荐奖励'] },
  partner_10000: { threshold: '投入 ¥100,000', unlocks: ['阶梯奖励', '全网分成'] },
  partner_30000: { threshold: '投入 ¥300,000', unlocks: ['算力分成', '消费注入'] },
  partner_50000: { threshold: '投入 ¥500,000', unlocks: ['区域权重', '交易分成'] },
  cofounder: { threshold: '投入 ¥500,000', unlocks: ['联合创始人权', '全网算力'] },
  regional_agent: { threshold: '投入 ¥1,000,000', unlocks: ['区域代理权', '最高分成'] },
}

function fmtMoney(v: number) {
  if (v >= 100000000) return `${(v / 100000000).toFixed(1)}亿`
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (v >= 10000) return `${(v / 10000).toFixed(1)}万`
  return v.toLocaleString()
}
function fmtRoi(v: number) {
  if (v >= 10000) return '>10000%'
  if (v >= 1000) return `${Math.round(v / 100) / 10}k%`
  return `${v}%`
}

// ════════════════════════════════════════════════════════════
// 1. 左侧：身份升阶轨道
// ════════════════════════════════════════════════════════════

function IdentityOrbit({ currentIdentity, onSelect }: { currentIdentity: PartnerIdentity; onSelect: (id: PartnerIdentity) => void }) {
  const currentIdx = IDENTITY_ORDER.indexOf(currentIdentity)
  const itemHeight = 64

  const handlePrev = () => { if (currentIdx > 0) onSelect(IDENTITY_ORDER[currentIdx - 1]) }
  const handleNext = () => { if (currentIdx < IDENTITY_ORDER.length - 1) onSelect(IDENTITY_ORDER[currentIdx + 1]) }
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY > 20) handleNext()
    else if (e.deltaY < -20) handlePrev()
  }

  return (
    <div className="relative h-full flex flex-col items-center overflow-hidden" onWheel={handleWheel}>
      <button onClick={handlePrev} disabled={currentIdx === 0}
        className="absolute top-0 z-20 w-full flex justify-center py-0.5 disabled:opacity-15 transition-opacity"
        style={{ background: 'linear-gradient(to bottom, rgba(8,14,28,0.9), transparent)' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>
      </button>

      <div className="relative flex-1 w-full" style={{ perspective: '600px' }}>
        <div className="absolute inset-0 flex flex-col items-center"
          style={{ transform: `translateY(calc(50% - ${itemHeight / 2}px - ${currentIdx * itemHeight}px))`, transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)' }}>
          {IDENTITY_ORDER.map((id, idx) => {
            const isActive = id === currentIdentity
            const dist = Math.abs(idx - currentIdx)
            const meta = IDENTITY_META[id]
            const opacity = isActive ? 1 : dist === 1 ? 0.5 : dist === 2 ? 0.15 : 0.04
            const scale = isActive ? 1 : dist === 1 ? 0.88 : dist === 2 ? 0.74 : 0.58
            const blur = isActive ? 0 : dist === 1 ? 0.5 : dist === 2 ? 1.5 : 3
            return (
              <button key={id} onClick={() => onSelect(id)} className="w-full text-left flex-shrink-0 transition-all"
                style={{ height: itemHeight, opacity, transform: `scale(${scale})`, filter: `blur(${blur}px)`, cursor: isActive ? 'default' : 'pointer' }}>
                <div className="mx-1 rounded-lg px-2 py-1.5 h-full flex flex-col justify-center"
                  style={{
                    background: isActive ? 'linear-gradient(135deg, rgba(74,184,255,0.1), rgba(124,92,255,0.06))' : 'transparent',
                    border: isActive ? '1px solid rgba(74, 184, 255, 0.28)' : '1px solid transparent',
                    boxShadow: isActive ? '0 0 16px rgba(74,184,255,0.08)' : 'none',
                  }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold"
                      style={{ background: isActive ? 'rgba(74,184,255,0.12)' : 'rgba(126,190,255,0.05)', border: `1px solid ${isActive ? 'rgba(74,184,255,0.3)' : 'rgba(126,190,255,0.1)'}`, color: isActive ? C.dataBlue : C.textMuted }}>
                      {idx + 1}
                    </div>
                    <span className="text-xs font-medium truncate" style={{ color: isActive ? C.textMain : C.textSub }}>{IDENTITY_LABELS[id]}</span>
                    {isActive && (
                      <span className="text-[8px] px-1 py-px rounded-full ml-auto flex-shrink-0" style={{ background: 'rgba(246,201,107,0.1)', color: C.equityGold, border: '1px solid rgba(246,201,107,0.18)' }}>当前</span>
                    )}
                  </div>
                  <div className="text-[9px] mt-0.5 pl-[22px]" style={{ color: C.textMuted }}>{meta.threshold}</div>
                  {isActive && (
                    <div className="flex flex-wrap gap-1 mt-0.5 pl-[22px]">
                      {meta.unlocks.map((u) => (
                        <span key={u} className="text-[8px] px-1 py-px rounded" style={{ background: 'rgba(74,184,255,0.06)', color: C.dataBlue, border: '1px solid rgba(74,184,255,0.1)' }}>{u}</span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <button onClick={handleNext} disabled={currentIdx === IDENTITY_ORDER.length - 1}
        className="absolute bottom-0 z-20 w-full flex justify-center py-0.5 disabled:opacity-15 transition-opacity"
        style={{ background: 'linear-gradient(to top, rgba(8,14,28,0.9), transparent)' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// 2. 中央：合伙权益星核（角度分布标签）
// ════════════════════════════════════════════════════════════

function EquityStarCore({ result, playingStep }: { result: GrowthResult; playingStep: number }) {
  const cv = playingStep >= 2 || playingStep === 0
  const rv = playingStep >= 3 || playingStep === 0

  const rings = [
    { label: '产品礼包', value: result.productGiftValue, color: C.dataBlue, angle: -90 },
    { label: '数据资产', value: result.dataAssetReward, color: C.flowCyan, angle: 0 },
    { label: '可流通资产', value: result.tradableAsset, color: C.equityGold, angle: 90 },
    { label: '每日释放', value: result.dailyReleaseMax, color: C.poolPurple, angle: 180 },
  ]

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* 分成光路 */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: rv ? 1 : 0.1 }} transition={{ duration: 0.8 }}
        className="absolute rounded-full" style={{ width: '90%', height: '90%', border: '1px solid rgba(246,201,107,0.07)', boxShadow: '0 0 30px rgba(246,201,107,0.04), inset 0 0 20px rgba(246,201,107,0.02)' }}>
        <div className="absolute inset-0 rounded-full" style={{ animation: 'spin 22s linear infinite' }}>
          <div className="absolute w-1 h-1 rounded-full" style={{ background: C.equityGold, boxShadow: `0 0 4px ${C.equityGold}`, top: '-1px', left: '50%', transform: 'translateX(-50%)' }} />
        </div>
        <div className="absolute inset-0 rounded-full" style={{ animation: 'spin 16s linear infinite reverse' }}>
          <div className="absolute w-0.5 h-0.5 rounded-full" style={{ background: C.equityGold, top: '-1px', left: '30%' }} />
        </div>
      </motion.div>

      {/* 数据层 */}
      {rings.map((ring, i) => {
        const size = 72 + i * 14
        const delay = rv ? i * 0.1 : 0
        const spinDir = i % 2 === 0 ? '' : 'reverse'
        const spinDur = 9 + i * 3
        const rad = (ring.angle * Math.PI) / 180
        const labelR = 50
        const lx = 50 + Math.cos(rad) * labelR
        const ly = 50 + Math.sin(rad) * labelR

        return (
          <motion.div key={ring.label} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: rv ? 1 : 0.1, scale: rv ? 1 : 0.9 }} transition={{ delay, duration: 0.45 }}
            className="absolute rounded-full flex items-center justify-center"
            style={{ width: `${size}%`, height: `${size}%`, border: `1.5px solid ${ring.color}15`, boxShadow: `inset 0 0 12px ${ring.color}05, 0 0 6px ${ring.color}03` }}>
            <div className="absolute inset-0 rounded-full" style={{ animation: `spin ${spinDur}s linear infinite ${spinDir}` }}>
              <div className="absolute w-1 h-1 rounded-full" style={{ background: ring.color, boxShadow: `0 0 4px ${ring.color}`, top: '-1px', left: '50%', transform: 'translateX(-50%)' }} />
            </div>
            {i === 1 && (
              <div className="absolute inset-0 rounded-full" style={{ animation: `spin ${spinDur + 2}s linear infinite ${spinDir}` }}>
                <div className="absolute w-0.5 h-0.5 rounded-full" style={{ background: ring.color, boxShadow: `0 0 3px ${ring.color}`, top: '-1px', left: '75%' }} />
              </div>
            )}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: rv ? 1 : 0 }} transition={{ delay: delay + 0.12 }}
              className="absolute flex flex-col items-center px-1.5 py-px rounded-md pointer-events-none"
              style={{ background: `${ring.color}08`, border: `1px solid ${ring.color}12`, color: ring.color, left: `${lx}%`, top: `${ly}%`, transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap' }}>
              <span className="text-[8px] tracking-wider leading-tight">{ring.label}</span>
              <span className="text-[9px] font-bold leading-tight">{fmtMoney(ring.value)}</span>
            </motion.div>
          </motion.div>
        )
      })}

      {/* 中心 */}
      <motion.div initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: cv ? 1 : 0.2, scale: cv ? 1 : 0.7 }} transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative flex flex-col items-center justify-center z-10"
        style={{ width: 'clamp(56px, 18%, 90px)', height: 'clamp(56px, 18%, 90px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,184,255,0.18) 0%, rgba(124,92,255,0.1) 100%)', border: '1.5px solid rgba(74, 184, 255, 0.3)', boxShadow: '0 0 24px rgba(74,184,255,0.12), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
        <div className="absolute inset-0 rounded-full" style={{ animation: 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite', background: 'rgba(74,184,255,0.06)' }} />
        <span className="text-[9px] tracking-widest relative z-10" style={{ color: C.textMuted }}>投入</span>
        <span className="text-sm font-bold relative z-10 mt-px" style={{ color: C.equityGold }}>{fmtMoney(result.personalInvestment)}</span>
      </motion.div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// 3. 团队增长网络
// ════════════════════════════════════════════════════════════

function TeamNetwork({ scenario, playingStep }: { scenario: PartnerGrowthScenario; playingStep: number }) {
  const visible = playingStep >= 4 || playingStep === 0
  const nodes = useMemo(() => {
    const count = Math.min(scenario.invitedCustomers + 6, 24)
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3
      const radius = 50 + (i / count) * 70
      const investment = scenario.averageCustomerInvestment * (0.6 + Math.random() * 0.8)
      const size = investment > scenario.averageCustomerInvestment * 1.2 ? 4.5 : investment > scenario.averageCustomerInvestment * 0.8 ? 3 : 2
      const color = investment > scenario.averageCustomerInvestment * 1.2 ? C.equityGold : investment > scenario.averageCustomerInvestment * 0.8 ? C.poolPurple : C.dataBlue
      return { x: 150 + Math.cos(angle) * radius, y: 120 + Math.sin(angle) * radius, size, color, investment: Math.round(investment) }
    })
  }, [scenario.invitedCustomers, scenario.averageCustomerInvestment])

  const cx = 150, cy = 120
  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 300 240" className="w-full h-full">
        <defs><radialGradient id="nwGlow3" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(74,184,255,0.05)" /><stop offset="100%" stopColor="transparent" /></radialGradient></defs>
        <circle cx={cx} cy={cy} r="130" fill="url(#nwGlow3)" />
        {nodes.map((n, i) => <motion.line key={`l-${i}`} initial={{ opacity: 0 }} animate={{ opacity: visible ? 0.08 : 0 }} transition={{ delay: i * 0.02 }} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke={n.color} strokeWidth="0.5" />)}
        {nodes.map((n, i) => nodes.slice(i + 1).map((m, j) => { const dist = Math.hypot(n.x - m.x, n.y - m.y); if (dist > 65) return null; return <motion.line key={`c-${i}-${j}`} initial={{ opacity: 0 }} animate={{ opacity: visible ? 0.04 : 0 }} transition={{ delay: 0.2 + i * 0.012 }} x1={n.x} y1={n.y} x2={m.x} y2={m.y} stroke={C.dataBlue} strokeWidth="0.4" /> }))}
        <motion.circle cx={cx} cy={cy} r="130" fill="none" stroke="rgba(74,184,255,0.04)" strokeWidth="1" strokeDasharray="3 6" initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0 }} transition={{ duration: 0.6 }} />
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0.15 }} transition={{ duration: 0.4 }}>
          <circle cx={cx} cy={cy} r="8" fill="rgba(246,201,107,0.1)" stroke={C.equityGold} strokeWidth="1" />
          <circle cx={cx} cy={cy} r="3.5" fill={C.equityGold} />
        </motion.g>
        {nodes.map((n, i) => (
          <motion.g key={`n-${i}`} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0 }} transition={{ delay: 0.1 + i * 0.03, duration: 0.2 }}>
            <title>投入 ¥{n.investment.toLocaleString()}</title>
            <circle cx={n.x} cy={n.y} r={n.size + 2.5} fill={n.color} opacity="0.1"><animate attributeName="r" values={`${n.size + 2.5};${n.size + 5};${n.size + 2.5}`} dur={`${2.5 + Math.random() * 2}s`} repeatCount="indefinite" /></circle>
            <circle cx={n.x} cy={n.y} r={n.size} fill={n.color} />
          </motion.g>
        ))}
      </svg>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// 4. 增长池引擎舱
// ════════════════════════════════════════════════════════════

function GrowthPoolEngine({ result, playingStep }: { result: GrowthResult; playingStep: number }) {
  const visible = playingStep >= 5 || playingStep === 0
  const totalInjection = result.monthlyTrack.reduce((s, m) => s + m.poolInjection, 0)
  const totalDataAsset = result.monthlyTrack.reduce((s, m) => s + m.dataAsset, 0)
  const totalTeam = result.monthlyTrack.reduce((s, m) => s + m.monthlyInvestment, 0)
  const streams = [
    { label: '数据资产注入', value: totalDataAsset, color: C.dataBlue },
    { label: '团队业绩注入', value: totalTeam, color: C.equityGold },
    { label: '消费注入', value: Math.round(totalInjection * 0.3), color: C.flowCyan },
  ]

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div className="relative w-[60%] h-[60%] flex items-center justify-center">
        <motion.div className="absolute inset-0 rounded-full" initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0.1 }}
          style={{ background: 'radial-gradient(circle, rgba(124,92,255,0.1) 0%, transparent 65%)', animation: 'ping 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        <div className="absolute inset-[5%] rounded-full" style={{ border: '1.5px solid rgba(124,92,255,0.12)', animation: 'spin 10s linear infinite' }} />
        <div className="absolute inset-[12%] rounded-full" style={{ border: '1px dashed rgba(74,184,255,0.08)', animation: 'spin 7s linear infinite reverse' }} />
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: visible ? 1 : 0.2, scale: visible ? 1 : 0.7 }} transition={{ duration: 0.5 }}
          className="absolute inset-[20%] rounded-full flex flex-col items-center justify-center"
          style={{ background: 'radial-gradient(circle, rgba(124,92,255,0.2) 0%, rgba(74,184,255,0.12) 100%)', border: '1.5px solid rgba(124, 92, 255, 0.3)', boxShadow: '0 0 18px rgba(124,92,255,0.12)' }}>
          <div className="absolute inset-0 rounded-full" style={{ animation: 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite', background: 'rgba(124,92,255,0.06)' }} />
          <span className="text-[9px] tracking-wider relative z-10" style={{ color: C.textMuted }}>增长池</span>
          <span className="text-sm font-bold relative z-10 mt-px" style={{ color: C.equityGold }}>{fmtMoney(totalInjection)}</span>
        </motion.div>
        <motion.div className="absolute inset-[2%] rounded-full" initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0 }}
          style={{ border: '1px solid rgba(246,201,107,0.1)', animation: 'ping 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
      </div>
      <div className="grid grid-cols-3 gap-1.5 mt-1 w-full px-2">
        {streams.map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0 }} className="flex flex-col items-center">
            <div className="flex items-center gap-1"><div className="w-1 h-1 rounded-full" style={{ background: s.color }} /><span className="text-[8px]" style={{ color: C.textMuted }}>{s.label}</span></div>
            <span className="text-[9px] font-medium" style={{ color: s.color }}>{fmtMoney(s.value)}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// 5. 右侧收益总控台
// ════════════════════════════════════════════════════════════

function RevenueDashboard({ result, scenario, playingStep }: { result: GrowthResult; scenario: PartnerGrowthScenario; playingStep: number }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const totalAsset = scenario.projectionMonths === 36 ? result.totalAsset36M : result.totalAsset12M
  const roi = scenario.projectionMonths === 36 ? result.roi36M : result.roi12M
  const months = scenario.projectionMonths
  const multiplier = IDENTITY_MULTIPLIERS[scenario.identity] ?? 1
  const rv = playingStep >= 7 || playingStep === 0

  const cards = [
    { key: 'basic', title: '基础权益', color: C.dataBlue, total: result.productGiftValue + result.dataAssetReward + result.tradableAsset + result.dailyReleaseMax, items: [
      { label: '产品礼包', value: result.productGiftValue, desc: `投入×30%×${multiplier}` },
      { label: '数据资产奖励', value: result.dataAssetReward, desc: `投入×50%×${multiplier}` },
      { label: '可流通资产', value: result.tradableAsset, desc: '数据资产×40%' },
      { label: '每日释放', value: result.dailyReleaseMax, desc: '数据资产×0.8%' },
    ]},
    { key: 'growth', title: '增长权益', color: C.poolPurple, total: result.referralReward + result.teamSubsidy + result.tierBonus, items: [
      { label: '推荐奖励', value: result.referralReward, desc: `团队投入×5%×${multiplier}` },
      { label: '团队补贴', value: result.teamSubsidy, desc: `团队投入×3%×${multiplier}` },
      { label: '阶梯业绩奖励', value: result.tierBonus, desc: `团队投入×2%×${months}/12` },
    ]},
    { key: 'share', title: '分成权益', color: C.equityGold, total: result.globalSalesShare + result.computeIncomeShare + result.regionalSalesShare, items: [
      { label: '全网销售额分成', value: result.globalSalesShare, desc: '权益份额×20%' },
      { label: '算力收益分成', value: result.computeIncomeShare, desc: '权益份额×15%' },
      { label: '区域销售额分成', value: result.regionalSalesShare, desc: '权益份额×25%' },
    ]},
  ]

  return (
    <div className="flex flex-col gap-1.5 h-full">
      {/* 大卡 */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: rv ? 1 : 0.3, y: rv ? 0 : -3 }} transition={{ duration: 0.4 }}
        className="rounded-xl p-2.5 relative overflow-hidden flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, rgba(246,201,107,0.07), rgba(124,92,255,0.04))', border: '1px solid rgba(246, 201, 107, 0.12)' }}>
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full" style={{ background: 'radial-gradient(circle, rgba(246,201,107,0.04), transparent)' }} />
        <div className="text-[9px] tracking-widest uppercase mb-0.5" style={{ color: C.textMuted }}>{months}个月累计总权益</div>
        <div className="text-lg font-bold tracking-tight" style={{ color: C.equityGold }}>¥{fmtMoney(totalAsset)}</div>
        <div className="flex items-center gap-3 mt-1.5">
          <div><span className="text-[9px]" style={{ color: C.textMuted }}>投资回报率</span><div className="text-xs font-bold" style={{ color: C.flowCyan }}>{fmtRoi(roi)}</div></div>
          <div className="w-px h-4" style={{ background: 'rgba(126,190,255,0.06)' }} />
          <div><span className="text-[9px]" style={{ color: C.textMuted }}>期末月度分成</span><div className="text-xs font-bold" style={{ color: C.dataBlue }}>¥{fmtMoney(result.monthlyTrack[result.monthlyTrack.length - 1]?.equityShare ?? 0)}</div></div>
        </div>
      </motion.div>

      {/* 三张卡 */}
      {cards.map((card, ci) => (
        <motion.div key={card.key} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ci * 0.06, duration: 0.3 }}
          className="rounded-xl overflow-hidden flex-shrink-0" style={{ background: C.panelBg, border: `1px solid ${C.panelBorder}` }}>
          <button onClick={() => setExpanded(expanded === card.key ? null : card.key)} className="w-full flex items-center justify-between px-2.5 py-1.5 text-left">
            <div className="flex items-center gap-1.5">
              <div className="w-0.5 h-2.5 rounded-full" style={{ background: card.color }} />
              <span className="text-[11px] font-medium" style={{ color: C.textSub }}>{card.title}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tabular-nums" style={{ color: card.color }}>¥{fmtMoney(card.total)}</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round" className="transition-transform flex-shrink-0" style={{ transform: expanded === card.key ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </button>
          <AnimatePresence>
            {expanded === card.key && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="px-2.5 pb-2 flex flex-col gap-1">
                  {card.items.map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1 px-1.5 rounded" style={{ background: 'rgba(126,190,255,0.02)' }}>
                      <div><div className="text-[10px]" style={{ color: C.textSub }}>{item.label}</div><div className="text-[9px]" style={{ color: C.textMuted }}>{item.desc}</div></div>
                      <span className="text-xs font-bold tabular-nums" style={{ color: card.color }}>¥{fmtMoney(item.value)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// 6. 底部增长轨道（紧凑关键节点）
// ════════════════════════════════════════════════════════════

function BattleTrack({ track, months, playingStep, playbackMonth }: { track: MonthlyData[]; months: number; playingStep: number; playbackMonth: number }) {
  const data = track.slice(0, months)
  if (data.length === 0) return null
  const keyMonthsRaw = [1, 3, 6, 12, 18, 24, 36].filter((m) => m <= months)
  const keyIndices = keyMonthsRaw.map((m) => m - 1)
  const maxVal = Math.max(...data.map((d) => d.equityShare))
  const w = 960
  const h = 68
  const padLeft = 36
  const padRight = 36
  const padTop = 4
  const padBottom = 4
  const chartW = w - padLeft - padRight
  const chartH = h - padTop - padBottom
  const getX = (i: number) => padLeft + (i / (data.length - 1)) * chartW
  const getY = (v: number) => padTop + chartH - (v / (maxVal || 1)) * chartH * 0.65
  const points = data.map((d, i) => `${getX(i)},${getY(d.equityShare)}`).join(' ')
  const activeMonths = playingStep >= 8 && playbackMonth > 0 ? Math.min(playbackMonth, data.length) : data.length

  return (
    <div className="w-full overflow-x-auto scrollbar-thin">
      <svg viewBox={`0 0 ${w} ${h + 50}`} className="w-full" style={{ minWidth: '600px' }}>
        <defs>
          <linearGradient id="btGrad3" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={C.dataBlue} stopOpacity="0.35" /><stop offset="100%" stopColor={C.poolPurple} stopOpacity="0.35" /></linearGradient>
          <linearGradient id="btArea3" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="rgba(74, 184, 255, 0.05)" /><stop offset="100%" stopColor="transparent" /></linearGradient>
        </defs>
        <polyline points={points} fill="none" stroke="rgba(74, 184, 255, 0.04)" strokeWidth="1" strokeLinecap="round" />
        {activeMonths > 1 && (
          <polyline points={data.slice(0, activeMonths).map((d, i) => `${getX(i)},${getY(d.equityShare)}`).join(' ')} fill="none" stroke="url(#btGrad3)" strokeWidth="1.5" strokeLinecap="round" />
        )}
        {keyIndices.map((idx) => {
          const d = data[idx]; if (!d) return null
          const x = getX(idx), y = getY(d.equityShare)
          const isActive = idx < activeMonths
          const isCurrent = idx === activeMonths - 1 && playingStep >= 8
          return (
            <g key={`k-${idx}`}>
              <line x1={x} y1={y} x2={x} y2={h + 2} stroke={isActive ? `${C.dataBlue}12` : 'rgba(126,190,255,0.03)'} strokeWidth="1" strokeDasharray="2 2" />
              <circle cx={x} cy={y} r={isCurrent ? 4 : isActive ? 3 : 2} fill={isActive ? C.dataBlue : 'rgba(111,127,159,0.15)'} style={{ filter: isCurrent ? `drop-shadow(0 0 3px ${C.dataBlue})` : 'none' }} />
              {isCurrent && <circle cx={x} cy={y} r="6" fill="none" stroke={C.dataBlue} strokeWidth="0.8" opacity="0.35"><animate attributeName="r" values="4;9;4" dur="1.5s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite" /></circle>}
              <g transform={`translate(${x}, ${h + 6})`}>
                <rect x="-36" y="0" width="72" height="42" rx="5" fill={isActive ? 'rgba(11, 20, 36, 0.65)' : 'rgba(11, 20, 36, 0.35)'} stroke={isActive ? 'rgba(74, 184, 255, 0.1)' : 'rgba(126, 190, 255, 0.04)'} strokeWidth="1" />
                <text x="0" y="11" textAnchor="middle" fill={isActive ? C.equityGold : 'rgba(246,201,107,0.2)'} fontSize="10" fontWeight="bold">M{d.month}</text>
                <text x="0" y="24" textAnchor="middle" fill={isActive ? C.textSub : 'rgba(176,196,232,0.2)'} fontSize="8">+{d.newCustomers}人 ¥{fmtMoney(d.cumulativeInvestment)}</text>
                <text x="0" y="37" textAnchor="middle" fill={isActive ? C.dataBlue : 'rgba(74,184,255,0.15)'} fontSize="9" fontWeight="bold">¥{fmtMoney(d.equityShare)}</text>
              </g>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// 7. 数据光流连接
// ════════════════════════════════════════════════════════════

function DataFlowRays({ playingStep }: { playingStep: number }) {
  const showA = playingStep >= 5
  const showB = playingStep >= 6
  return (
    <>
      <div className="absolute left-[50%] top-[58%] w-[10%] h-[1px] overflow-hidden" style={{ transform: 'translateY(-50%)' }}>
        <motion.div initial={{ x: '-100%' }} animate={{ x: showA ? '200%' : '-100%' }} transition={{ duration: 1.2, repeat: showA ? Infinity : 0, repeatDelay: 0.6 }}
          className="w-6 h-full rounded-full" style={{ background: `linear-gradient(to right, transparent, ${C.poolPurple}, transparent)` }} />
      </div>
      <div className="absolute right-[33%] top-[58%] w-[10%] h-[1px] overflow-hidden" style={{ transform: 'translateY(-50%)' }}>
        <motion.div initial={{ x: '-100%' }} animate={{ x: showB ? '200%' : '-100%' }} transition={{ duration: 1.2, repeat: showB ? Infinity : 0, repeatDelay: 0.6 }}
          className="w-6 h-full rounded-full" style={{ background: `linear-gradient(to right, transparent, ${C.equityGold}, transparent)` }} />
      </div>
    </>
  )
}

// ════════════════════════════════════════════════════════════
// 8. 顶部推演假设
// ════════════════════════════════════════════════════════════

function AssumptionBadge({ scenario }: { scenario: PartnerGrowthScenario }) {
  const items = [
    { label: '身份', value: IDENTITY_LABELS[scenario.identity], color: C.equityGold },
    { label: '个人投入', value: `¥${fmtMoney(scenario.personalInvestment)}`, color: C.dataBlue },
    { label: '邀请客户', value: `${scenario.invitedCustomers}人`, color: C.flowCyan },
    { label: '转化率', value: `${Math.round(scenario.conversionRate * 100)}%`, color: C.poolPurple },
    { label: '人均投入', value: `¥${fmtMoney(scenario.averageCustomerInvestment)}`, color: C.equityGold },
    { label: '月新增', value: `${scenario.monthlyNewCustomers}人`, color: C.dataBlue },
    { label: '增长率', value: `${Math.round(scenario.monthlyGrowthRate * 100)}%`, color: C.flowCyan },
    { label: '周期', value: `${scenario.projectionMonths}个月`, color: C.poolPurple },
  ]
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1 px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: 'rgba(8, 14, 28, 0.45)', border: '1px solid rgba(74, 184, 255, 0.05)' }}>
          <span className="text-[9px]" style={{ color: C.textMuted }}>{item.label}</span>
          <span className="text-[10px] font-bold" style={{ color: item.color }}>{item.value}</span>
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// 主组件 — ResizeObserver 自适应
// ════════════════════════════════════════════════════════════

export default function PartnerGrowthSandbox() {
  const { currentScenario, setCurrentScenario, setShowRoadshowDeck } = useExhibitionStore()
  const scenario = currentScenario ?? loadEffectiveScenario()
  const result = useMemo(() => calculateGrowth(scenario), [scenario])

  const [playingStep, setPlayingStep] = useState(0)
  const [playbackMonth, setPlaybackMonth] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // ResizeObserver 获取容器真实尺寸
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect
      setSize({ width: cr.width, height: cr.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 根据容器高度判断紧凑模式
  const compact = size.height > 0 && size.height < 720

  const handlePlay = useCallback(() => {
    if (isPlaying) return
    setIsPlaying(true)
    setPlayingStep(0)
    setPlaybackMonth(0)
    const steps = [
      { step: 1, delay: 300 }, { step: 2, delay: 700 }, { step: 3, delay: 1200 },
      { step: 4, delay: 1700 }, { step: 5, delay: 2300 }, { step: 6, delay: 2900 }, { step: 7, delay: 3500 },
    ]
    steps.forEach(({ step, delay }) => setTimeout(() => setPlayingStep(step), delay))
    const interval = setInterval(() => {
      setPlaybackMonth((p) => {
        if (p >= scenario.projectionMonths) {
          clearInterval(interval)
          setTimeout(() => { setIsPlaying(false); setPlayingStep(8) }, 400)
          return p
        }
        return p + 1
      })
    }, 160)
  }, [isPlaying, scenario.projectionMonths])

  const handleIdentityClick = useCallback((identity: PartnerIdentity) => {
    const newScenario = getScenarioByIdentity(identity)
    setCurrentScenario(newScenario)
    setPlayingStep(0)
    setPlaybackMonth(0)
    setIsPlaying(false)
  }, [setCurrentScenario])

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col overflow-hidden">
      {/* 标题栏 — 自然高度 */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-3.5 rounded-full" style={{ background: 'linear-gradient(to bottom, #4AB8FF, #7C5CFF)' }} />
          <div>
            <h2 className="text-sm font-bold tracking-wide" style={{ color: C.textMain }}>合伙权益增长沙盘</h2>
            {!compact && <span className="text-[9px]" style={{ color: C.textMuted }}>神枢算力权益通 · 策略推演</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handlePlay} disabled={isPlaying}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-medium disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, rgba(74,184,255,0.14), rgba(124,92,255,0.1))', color: C.dataBlue, border: '1px solid rgba(74, 184, 255, 0.28)', boxShadow: '0 0 10px rgba(74,184,255,0.06)' }}>
            {isPlaying ? (<><div className="w-2.5 h-2.5 rounded-full border-2 border-current border-t-transparent animate-spin" />推演中</>) : (<><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>播放推演</>)}
          </motion.button>
          <button onClick={() => setShowRoadshowDeck(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-all hover:brightness-110"
            style={{ background: 'rgba(8, 14, 28, 0.45)', color: C.textMuted, border: '1px solid rgba(126, 190, 255, 0.08)' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            路演参数
          </button>
        </div>
      </div>

      {/* 推演假设 — 单行 */}
      <div className="px-4 pb-1.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[8px] tracking-widest uppercase flex-shrink-0" style={{ color: C.textMuted }}>当前推演假设</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(126,190,255,0.1), transparent)' }} />
        </div>
        <div className="mt-1">
          <AssumptionBadge scenario={scenario} />
        </div>
      </div>

      {/* 主内容区 — flex 自适应 */}
      <div className="flex-1 grid grid-cols-12 gap-2 min-h-0 px-4 py-1">
        {/* 左侧 */}
        <div className="col-span-2 h-full min-h-0">
          <div className="h-full rounded-xl overflow-hidden" style={{ background: C.panelBg, border: `1px solid ${C.panelBorder}` }}>
            <IdentityOrbit currentIdentity={scenario.identity} onSelect={handleIdentityClick} />
          </div>
        </div>

        {/* 中间 */}
        <div className="col-span-6 h-full min-h-0 flex flex-col gap-1.5 relative">
          <div className="flex-[3] min-h-0 rounded-xl p-2 relative" style={{ background: C.panelBg, border: `1px solid ${C.panelBorder}` }}>
            <div className="absolute top-2 left-2.5 flex items-center gap-1.5">
              <div className="w-0.5 h-2.5 rounded-full" style={{ background: C.equityGold }} />
              <span className="text-[9px] tracking-wider" style={{ color: C.textMuted }}>合伙权益星核</span>
            </div>
            <div className="absolute top-2 right-2.5 text-[9px] px-1.5 py-px rounded-full" style={{ background: 'rgba(246,201,107,0.06)', color: C.equityGold, border: '1px solid rgba(246,201,107,0.1)' }}>
              系数 ×{IDENTITY_MULTIPLIERS[scenario.identity] ?? 1}
            </div>
            <div className="w-full h-full pt-4">
              <EquityStarCore result={result} playingStep={playingStep} />
            </div>
          </div>
          <div className="flex-[2] min-h-0 grid grid-cols-2 gap-1.5">
            <div className="rounded-xl p-1.5 relative" style={{ background: C.panelBg, border: `1px solid ${C.panelBorder}` }}>
              <div className="absolute top-1.5 left-2 flex items-center gap-1">
                <div className="w-0.5 h-2 rounded-full" style={{ background: C.poolPurple }} />
                <span className="text-[9px] tracking-wider" style={{ color: C.textMuted }}>团队增长网络</span>
              </div>
              <div className="w-full h-full pt-3"><TeamNetwork scenario={scenario} playingStep={playingStep} /></div>
            </div>
            <div className="rounded-xl p-1.5 relative" style={{ background: C.panelBg, border: `1px solid ${C.panelBorder}` }}>
              <div className="absolute top-1.5 left-2 flex items-center gap-1">
                <div className="w-0.5 h-2 rounded-full" style={{ background: C.flowCyan }} />
                <span className="text-[9px] tracking-wider" style={{ color: C.textMuted }}>增长池引擎舱</span>
              </div>
              <div className="w-full h-full pt-3"><GrowthPoolEngine result={result} playingStep={playingStep} /></div>
            </div>
          </div>
          <DataFlowRays playingStep={playingStep} />
        </div>

        {/* 右侧 */}
        <motion.div key={scenario.identity} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
          className="col-span-4 h-full min-h-0 rounded-xl p-2 overflow-hidden" style={{ background: C.panelBg, border: `1px solid ${C.panelBorder}` }}>
          <RevenueDashboard result={result} scenario={scenario} playingStep={playingStep} />
        </motion.div>
      </div>

      {/* 底部轨道 — 自然高度 */}
      <div className="flex-shrink-0 mx-4 mb-2 rounded-xl p-2" style={{ background: C.panelBg, border: `1px solid ${C.panelBorder}` }}>
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-0.5 h-2 rounded-full" style={{ background: C.dataBlue }} />
            <span className="text-[9px] tracking-wider" style={{ color: C.textMuted }}>{scenario.projectionMonths}个月增长轨道</span>
            {isPlaying && <span className="text-[8px] px-1 py-px rounded-full animate-pulse" style={{ background: 'rgba(74,184,255,0.08)', color: C.dataBlue }}>推演中</span>}
          </div>
          <span className="text-[9px]" style={{ color: C.textSub }}>期末权益 <span className="font-bold" style={{ color: C.equityGold }}>¥{fmtMoney(result.monthlyTrack[result.monthlyTrack.length - 1]?.equityShare ?? 0)}</span></span>
        </div>
        <div style={{ height: compact ? '52px' : '60px' }}>
          <BattleTrack track={result.monthlyTrack} months={scenario.projectionMonths} playingStep={playingStep} playbackMonth={playbackMonth} />
        </div>
      </div>
    </div>
  )
}
