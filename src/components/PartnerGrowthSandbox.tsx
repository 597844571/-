import { useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'
import { IDENTITY_LABELS } from '../data/roadshowPreset'
import { loadEffectiveScenario } from '../utils/scenarioStorage'
import { getScenarioByIdentity } from '../data/identityScenarios'
import { calculateGrowth } from '../utils/growthCalculation'
import type { GrowthResult, MonthlyData } from '../utils/growthCalculation'
import type { PartnerIdentity, PartnerGrowthScenario } from '../data/roadshowPreset'

/* ============================================================
   V3.0 合伙权益增长沙盘 — 高端科幻策略星图式路演沙盘
   ============================================================ */

// ── 色彩体系 ──
const C = {
  dataBlue: '#4AB8FF',      // 数据资产
  flowCyan: '#31F4FF',      // 流通
  poolPurple: '#7C5CFF',    // 增长池/算力
  equityGold: '#F6C96B',    // 权益/分成
  coreGlow: '#8A6FFF',
  textMain: '#f0f4ff',
  textSub: '#b0c4e8',
  textMuted: '#6F7F9F',
  panelBg: 'rgba(11, 20, 36, 0.55)',
  panelBorder: 'rgba(126, 190, 255, 0.08)',
  panelBorderActive: 'rgba(74, 184, 255, 0.25)',
}

const IDENTITY_MULTIPLIERS: Record<string, number> = {
  member: 1, team_leader: 1.5, partner_10000: 2,
  partner_30000: 3, partner_50000: 4, cofounder: 6, regional_agent: 8,
}

const IDENTITY_ORDER: PartnerIdentity[] = [
  'member', 'team_leader', 'partner_10000', 'partner_30000',
  'partner_50000', 'cofounder', 'regional_agent',
]

// 每个身份的门槛描述和解锁权益标签
const IDENTITY_META: Record<PartnerIdentity, { threshold: string; unlocks: string[] }> = {
  member: { threshold: '投入 ¥30,000', unlocks: ['产品礼包', '数据资产'] },
  team_leader: { threshold: '投入 ¥80,000', unlocks: ['团队补贴', '推荐奖励'] },
  partner_10000: { threshold: '投入 ¥100,000', unlocks: ['阶梯奖励', '全网分成'] },
  partner_30000: { threshold: '投入 ¥300,000', unlocks: ['算力分成', '消费注入'] },
  partner_50000: { threshold: '投入 ¥500,000', unlocks: ['区域权重', '交易分成'] },
  cofounder: { threshold: '投入 ¥500,000', unlocks: ['联合创始人权', '全网算力'] },
  regional_agent: { threshold: '投入 ¥1,000,000', unlocks: ['区域代理权', '最高分成'] },
}

// ── 辅助：格式化金额 ──
function fmtMoney(v: number) {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (v >= 10000) return `${(v / 10000).toFixed(1)}万`
  return v.toLocaleString()
}
function fmtMoneyFull(v: number) {
  return `¥${v.toLocaleString()}`
}

// ════════════════════════════════════════════════════════════
// 1. 左侧：身份升阶轨道
// ════════════════════════════════════════════════════════════

function IdentityOrbit({
  currentIdentity,
  onSelect,
}: {
  currentIdentity: PartnerIdentity
  onSelect: (id: PartnerIdentity) => void
}) {
  const currentIndex = IDENTITY_ORDER.indexOf(currentIdentity)

  return (
    <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 scrollbar-thin">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-4 rounded-full" style={{ background: C.dataBlue }} />
        <span className="text-xs font-medium tracking-wider" style={{ color: C.textMuted }}>
          身份升阶轨道
        </span>
      </div>

      {IDENTITY_ORDER.map((id, idx) => {
        const isActive = id === currentIdentity
        const isPast = idx < currentIndex
        const meta = IDENTITY_META[id]
        const label = IDENTITY_LABELS[id]
        return (
          <motion.button
            key={id}
            onClick={() => onSelect(id)}
            initial={false}
            animate={{
              scale: isActive ? 1.02 : 1,
              borderColor: isActive ? 'rgba(74,184,255,0.35)' : 'rgba(126,190,255,0.06)',
            }}
            className="relative text-left w-full rounded-xl p-3 transition-all"
            style={{
              background: isActive
                ? 'linear-gradient(135deg, rgba(74,184,255,0.08), rgba(124,92,255,0.06))'
                : 'rgba(11, 20, 36, 0.35)',
              border: `1px solid ${isActive ? 'rgba(74,184,255,0.35)' : 'rgba(126,190,255,0.06)'}`,
              cursor: 'pointer',
            }}
          >
            {/* 轨道连接线 */}
            {idx < IDENTITY_ORDER.length - 1 && (
              <div
                className="absolute left-5 top-full w-px h-2 -z-10"
                style={{
                  background: isPast || isActive
                    ? 'linear-gradient(to bottom, rgba(74,184,255,0.3), rgba(124,92,255,0.15))'
                    : 'rgba(126,190,255,0.06)',
                }}
              />
            )}

            <div className="flex items-center gap-3">
              {/* 身份徽章 */}
              <div
                className="relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(74,184,255,0.2), rgba(124,92,255,0.2))'
                    : 'rgba(126,190,255,0.06)',
                  border: `1px solid ${isActive ? 'rgba(74,184,255,0.4)' : 'rgba(126,190,255,0.1)'}`,
                  boxShadow: isActive ? '0 0 12px rgba(74,184,255,0.2)' : 'none',
                }}
              >
                <span className="text-xs font-bold" style={{ color: isActive ? C.dataBlue : C.textMuted }}>
                  {idx + 1}
                </span>
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ background: 'rgba(74,184,255,0.15)' }}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-medium"
                    style={{ color: isActive ? C.textMain : C.textSub }}
                  >
                    {label}
                  </span>
                  {isActive && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        background: 'rgba(246,201,107,0.12)',
                        color: C.equityGold,
                        border: '1px solid rgba(246,201,107,0.2)',
                      }}
                    >
                      当前
                    </span>
                  )}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>
                  {meta.threshold}
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {meta.unlocks.map((u) => (
                    <span
                      key={u}
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        background: isActive ? 'rgba(74,184,255,0.08)' : 'rgba(126,190,255,0.04)',
                        color: isActive ? C.dataBlue : C.textMuted,
                        border: `1px solid ${isActive ? 'rgba(74,184,255,0.12)' : 'rgba(126,190,255,0.06)'}`,
                      }}
                    >
                      {u}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// 2. 中央：合伙权益星核
// ════════════════════════════════════════════════════════════

function EquityStarCore({
  result,
  playingStep,
}: {
  result: GrowthResult
  playingStep: number
}) {
  const rings = [
    { label: '产品礼包', value: result.productGiftValue, color: C.dataBlue, pct: 0.3 },
    { label: '数据资产', value: result.dataAssetReward, color: C.flowCyan, pct: 0.5 },
    { label: '可流通资产', value: result.tradableAsset, color: C.equityGold, pct: 0.4 },
    { label: '每日释放', value: result.dailyReleaseMax, color: C.poolPurple, pct: 0.008 },
  ]

  const centerVisible = playingStep >= 2 || playingStep === 0
  const ringsVisible = playingStep >= 3 || playingStep === 0

  return (
    <div className="relative w-full aspect-square max-w-[320px] mx-auto flex items-center justify-center">
      {/* 外层背景光环 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(74,184,255,0.06) 0%, transparent 60%)',
        }}
      />

      {/* 旋转轨道环 */}
      <div
        className="absolute w-[92%] h-[92%] rounded-full"
        style={{
          border: '1px dashed rgba(74, 184, 255, 0.08)',
          animation: 'spin 20s linear infinite',
        }}
      />
      <div
        className="absolute w-[88%] h-[88%] rounded-full"
        style={{
          border: '1px solid rgba(124, 92, 255, 0.06)',
          animation: 'spin 15s linear infinite reverse',
        }}
      />

      {/* 多层圆环 */}
      {rings.map((ring, i) => {
        const size = 55 + i * 20
        const delay = ringsVisible ? i * 0.15 : 0
        return (
          <motion.div
            key={ring.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: ringsVisible ? 1 : 0.15,
              scale: ringsVisible ? 1 : 0.9,
            }}
            transition={{ delay, duration: 0.5 }}
            className="absolute rounded-full flex items-center justify-center"
            style={{
              width: `${size}%`,
              height: `${size}%`,
              border: `1.5px solid ${ring.color}25`,
              boxShadow: `inset 0 0 20px ${ring.color}08, 0 0 10px ${ring.color}06`,
            }}
          >
            {/* 光流点 — 围绕圆环轨道旋转 */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                animation: `spin ${8 + i * 2}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
              }}
            >
              <div
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  background: ring.color,
                  boxShadow: `0 0 6px ${ring.color}`,
                  top: '-2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              />
            </div>
            {/* 标签 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: ringsVisible ? 1 : 0 }}
              transition={{ delay: delay + 0.2 }}
              className="absolute text-[11px] font-medium whitespace-nowrap px-2 py-0.5 rounded-full"
              style={{
                color: ring.color,
                background: `${ring.color}10`,
                border: `1px solid ${ring.color}20`,
                top: i % 2 === 0 ? '-10px' : undefined,
                bottom: i % 2 === 1 ? '-10px' : undefined,
              }}
            >
              {ring.label} {fmtMoneyFull(ring.value)}
            </motion.div>
          </motion.div>
        )
      })}

      {/* 中心星核 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: centerVisible ? 1 : 0.3,
          scale: centerVisible ? 1 : 0.8,
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-[26%] h-[26%] rounded-full flex flex-col items-center justify-center z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(74,184,255,0.18), rgba(124,92,255,0.18))',
          border: '1.5px solid rgba(74, 184, 255, 0.35)',
          boxShadow: '0 0 30px rgba(74,184,255,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* 核心脉冲 */}
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            background: 'rgba(74,184,255,0.1)',
            animationDuration: '3s',
          }}
        />
        <span className="text-[10px] tracking-wider" style={{ color: C.textMuted }}>个人投入</span>
        <span className="text-base font-bold mt-0.5" style={{ color: C.equityGold }}>
          {fmtMoneyFull(result.personalInvestment)}
        </span>
      </motion.div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// 3. 团队增长网络（放大版）
// ════════════════════════════════════════════════════════════

function TeamNetwork({
  scenario,
  playingStep,
}: {
  scenario: PartnerGrowthScenario
  playingStep: number
}) {
  const visible = playingStep >= 4 || playingStep === 0

  const nodes = useMemo(() => {
    const count = Math.min(scenario.invitedCustomers + 8, 28)
    const centerX = 200
    const centerY = 200
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3
      const radius = 60 + (i / count) * 110
      const investment = scenario.averageCustomerInvestment * (0.6 + Math.random() * 0.8)
      // 节点大小和颜色根据投入金额
      const size = investment > scenario.averageCustomerInvestment * 1.2 ? 6 :
                   investment > scenario.averageCustomerInvestment * 0.8 ? 4 : 2.5
      const color = investment > scenario.averageCustomerInvestment * 1.2 ? C.equityGold :
                    investment > scenario.averageCustomerInvestment * 0.8 ? C.poolPurple : C.dataBlue
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        size,
        color,
        investment: Math.round(investment),
      }
    })
  }, [scenario.invitedCustomers, scenario.averageCustomerInvestment])

  const centerX = 200
  const centerY = 200

  return (
    <div className="relative w-full" style={{ aspectRatio: '1' }}>
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          <radialGradient id="networkGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(74,184,255,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* 背景光晕 */}
        <circle cx={centerX} cy={centerY} r="180" fill="url(#networkGlow)" />

        {/* 辐射线 */}
        {nodes.map((n, i) => (
          <motion.line
            key={`line-${i}`}
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: visible ? 0.12 : 0, pathLength: visible ? 1 : 0 }}
            transition={{ delay: i * 0.03, duration: 0.4 }}
            x1={centerX}
            y1={centerY}
            x2={n.x}
            y2={n.y}
            stroke={n.color}
            strokeWidth="0.5"
          />
        ))}

        {/* 连接线（近邻之间） */}
        {nodes.map((n, i) =>
          nodes.slice(i + 1).map((m, j) => {
            const dist = Math.hypot(n.x - m.x, n.y - m.y)
            if (dist > 90) return null
            return (
              <motion.line
                key={`conn-${i}-${j}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: visible ? 0.06 : 0 }}
                transition={{ delay: 0.3 + i * 0.02 }}
                x1={n.x}
                y1={n.y}
                x2={m.x}
                y2={m.y}
                stroke={C.dataBlue}
                strokeWidth="0.4"
              />
            )
          })
        )}

        {/* 外圈轨道 */}
        <motion.circle
          cx={centerX}
          cy={centerY}
          r="160"
          fill="none"
          stroke="rgba(74,184,255,0.06)"
          strokeWidth="1"
          strokeDasharray="4 8"
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        />

        {/* 中心节点（个人） */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: visible ? 1 : 0.3, scale: visible ? 1 : 0.5 }}
          transition={{ duration: 0.5 }}
        >
          <circle cx={centerX} cy={centerY} r="14" fill="rgba(246,201,107,0.15)" stroke={C.equityGold} strokeWidth="1.5" />
          <circle cx={centerX} cy={centerY} r="6" fill={C.equityGold} />
          <text x={centerX} y={centerY - 22} textAnchor="middle" fill={C.equityGold} fontSize="10" fontWeight="bold">
            我
          </text>
        </motion.g>

        {/* 客户节点 */}
        {nodes.map((n, i) => (
          <motion.g
            key={`node-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0 }}
            transition={{ delay: 0.2 + i * 0.04, duration: 0.3 }}
          >
            <title>客户投入 ¥{n.investment.toLocaleString()}</title>
            <circle cx={n.x} cy={n.y} r={n.size + 3} fill={n.color} opacity="0.15">
              <animate attributeName="r" values={`${n.size + 3};${n.size + 6};${n.size + 3}`} dur={`${2.5 + Math.random() * 2}s`} repeatCount="indefinite" />
            </circle>
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

function GrowthPoolEngine({
  result,
  playingStep,
}: {
  result: GrowthResult
  playingStep: number
}) {
  const visible = playingStep >= 5 || playingStep === 0
  const totalInjection = result.monthlyTrack.reduce((s, m) => s + m.poolInjection, 0)
  const totalDataAsset = result.monthlyTrack.reduce((s, m) => s + m.dataAsset, 0)
  const totalTeam = result.monthlyTrack.reduce((s, m) => s + m.monthlyInvestment, 0)

  const streams = [
    { label: '累计注入', value: totalInjection, color: C.poolPurple, pct: 100 },
    { label: '数据资产注入', value: totalDataAsset, color: C.dataBlue, pct: Math.round((totalDataAsset / totalInjection) * 100) || 0 },
    { label: '团队业绩注入', value: totalTeam, color: C.equityGold, pct: Math.round((totalTeam / totalInjection) * 100) || 0 },
    { label: '消费注入', value: Math.round(totalInjection * 0.3), color: C.flowCyan, pct: 30 },
  ]

  return (
    <div className="relative w-full flex flex-col items-center justify-center" style={{ aspectRatio: '1' }}>
      {/* 引擎舱外壳 */}
      <div className="relative w-[70%] h-[70%]">
        {/* 外层脉冲 */}
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0.2 }}
          style={{
            background: 'radial-gradient(circle, rgba(124,92,255,0.12) 0%, transparent 65%)',
            animation: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />

        {/* 旋转环 */}
        <div
          className="absolute inset-[8%] rounded-full"
          style={{
            border: '1.5px solid rgba(124, 92, 255, 0.15)',
            animation: 'spin 10s linear infinite',
          }}
        />
        <div
          className="absolute inset-[15%] rounded-full"
          style={{
            border: '1px dashed rgba(74, 184, 255, 0.12)',
            animation: 'spin 7s linear infinite reverse',
          }}
        />

        {/* 核心 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: visible ? 1 : 0.3, scale: visible ? 1 : 0.7 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-[25%] rounded-full flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(124,92,255,0.25), rgba(74,184,255,0.18))',
            border: '1.5px solid rgba(124, 92, 255, 0.4)',
            boxShadow: '0 0 25px rgba(124,92,255,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'rgba(124,92,255,0.1)', animationDuration: '2.5s' }}
          />
          <span className="text-[10px] tracking-wider relative z-10" style={{ color: C.textMuted }}>增长池</span>
          <span className="text-sm font-bold relative z-10 mt-0.5" style={{ color: C.equityGold }}>
            {fmtMoney(totalInjection)}
          </span>
        </motion.div>

        {/* 金色脉冲环 */}
        <motion.div
          className="absolute inset-[5%] rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          style={{
            border: '1px solid rgba(246, 201, 107, 0.15)',
            animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      </div>

      {/* 注入流标签 */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 w-full px-2">
        {streams.slice(1).map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 5 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-1.5"
          >
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-[10px]" style={{ color: C.textMuted }}>{s.label}</span>
            <span className="text-[10px] font-medium" style={{ color: s.color }}>{fmtMoney(s.value)}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// 5. 右侧：收益总控台
// ════════════════════════════════════════════════════════════

function RevenueDashboard({
  result,
  scenario,
  playingStep,
}: {
  result: GrowthResult
  scenario: PartnerGrowthScenario
  playingStep: number
}) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const totalAsset = scenario.projectionMonths === 36 ? result.totalAsset36M : result.totalAsset12M
  const roi = scenario.projectionMonths === 36 ? result.roi36M : result.roi12M
  const months = scenario.projectionMonths

  const multiplier = IDENTITY_MULTIPLIERS[scenario.identity] ?? 1

  const groups = [
    {
      key: 'basic',
      title: '基础权益',
      color: C.dataBlue,
      items: [
        { title: '产品礼包', value: result.productGiftValue, desc: '投入 × 30% × 系数', formula: `${fmtMoney(scenario.personalInvestment)} × 30% × ${multiplier}` },
        { title: '数据资产奖励', value: result.dataAssetReward, desc: '投入 × 50% × 系数', formula: `${fmtMoney(scenario.personalInvestment)} × 50% × ${multiplier}` },
        { title: '可流通资产', value: result.tradableAsset, desc: '数据资产的 40%', formula: `${fmtMoney(result.dataAssetReward)} × 40%` },
        { title: '每日释放', value: result.dailyReleaseMax, desc: '数据资产 × 0.8%', formula: `${fmtMoney(result.dataAssetReward)} × 0.8%` },
      ],
    },
    {
      key: 'growth',
      title: '增长权益',
      color: C.poolPurple,
      items: [
        { title: '推荐奖励', value: result.referralReward, desc: '团队投入 × 5% × 系数', formula: `团队投入 × 5% × ${multiplier}` },
        { title: '团队补贴', value: result.teamSubsidy, desc: '团队投入 × 3% × 系数', formula: `团队投入 × 3% × ${multiplier}` },
        { title: '阶梯业绩奖励', value: result.tierBonus, desc: '团队投入 × 2% × 时间', formula: `团队投入 × 2% × ${months}/12` },
      ],
    },
    {
      key: 'share',
      title: '分成权益（月度）',
      color: C.equityGold,
      items: [
        { title: '全网销售额分成', value: result.globalSalesShare, desc: '权益份额 × 20%', formula: `权益份额 × 20%` },
        { title: '算力收益分成', value: result.computeIncomeShare, desc: '权益份额 × 15%', formula: `权益份额 × 15%` },
        { title: '区域销售额分成', value: result.regionalSalesShare, desc: '权益份额 × 25%', formula: `权益份额 × 25%` },
      ],
    },
  ]

  const resultVisible = playingStep >= 7 || playingStep === 0

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* 顶部年度大结果 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: resultVisible ? 1 : 0.3, y: resultVisible ? 0 : -5 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl p-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(246,201,107,0.08), rgba(124,92,255,0.06))',
          border: '1px solid rgba(246, 201, 107, 0.18)',
        }}
      >
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full" style={{ background: 'radial-gradient(circle, rgba(246,201,107,0.06), transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="text-[11px] tracking-wider mb-1" style={{ color: C.textMuted }}>
          {months}个月累计总权益
        </div>
        <div className="text-2xl font-bold tracking-tight" style={{ color: C.equityGold }}>
          ¥{totalAsset.toLocaleString()}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div>
            <span className="text-[10px]" style={{ color: C.textMuted }}>投资回报率</span>
            <div className="text-sm font-bold" style={{ color: C.flowCyan }}>{roi}%</div>
          </div>
          <div className="w-px h-6" style={{ background: 'rgba(126,190,255,0.1)' }} />
          <div>
            <span className="text-[10px]" style={{ color: C.textMuted }}>期末月度分成</span>
            <div className="text-sm font-bold" style={{ color: C.dataBlue }}>
              ¥{result.monthlyTrack[result.monthlyTrack.length - 1]?.equityShare.toLocaleString() ?? 0}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 三组折叠面板 */}
      {groups.map((group, gi) => (
        <motion.div
          key={group.key}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: gi * 0.08, duration: 0.4 }}
          className="rounded-xl overflow-hidden"
          style={{
            background: C.panelBg,
            border: `1px solid ${C.panelBorder}`,
          }}
        >
          <button
            onClick={() => setExpandedGroup(expandedGroup === group.key ? null : group.key)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-left"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 rounded-full" style={{ background: group.color }} />
              <span className="text-xs font-medium" style={{ color: C.textSub }}>{group.title}</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ background: `${group.color}12`, color: group.color }}
              >
                {group.items.length}项
              </span>
            </div>
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textMuted}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="transition-transform"
              style={{ transform: expandedGroup === group.key ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <AnimatePresence>
            {expandedGroup === group.key && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 flex flex-col gap-2">
                  {group.items.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg"
                      style={{ background: 'rgba(126,190,255,0.03)' }}
                    >
                      <div>
                        <div className="text-[11px]" style={{ color: C.textSub }}>{item.title}</div>
                        <div className="text-[10px]" style={{ color: C.textMuted }}>{item.formula}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold tabular-nums" style={{ color: group.color }}>
                          ¥{item.value.toLocaleString()}
                        </div>
                        <div className="text-[10px]" style={{ color: C.textMuted }}>{item.desc}</div>
                      </div>
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
// 6. 底部：12个月作战轨道
// ════════════════════════════════════════════════════════════

function BattleTrack({
  track,
  months,
  playingStep,
  playbackMonth,
}: {
  track: MonthlyData[]
  months: number
  playingStep: number
  playbackMonth: number
}) {
  const data = track.slice(0, months)
  if (data.length === 0) return null

  const maxVal = Math.max(...data.map((d) => d.equityShare))
  const w = 900
  const h = 140
  const padLeft = 60
  const padRight = 20
  const padTop = 20
  const padBottom = 36

  const chartW = w - padLeft - padRight
  const chartH = h - padTop - padBottom

  const getX = (i: number) => padLeft + (i / (data.length - 1)) * chartW
  const getY = (v: number) => padTop + chartH - (v / (maxVal || 1)) * chartH

  const points = data.map((d, i) => `${getX(i)},${getY(d.equityShare)}`).join(' ')

  // 播放时逐月点亮
  const activeMonths = playingStep >= 8 && playbackMonth > 0
    ? Math.min(playbackMonth, data.length)
    : data.length

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ minWidth: '700px' }}>
        <defs>
          <linearGradient id="battleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={C.dataBlue} />
            <stop offset="100%" stopColor={C.poolPurple} />
          </linearGradient>
          <linearGradient id="battleArea" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(74, 184, 255, 0.1)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* 背景网格 */}
        {[0, 0.5, 1].map((ratio) => {
          const y = padTop + chartH * (1 - ratio)
          return (
            <line
              key={ratio}
              x1={padLeft}
              y1={y}
              x2={w - padRight}
              y2={y}
              stroke="rgba(126, 190, 255, 0.05)"
              strokeWidth="0.5"
            />
          )
        })}

        {/* 填充区域（仅活跃部分） */}
        {activeMonths > 1 && (
          <polygon
            points={`${padLeft},${padTop + chartH} ${data.slice(0, activeMonths).map((d, i) => `${getX(i)},${getY(d.equityShare)}`).join(' ')} ${getX(activeMonths - 1)},${padTop + chartH}`}
            fill="url(#battleArea)"
          />
        )}

        {/* 完整轨道线（灰色底） */}
        <polyline
          points={points}
          fill="none"
          stroke="rgba(126, 190, 255, 0.08)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 活跃轨道线 */}
        {activeMonths > 1 && (
          <polyline
            points={data.slice(0, activeMonths).map((d, i) => `${getX(i)},${getY(d.equityShare)}`).join(' ')}
            fill="none"
            stroke="url(#battleGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* 月份节点 */}
        {data.map((d, i) => {
          const x = getX(i)
          const y = getY(d.equityShare)
          const isActive = i < activeMonths
          const isCurrent = i === activeMonths - 1 && playingStep >= 8

          return (
            <g key={i}>
              {/* 节点底座 */}
              <circle
                cx={x}
                cy={y}
                r={isCurrent ? 8 : isActive ? 5 : 3}
                fill={isActive ? `${C.dataBlue}20` : 'rgba(126,190,255,0.04)'}
              />
              {/* 节点核心 */}
              <circle
                cx={x}
                cy={y}
                r={isCurrent ? 4 : isActive ? 3 : 2}
                fill={isActive ? C.dataBlue : 'rgba(111,127,159,0.3)'}
                style={{
                  filter: isCurrent ? `drop-shadow(0 0 4px ${C.dataBlue})` : 'none',
                }}
              />
              {/* 当前节点脉冲 */}
              {isCurrent && (
                <circle cx={x} cy={y} r="8" fill="none" stroke={C.dataBlue} strokeWidth="1" opacity="0.4">
                  <animate attributeName="r" values="6;12;6" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}

              {/* X轴标签 */}
              {i % Math.max(1, Math.floor(data.length / 8)) === 0 && (
                <text x={x} y={padTop + chartH + 16} textAnchor="middle" fill={isActive ? C.textSub : C.textMuted} fontSize="10">
                  {d.month}月
                </text>
              )}

              {/* 悬停提示 */}
              <title>第{d.month}月 | 新增{d.newCustomers}人 | 累计投入¥{d.cumulativeInvestment.toLocaleString()} | 权益分成¥{d.equityShare.toLocaleString()}</title>
            </g>
          )
        })}

        {/* Y轴标题 */}
        <text x={12} y={padTop - 4} fill={C.textMuted} fontSize="10">权益分成</text>
      </svg>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// 7. 顶部推演假设铭牌
// ════════════════════════════════════════════════════════════

function AssumptionBadge({ scenario }: { scenario: PartnerGrowthScenario }) {
  const items = [
    { label: '身份', value: IDENTITY_LABELS[scenario.identity], color: C.equityGold, icon: '◆' },
    { label: '个人投入', value: fmtMoneyFull(scenario.personalInvestment), color: C.dataBlue, icon: '◇' },
    { label: '邀请客户', value: `${scenario.invitedCustomers}人`, color: C.flowCyan, icon: '○' },
    { label: '转化率', value: `${Math.round(scenario.conversionRate * 100)}%`, color: C.poolPurple, icon: '△' },
    { label: '人均投入', value: fmtMoneyFull(scenario.averageCustomerInvestment), color: C.equityGold, icon: '◇' },
    { label: '月新增', value: `${scenario.monthlyNewCustomers}人`, color: C.dataBlue, icon: '○' },
    { label: '月增长率', value: `${Math.round(scenario.monthlyGrowthRate * 100)}%`, color: C.flowCyan, icon: '△' },
    { label: '推演周期', value: `${scenario.projectionMonths}个月`, color: C.poolPurple, icon: '◆' },
  ]

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg flex-shrink-0"
          style={{
            background: 'rgba(11, 20, 36, 0.5)',
            border: '1px solid rgba(126, 190, 255, 0.08)',
          }}
        >
          <span style={{ color: item.color, fontSize: '8px' }}>{item.icon}</span>
          <span className="text-[10px]" style={{ color: C.textMuted }}>{item.label}</span>
          <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}</span>
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// 主组件
// ════════════════════════════════════════════════════════════

export default function PartnerGrowthSandbox() {
  const { currentScenario, setCurrentScenario, setShowRoadshowDeck } = useExhibitionStore()
  const scenario = currentScenario ?? loadEffectiveScenario()
  const result = useMemo(() => calculateGrowth(scenario), [scenario])

  // 播放推演状态
  const [playingStep, setPlayingStep] = useState(0)
  const [playbackMonth, setPlaybackMonth] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = useCallback(() => {
    if (isPlaying) return
    setIsPlaying(true)
    setPlayingStep(0)
    setPlaybackMonth(0)

    const steps = [
      { step: 1, delay: 300 },   // 身份点亮
      { step: 2, delay: 800 },   // 投入进入权益核心
      { step: 3, delay: 1400 },  // 数据资产生成
      { step: 4, delay: 2000 },  // 团队节点扩散
      { step: 5, delay: 2800 },  // 增长池注入
      { step: 6, delay: 3400 },  // 分成光流
      { step: 7, delay: 4000 },  // 年度结果出现
    ]

    steps.forEach(({ step, delay }) => {
      setTimeout(() => setPlayingStep(step), delay)
    })

    // 12个月轨道推进
    const monthInterval = setInterval(() => {
      setPlaybackMonth((prev) => {
        if (prev >= scenario.projectionMonths) {
          clearInterval(monthInterval)
          setTimeout(() => {
            setIsPlaying(false)
            setPlayingStep(8)
          }, 500)
          return prev
        }
        return prev + 1
      })
    }, 250)

    return () => clearInterval(monthInterval)
  }, [isPlaying, scenario.projectionMonths])

  // 切换身份时重置播放
  const handleIdentityClick = useCallback((identity: PartnerIdentity) => {
    const newScenario = getScenarioByIdentity(identity)
    setCurrentScenario(newScenario)
    setPlayingStep(0)
    setPlaybackMonth(0)
    setIsPlaying(false)
  }, [setCurrentScenario])

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col p-5 pt-[72px]">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #4AB8FF, #7C5CFF)' }} />
          <div>
            <h2 className="text-lg font-bold tracking-wide" style={{ color: C.textMain }}>
              合伙权益增长沙盘
            </h2>
            <div className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>
              神枢算力权益通 · 全国算力生态数字展厅
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 播放推演按钮 */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handlePlay}
            disabled={isPlaying}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, rgba(74,184,255,0.18), rgba(124,92,255,0.15))',
              color: C.dataBlue,
              border: '1px solid rgba(74, 184, 255, 0.35)',
              boxShadow: '0 0 15px rgba(74,184,255,0.1)',
            }}
          >
            {isPlaying ? (
              <>
                <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                推演中...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                播放收益推演
              </>
            )}
          </motion.button>

          {/* 路演参数入口（弱化） */}
          <button
            onClick={() => setShowRoadshowDeck(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all hover:brightness-110"
            style={{
              background: 'rgba(11, 20, 36, 0.5)',
              color: C.textMuted,
              border: '1px solid rgba(126, 190, 255, 0.1)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            路演参数
          </button>
        </div>
      </div>

      {/* 推演假设铭牌 */}
      <div className="flex-shrink-0 mb-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] tracking-widest uppercase" style={{ color: C.textMuted }}>当前推演假设</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(126,190,255,0.15), transparent)' }} />
        </div>
        <AssumptionBadge scenario={scenario} />
      </div>

      {/* 主内容区 */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* 左侧：身份升阶轨道 */}
        <div className="col-span-2 min-h-0">
          <IdentityOrbit
            currentIdentity={scenario.identity}
            onSelect={handleIdentityClick}
          />
        </div>

        {/* 中间：星核 + 星图 + 引擎 */}
        <div className="col-span-6 flex flex-col gap-3 min-h-0">
          {/* 上方：权益星核（占主要空间） */}
          <div
            className="flex-1 rounded-xl p-4 flex flex-col min-h-0"
            style={{
              background: 'rgba(11, 20, 36, 0.45)',
              border: '1px solid rgba(126, 190, 255, 0.08)',
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 rounded-full" style={{ background: C.equityGold }} />
                <span className="text-xs font-medium" style={{ color: C.textMuted }}>合伙权益星核</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(246,201,107,0.08)', color: C.equityGold, border: '1px solid rgba(246,201,107,0.12)' }}>
                身份系数 ×{IDENTITY_MULTIPLIERS[scenario.identity] ?? 1}
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0">
              <EquityStarCore result={result} playingStep={playingStep} />
            </div>
          </div>

          {/* 下方：团队网络 + 增长池引擎 */}
          <div className="grid grid-cols-2 gap-3 flex-shrink-0" style={{ height: '220px' }}>
            <div
              className="rounded-xl p-3 flex flex-col"
              style={{
                background: 'rgba(11, 20, 36, 0.45)',
                border: '1px solid rgba(126, 190, 255, 0.08)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-3 rounded-full" style={{ background: C.poolPurple }} />
                <span className="text-xs font-medium" style={{ color: C.textMuted }}>团队增长网络</span>
              </div>
              <div className="flex-1 min-h-0">
                <TeamNetwork scenario={scenario} playingStep={playingStep} />
              </div>
            </div>
            <div
              className="rounded-xl p-3 flex flex-col"
              style={{
                background: 'rgba(11, 20, 36, 0.45)',
                border: '1px solid rgba(126, 190, 255, 0.08)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-3 rounded-full" style={{ background: C.flowCyan }} />
                <span className="text-xs font-medium" style={{ color: C.textMuted }}>增长池引擎舱</span>
              </div>
              <div className="flex-1 min-h-0">
                <GrowthPoolEngine result={result} playingStep={playingStep} />
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：收益总控台 */}
        <motion.div
          key={scenario.identity}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="col-span-4 min-h-0 overflow-y-auto pr-1 scrollbar-thin"
        >
          <RevenueDashboard result={result} scenario={scenario} playingStep={playingStep} />
        </motion.div>
      </div>

      {/* 底部：12个月作战轨道 */}
      <div
        className="mt-3 rounded-xl p-4 flex-shrink-0"
        style={{
          background: 'rgba(11, 20, 36, 0.45)',
          border: '1px solid rgba(126, 190, 255, 0.08)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 rounded-full" style={{ background: C.dataBlue }} />
            <span className="text-xs font-medium" style={{ color: C.textMuted }}>
              {scenario.projectionMonths}个月作战轨道
            </span>
            {isPlaying && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full animate-pulse" style={{ background: 'rgba(74,184,255,0.12)', color: C.dataBlue }}>
                推演中
              </span>
            )}
          </div>
          <span className="text-[11px]" style={{ color: C.textSub }}>
            期末权益分成
            <span className="font-bold ml-1" style={{ color: C.equityGold }}>
              ¥{result.monthlyTrack[result.monthlyTrack.length - 1]?.equityShare.toLocaleString() ?? 0}
            </span>
          </span>
        </div>
        <div style={{ height: '140px' }}>
          <BattleTrack
            track={result.monthlyTrack}
            months={scenario.projectionMonths}
            playingStep={playingStep}
            playbackMonth={playbackMonth}
          />
        </div>
      </div>
    </div>
  )
}
