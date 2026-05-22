import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'
import { IDENTITY_LABELS } from '../data/roadshowPreset'
import { loadEffectiveScenario } from '../utils/scenarioStorage'
import { getScenarioByIdentity } from '../data/identityScenarios'
import { calculateGrowth } from '../utils/growthCalculation'
import type { GrowthResult } from '../utils/growthCalculation'
import type { PartnerIdentity } from '../data/roadshowPreset'

/* ============================================================
   V2.0 合伙权益增长沙盘
   左侧身份阶梯 + 中间权益核心/增长星图/增长池 + 右侧收益铭牌 + 底部增长轨道
   性能：纯 CSS/SVG，无 Three.js
   ============================================================ */

const COLORS = [
  '#4AB8FF', '#31F4FF', '#7C5CFF', '#F6C96B', '#FF8C42', '#4ECDC4', '#95E1D3',
]

/** 数字递增动画 — 简化版，直接用文本 */
function MetricValue({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  return (
    <span className="text-xl font-bold tabular-nums" style={{ color: 'var(--gold-core)' }}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  )
}

/** 身份系数映射 */
const IDENTITY_MULTIPLIERS: Record<string, number> = {
  member: 1, team_leader: 1.5, partner_10000: 2,
  partner_30000: 3, partner_50000: 4, cofounder: 6, regional_agent: 8,
}

/** 收益铭牌卡片 — 带计算过程展示 */
function RevenueBadge({
  title,
  value,
  prefix = '',
  suffix = '',
  source,
  formula,
  delay,
}: {
  title: string
  value: number
  prefix?: string
  suffix?: string
  source: string
  formula?: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-xl p-4"
      style={{
        background: 'rgba(11, 20, 36, 0.6)',
        border: '1px solid rgba(126, 190, 255, 0.1)',
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{title}</span>
        {formula && (
          <span className="text-[11px]" style={{ color: 'var(--text-sub)' }}>{formula}</span>
        )}
      </div>
      <MetricValue value={value} prefix={prefix} suffix={suffix} />
      <div className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
        {source}
      </div>
    </motion.div>
  )
}

/** 增长轨道 — SVG 折线（带 Y 轴刻度、数值标签、悬停提示） */
function GrowthTrack({ track, months }: { track: GrowthResult['monthlyTrack']; months: number }) {
  const data = track.slice(0, months)
  if (data.length === 0) return null

  const maxVal = Math.max(...data.map((d) => d.equityShare))
  const w = 800
  const h = 160
  const padLeft = 72
  const padRight = 24
  const padTop = 24
  const padBottom = 32

  const chartW = w - padLeft - padRight
  const chartH = h - padTop - padBottom

  const getX = (i: number) => padLeft + (i / (data.length - 1)) * chartW
  const getY = (v: number) => padTop + chartH - (v / (maxVal || 1)) * chartH

  const points = data.map((d, i) => `${getX(i)},${getY(d.equityShare)}`).join(' ')

  // Y 轴刻度：取 0、一半、最大值，格式化
  const yTicks = [0, Math.round(maxVal / 2), Math.round(maxVal)]
  const formatK = (v: number) => v >= 10000 ? `${(v / 10000).toFixed(0)}万` : `${v}`

  // 显示数值标签的节点：起点、终点、中间取 2 个
  const labelIndices = [0, Math.floor(data.length / 3), Math.floor((data.length * 2) / 3), data.length - 1]

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ minWidth: '600px' }}>
        <defs>
          <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4AB8FF" />
            <stop offset="100%" stopColor="#7C5CFF" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(74, 184, 255, 0.12)" />
            <stop offset="100%" stopColor="rgba(74, 184, 255, 0)" />
          </linearGradient>
        </defs>

        {/* Y 轴刻度线与标签 */}
        {yTicks.map((tick) => {
          const y = getY(tick)
          return (
            <g key={tick}>
              <line x1={padLeft} y1={y} x2={w - padRight} y2={y} stroke="rgba(126, 190, 255, 0.06)" strokeWidth="0.5" />
              <text x={padLeft - 8} y={y + 4} textAnchor="end" fill="#6F7F9F" fontSize="11">{formatK(tick)}</text>
            </g>
          )
        })}

        {/* 填充区域 */}
        <polygon
          points={`${padLeft},${padTop + chartH} ${points} ${w - padRight},${padTop + chartH}`}
          fill="url(#areaGradient)"
        />

        {/* 折线 */}
        <polyline points={points} fill="none" stroke="url(#trackGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* 数据点 + 标签 + 悬停提示 */}
        {data.map((d, i) => {
          const x = getX(i)
          const y = getY(d.equityShare)
          const showLabel = labelIndices.includes(i)
          return (
            <g key={i}>
              {/* 悬停提示（SVG title） */}
              <title>第{d.month}月：权益分成 ¥{d.equityShare.toLocaleString()}</title>
              {/* 外发光圈 */}
              <circle cx={x} cy={y} r="6" fill="rgba(74,184,255,0.15)" />
              {/* 数据点 */}
              <circle cx={x} cy={y} r="3" fill="#4AB8FF" />
              {/* 数值标签（关键节点） */}
              {showLabel && (
                <text x={x} y={y - 10} textAnchor="middle" fill="#F6C96B" fontSize="11" fontWeight="bold">
                  ¥{(d.equityShare / 10000).toFixed(1)}万
                </text>
              )}
              {/* X 轴月份标签 */}
              {i % Math.ceil(data.length / 6) === 0 && (
                <text x={x} y={padTop + chartH + 18} textAnchor="middle" fill="#6F7F9F" fontSize="12">
                  {d.month}月
                </text>
              )}
            </g>
          )
        })}

        {/* Y 轴标题 */}
        <text x={16} y={padTop - 6} fill="#6F7F9F" fontSize="11">权益分成 (¥)</text>
      </svg>
    </div>
  )
}

/** 增长轨道面板 — 可折叠 */
function GrowthTrackPanel({ track, months }: { track: GrowthResult['monthlyTrack']; months: number }) {
  const [expanded, setExpanded] = useState(true)
  const data = track.slice(0, months)
  const finalValue = data[data.length - 1]?.equityShare ?? 0

  return (
    <div
      className="mt-4 rounded-xl p-4 flex-shrink-0"
      style={{
        background: 'rgba(11, 20, 36, 0.5)',
        border: '1px solid rgba(126, 190, 255, 0.08)',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            增长轨道
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,184,255,0.1)', color: 'var(--blue-core)', border: '1px solid rgba(74,184,255,0.2)' }}>
            {months}个月
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: 'var(--text-sub)' }}>
            期末权益分成 <span className="font-bold" style={{ color: 'var(--gold-core)' }}>¥{finalValue.toLocaleString()}</span>
          </span>
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="transition-transform"
            style={{
              color: 'var(--text-muted)',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="mt-3 overflow-hidden"
        >
          <div style={{ height: '180px' }}>
            <GrowthTrack track={track} months={months} />
          </div>
        </motion.div>
      )}
    </div>
  )
}

/** 个人权益核心 — 同心圆 */
function PersonalEquityCore({ result }: { result: GrowthResult }) {
  const rings = [
    { label: '产品礼包', value: result.productGiftValue, color: '#4AB8FF' },
    { label: '数据资产', value: result.dataAssetReward, color: '#31F4FF' },
    { label: '每日释放', value: result.dailyReleaseMax, color: '#7C5CFF' },
    { label: '可流通资产', value: result.tradableAsset, color: '#F6C96B' },
  ]

  return (
    <div className="relative w-full aspect-square max-w-[280px] mx-auto flex items-center justify-center">
      {rings.map((ring, i) => {
        const size = 100 + i * 40
        return (
          <div
            key={i}
            className="absolute rounded-full flex items-center justify-center"
            style={{
              width: `${size}%`,
              height: `${size}%`,
              border: `1px solid ${ring.color}20`,
              animation: `pulse ${3 + i * 0.5}s ease-in-out infinite`,
            }}
          >
            <div
              className="absolute text-xs whitespace-nowrap"
              style={{
                color: ring.color,
                top: i % 2 === 0 ? '-12px' : undefined,
                bottom: i % 2 === 1 ? '-12px' : undefined,
              }}
            >
              {ring.label} ¥{ring.value.toLocaleString()}
            </div>
          </div>
        )
      })}
      {/* 中心 */}
      <div
        className="relative w-20 h-20 rounded-full flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(74,184,255,0.15), rgba(124,92,255,0.15))',
          border: '1px solid rgba(74, 184, 255, 0.3)',
          boxShadow: '0 0 20px rgba(74,184,255,0.15)',
        }}
      >
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>投入</span>
        <span className="text-sm font-bold" style={{ color: 'var(--gold-core)' }}>
          ¥{result.personalInvestment.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

/** 团队增长星图 — 简化版节点 */
function TeamGrowthConstellation({ scenario }: { scenario: { invitedCustomers: number; monthlyNewCustomers: number } }) {
  const nodes = useMemo(() => {
    const count = Math.min(scenario.invitedCustomers + 6, 20)
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2
      const radius = 80 + Math.random() * 40
      return {
        x: 150 + Math.cos(angle) * radius,
        y: 150 + Math.sin(angle) * radius,
        size: i < 3 ? 5 : i < 8 ? 3 : 2,
        color: i < 3 ? '#F6C96B' : i < 8 ? '#7C5CFF' : '#4AB8FF',
      }
    })
  }, [scenario.invitedCustomers])

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[240px] mx-auto">
      {/* 连线 */}
      {nodes.map((n, i) =>
        nodes.slice(i + 1).map((m, j) => {
          const dist = Math.hypot(n.x - m.x, n.y - m.y)
          if (dist > 120) return null
          return (
            <line
              key={`${i}-${j}`}
              x1={n.x}
              y1={n.y}
              x2={m.x}
              y2={m.y}
              stroke="rgba(74, 184, 255, 0.08)"
              strokeWidth="0.5"
            />
          )
        })
      )}
      {/* 节点 */}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.size + 2} fill={n.color} opacity="0.2">
            <animate attributeName="r" values={`${n.size + 2};${n.size + 5};${n.size + 2}`} dur={`${2 + Math.random() * 2}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={n.x} cy={n.y} r={n.size} fill={n.color} />
        </g>
      ))}
      {/* 中心 */}
      <circle cx="150" cy="150" r="8" fill="rgba(246, 201, 107, 0.3)" stroke="#F6C96B" strokeWidth="1" />
    </svg>
  )
}

export default function PartnerGrowthSandbox() {
  const { currentScenario, setCurrentScenario, setShowRoadshowDeck } = useExhibitionStore()

  // 优先使用 currentScenario（实时推演），否则加载默认方案
  const scenario = currentScenario ?? loadEffectiveScenario()
  const result = useMemo(() => calculateGrowth(scenario), [scenario])

  const identityLabel = IDENTITY_LABELS[scenario.identity] ?? '普通会员'

  // 中间计算变量（供公式可视化使用）
  const multiplier = IDENTITY_MULTIPLIERS[scenario.identity] ?? 1
  const months = result.monthlyTrack.length

  const productFormula = `${scenario.personalInvestment.toLocaleString()} × 30% × ${multiplier}`
  const dataFormula = `${scenario.personalInvestment.toLocaleString()} × 50% × ${multiplier}`
  const tradableFormula = `${scenario.personalInvestment.toLocaleString()} × 50% × ${multiplier} × 40%`
  const referralFormula = `${scenario.invitedCustomers}人 × ¥${scenario.averageCustomerInvestment.toLocaleString()} × ${(scenario.conversionRate * 100).toFixed(0)}%`
  const trackLast = result.monthlyTrack[months - 1] || { cumulativeInvestment: 0 }
  const growthFormula = `第${months}月团队累计 ¥${Math.round(trackLast.cumulativeInvestment).toLocaleString()}`
  const shareFormula = `年化团队业绩 × 系数${multiplier}`

  // 点击身份阶梯切换默认方案
  const handleIdentityClick = (identity: PartnerIdentity) => {
    const newScenario = getScenarioByIdentity(identity)
    setCurrentScenario(newScenario)
  }

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col p-6 pt-20">
      {/* 顶部标题 */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
            合伙权益增长沙盘
          </h2>
          <div className="flex items-center gap-4 mt-1.5">
            <span className="text-sm" style={{ color: 'var(--text-sub)' }}>
              当前身份：<span className="font-medium" style={{ color: 'var(--blue-core)' }}>{identityLabel}</span>
            </span>
            <span className="text-sm" style={{ color: 'var(--text-sub)' }}>
              方案：<span className="font-medium" style={{ color: 'var(--gold-core)' }}>{scenario.name}</span>
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowRoadshowDeck(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:brightness-110 flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, rgba(74,184,255,0.12), rgba(124,92,255,0.12))',
            color: 'var(--blue-core)',
            border: '1px solid rgba(74, 184, 255, 0.3)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          调整推演参数
        </button>
      </div>

      {/* 推演参数看板 — 路演讲解用 */}
      <div className="flex-shrink-0 flex items-center gap-3 mb-4 overflow-x-auto pb-1">
        {[
          { label: '个人投入', value: `¥${scenario.personalInvestment.toLocaleString()}`, color: 'var(--gold-core)' },
          { label: '邀请客户', value: `${scenario.invitedCustomers}人`, color: 'var(--blue-core)' },
          { label: '转化率', value: `${Math.round(scenario.conversionRate * 100)}%`, color: 'var(--cyan-flow)' },
          { label: '客户人均投入', value: `¥${scenario.averageCustomerInvestment.toLocaleString()}`, color: 'var(--gold-core)' },
          { label: '月新增客户', value: `${scenario.monthlyNewCustomers}人`, color: 'var(--blue-core)' },
          { label: '月均增长率', value: `${Math.round(scenario.monthlyGrowthRate * 100)}%`, color: 'var(--cyan-flow)' },
          { label: '推演周期', value: `${scenario.projectionMonths}个月`, color: 'var(--purple-accent, #7C5CFF)' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 px-3 py-2 rounded-lg flex-shrink-0"
            style={{
              background: 'rgba(11, 20, 36, 0.6)',
              border: '1px solid rgba(126, 190, 255, 0.1)',
            }}
          >
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
            <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* 主内容区 — 三栏布局 */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* 左侧：身份阶梯 */}
        <div className="col-span-3 flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-thin h-full">
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            身份阶梯
          </h3>
          {Object.entries(IDENTITY_LABELS).map(([key, label], i) => {
            const isActive = scenario.identity === key
            return (
              <button
                key={key}
                onClick={() => handleIdentityClick(key as PartnerIdentity)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left w-full group"
                style={{
                  background: isActive ? 'rgba(74, 184, 255, 0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(74, 184, 255, 0.25)' : '1px solid transparent',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                    e.currentTarget.style.border = '1px solid rgba(126, 190, 255, 0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.border = '1px solid transparent'
                  }
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background: isActive ? COLORS[i % COLORS.length] : 'rgba(111, 127, 159, 0.3)',
                    boxShadow: isActive ? `0 0 6px ${COLORS[i % COLORS.length]}` : 'none',
                  }}
                />
                <span
                  className="text-sm"
                  style={{ color: isActive ? 'var(--text-main)' : 'var(--text-muted)' }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>

        {/* 中间：个人权益核心 + 团队增长星图 + 增长池 */}
        <div className="col-span-5 flex flex-col gap-4 overflow-y-auto">
          {/* 个人权益核心 */}
          <div
            className="rounded-xl p-4 flex-1 flex flex-col"
            style={{
              background: 'rgba(11, 20, 36, 0.5)',
              border: '1px solid rgba(126, 190, 255, 0.08)',
            }}
          >
            <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
              个人权益核心
            </h3>
            <div className="flex-1 flex items-center justify-center">
              <PersonalEquityCore result={result} />
            </div>
          </div>

          {/* 团队增长星图 + 增长池 */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-xl p-3"
              style={{
                background: 'rgba(11, 20, 36, 0.5)',
                border: '1px solid rgba(126, 190, 255, 0.08)',
              }}
            >
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                团队增长星图
              </h3>
              <TeamGrowthConstellation scenario={scenario} />
            </div>
            <div
              className="rounded-xl p-3 flex flex-col items-center justify-center"
              style={{
                background: 'rgba(11, 20, 36, 0.5)',
                border: '1px solid rgba(126, 190, 255, 0.08)',
              }}
            >
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                增长池核心
              </h3>
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* 外层脉冲光环 */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(124,92,255,0.15) 0%, transparent 65%)',
                    animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  }}
                />
                {/* 中层旋转光环 */}
                <div
                  className="absolute w-20 h-20 rounded-full"
                  style={{
                    border: '1px solid rgba(74, 184, 255, 0.15)',
                    animation: 'spin 8s linear infinite',
                  }}
                />
                <div
                  className="absolute w-20 h-20 rounded-full"
                  style={{
                    border: '1px dashed rgba(124, 92, 255, 0.2)',
                    animation: 'spin 12s linear infinite reverse',
                  }}
                />
                {/* 核心 */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center relative z-10"
                  style={{
                    background: 'linear-gradient(135deg, rgba(74,184,255,0.2), rgba(124,92,255,0.2))',
                    border: '1px solid rgba(74, 184, 255, 0.35)',
                    boxShadow: '0 0 20px rgba(74,184,255,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
                  }}
                >
                  <span className="text-xs font-medium" style={{ color: 'var(--blue-core)' }}>增长池</span>
                </div>
              </div>
              <div className="text-center mt-2">
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>累计注入</div>
                <div className="text-sm font-bold" style={{ color: 'var(--gold-core)' }}>
                  ¥{result.monthlyTrack.reduce((s, m) => s + m.poolInjection, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：收益铭牌（key 强制 remount，切身份时整体重播入场动画） */}
        <motion.div
          key={scenario.identity}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="col-span-4 flex flex-col gap-3 overflow-y-auto pr-1 scrollbar-thin h-full"
        >
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            收益铭牌
          </h3>

          <div className="text-xs font-medium" style={{ color: 'var(--text-sub)' }}>
            我的基础权益
          </div>
          <RevenueBadge title="产品礼包" value={result.productGiftValue} prefix="¥" source="投入金额 × 30% × 身份系数" formula={productFormula} delay={0} />
          <RevenueBadge title="数据资产奖励" value={result.dataAssetReward} prefix="¥" source="投入金额 × 50% × 身份系数" formula={dataFormula} delay={0.05} />
          <RevenueBadge title="可流通资产" value={result.tradableAsset} prefix="¥" source="数据资产的 40%" formula={tradableFormula} delay={0.1} />

          <div className="text-xs font-medium mt-1" style={{ color: 'var(--text-sub)' }}>
            我的增长权益（{scenario.projectionMonths}个月累计）
          </div>
          <RevenueBadge title="推荐奖励" value={result.referralReward} prefix="¥" source="团队投入 × 5% × 身份系数" formula={referralFormula} delay={0.15} />
          <RevenueBadge title="团队补贴" value={result.teamSubsidy} prefix="¥" source="团队投入 × 3% × 身份系数" formula={growthFormula} delay={0.2} />
          <RevenueBadge title="阶梯业绩奖励" value={result.tierBonus} prefix="¥" source="团队投入 × 2% × 时间系数" formula={growthFormula} delay={0.25} />

          <div className="text-xs font-medium mt-1" style={{ color: 'var(--text-sub)' }}>
            我的分成权益（月度）
          </div>
          <RevenueBadge title="全网销售额分成" value={result.globalSalesShare} prefix="¥" source="权益份额 × 20%" formula={shareFormula} delay={0.3} />
          <RevenueBadge title="算力收益分成" value={result.computeIncomeShare} prefix="¥" source="权益份额 × 15%" formula={shareFormula} delay={0.35} />
          <RevenueBadge title="区域销售额分成" value={result.regionalSalesShare} prefix="¥" source="权益份额 × 25%" formula={shareFormula} delay={0.4} />

          {/* 汇总 */}
          <div
            className="rounded-xl p-3 mt-2"
            style={{
              background: 'linear-gradient(135deg, rgba(246,201,107,0.08), rgba(124,92,255,0.08))',
              border: '1px solid rgba(246, 201, 107, 0.15)',
            }}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: 'var(--text-sub)' }}>
                {scenario.projectionMonths}个月总权益
              </span>
              <span className="text-lg font-bold" style={{ color: 'var(--gold-core)' }}>
                ¥{scenario.projectionMonths === 36 ? result.totalAsset36M.toLocaleString() : result.totalAsset12M.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                投资回报率
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--cyan-flow)' }}>
                {scenario.projectionMonths === 36 ? result.roi36M : result.roi12M}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 底部：增长轨道（可折叠） */}
      <GrowthTrackPanel track={result.monthlyTrack} months={scenario.projectionMonths} />
    </div>
  )
}
