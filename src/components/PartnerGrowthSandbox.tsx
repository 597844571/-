import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'
import { IDENTITY_LABELS } from '../data/roadshowPreset'
import { loadEffectiveScenario } from '../utils/scenarioStorage'
import { calculateGrowth } from '../utils/growthCalculation'
import type { GrowthResult } from '../utils/growthCalculation'

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

/** 收益铭牌卡片 */
function RevenueBadge({
  title,
  value,
  prefix = '',
  suffix = '',
  source,
  delay,
}: {
  title: string
  value: number
  prefix?: string
  suffix?: string
  source: string
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
      <div className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
        {title}
      </div>
      <MetricValue value={value} prefix={prefix} suffix={suffix} />
      <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
        {source}
      </div>
    </motion.div>
  )
}

/** 增长轨道 — SVG 折线 */
function GrowthTrack({ track, months }: { track: GrowthResult['monthlyTrack']; months: number }) {
  const data = track.slice(0, months)
  if (data.length === 0) return null

  const maxVal = Math.max(...data.map((d) => d.equityShare))
  const w = 800
  const h = 200
  const padding = 40

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (w - padding * 2)
    const y = h - padding - (d.equityShare / (maxVal || 1)) * (h - padding * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ minWidth: '600px' }}>
        {/* 网格线 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = h - padding - ratio * (h - padding * 2)
          return (
            <line
              key={ratio}
              x1={padding}
              y1={y}
              x2={w - padding}
              y2={y}
              stroke="rgba(126, 190, 255, 0.06)"
              strokeWidth="0.5"
            />
          )
        })}
        {/* 折线 */}
        <polyline
          points={points}
          fill="none"
          stroke="url(#trackGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 渐变填充 */}
        <defs>
          <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4AB8FF" />
            <stop offset="100%" stopColor="#7C5CFF" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(74, 184, 255, 0.15)" />
            <stop offset="100%" stopColor="rgba(74, 184, 255, 0)" />
          </linearGradient>
        </defs>
        {/* 填充区域 */}
        <polygon
          points={`${padding},${h - padding} ${points} ${w - padding},${h - padding}`}
          fill="url(#areaGradient)"
        />
        {/* 数据点 */}
        {data.map((d, i) => {
          const x = padding + (i / (data.length - 1)) * (w - padding * 2)
          const y = h - padding - (d.equityShare / (maxVal || 1)) * (h - padding * 2)
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="3" fill="#4AB8FF" />
              {/* 悬停标签（简化，直接显示） */}
              {i % Math.ceil(data.length / 6) === 0 && (
                <text x={x} y={h - padding + 16} textAnchor="middle" fill="#6F7F9F" fontSize="10">
                  {d.month}月
                </text>
              )}
            </g>
          )
        })}
      </svg>
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
              className="absolute text-[9px] whitespace-nowrap"
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
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>投入</span>
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
  const { currentScenario, setShowRoadshowDeck } = useExhibitionStore()

  // 优先使用 currentScenario（实时推演），否则加载默认方案
  const scenario = currentScenario ?? loadEffectiveScenario()
  const result = useMemo(() => calculateGrowth(scenario), [scenario])

  const identityLabel = IDENTITY_LABELS[scenario.identity] ?? '普通会员'

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col p-6 pt-20">
      {/* 顶部标题 */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
            合伙权益增长沙盘
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs" style={{ color: 'var(--text-sub)' }}>
              当前身份：<span style={{ color: 'var(--blue-core)' }}>{identityLabel}</span>
            </span>
            <span className="text-xs" style={{ color: 'var(--text-sub)' }}>
              方案：<span style={{ color: 'var(--gold-core)' }}>{scenario.name}</span>
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowRoadshowDeck(true)}
          className="px-4 py-2 rounded-lg text-xs transition-all hover:brightness-110"
          style={{
            background: 'linear-gradient(135deg, rgba(74,184,255,0.12), rgba(124,92,255,0.12))',
            color: 'var(--blue-core)',
            border: '1px solid rgba(74, 184, 255, 0.3)',
          }}
        >
          调整推演参数
        </button>
      </div>

      {/* 主内容区 — 三栏布局 */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* 左侧：身份阶梯 */}
        <div className="col-span-3 flex flex-col gap-3 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <h3 className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            身份阶梯
          </h3>
          {Object.entries(IDENTITY_LABELS).map(([key, label], i) => {
            const isActive = scenario.identity === key
            return (
              <div
                key={key}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                style={{
                  background: isActive ? 'rgba(74, 184, 255, 0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(74, 184, 255, 0.2)' : '1px solid transparent',
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: isActive ? COLORS[i % COLORS.length] : 'rgba(111, 127, 159, 0.3)',
                    boxShadow: isActive ? `0 0 6px ${COLORS[i % COLORS.length]}` : 'none',
                  }}
                />
                <span
                  className="text-xs"
                  style={{ color: isActive ? 'var(--text-main)' : 'var(--text-muted)' }}
                >
                  {label}
                </span>
              </div>
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
            <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
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
              <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
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
              <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                增长池核心
              </h3>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{
                    background: 'radial-gradient(circle, rgba(124,92,255,0.12) 0%, transparent 70%)',
                    animationDuration: '3s',
                  }}
                />
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(74,184,255,0.15), rgba(124,92,255,0.15))',
                    border: '1px solid rgba(74, 184, 255, 0.25)',
                  }}
                >
                  <span className="text-[9px]" style={{ color: 'var(--blue-core)' }}>增长池</span>
                </div>
              </div>
              <div className="text-center mt-2">
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>累计注入</div>
                <div className="text-sm font-bold" style={{ color: 'var(--gold-core)' }}>
                  ¥{result.monthlyTrack.reduce((s, m) => s + m.poolInjection, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：收益铭牌 */}
        <div className="col-span-4 flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <h3 className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            收益铭牌
          </h3>

          <div className="text-[10px] font-medium" style={{ color: 'var(--text-sub)' }}>
            我的基础权益
          </div>
          <RevenueBadge title="产品礼包" value={result.productGiftValue} prefix="¥" source="投入金额 × 30% × 身份系数" delay={0} />
          <RevenueBadge title="数据资产奖励" value={result.dataAssetReward} prefix="¥" source="投入金额 × 50% × 身份系数" delay={0.05} />
          <RevenueBadge title="可流通资产" value={result.tradableAsset} prefix="¥" source="数据资产的 40%" delay={0.1} />

          <div className="text-[10px] font-medium mt-1" style={{ color: 'var(--text-sub)' }}>
            我的增长权益（{scenario.projectionMonths}个月累计）
          </div>
          <RevenueBadge title="推荐奖励" value={result.referralReward} prefix="¥" source="团队投入 × 5% × 身份系数" delay={0.15} />
          <RevenueBadge title="团队补贴" value={result.teamSubsidy} prefix="¥" source="团队投入 × 3% × 身份系数" delay={0.2} />
          <RevenueBadge title="阶梯业绩奖励" value={result.tierBonus} prefix="¥" source="团队投入 × 2% × 时间系数" delay={0.25} />

          <div className="text-[10px] font-medium mt-1" style={{ color: 'var(--text-sub)' }}>
            我的分成权益（月度）
          </div>
          <RevenueBadge title="全网销售额分成" value={result.globalSalesShare} prefix="¥" source="权益份额 × 20%" delay={0.3} />
          <RevenueBadge title="算力收益分成" value={result.computeIncomeShare} prefix="¥" source="权益份额 × 15%" delay={0.35} />
          <RevenueBadge title="区域销售额分成" value={result.regionalSalesShare} prefix="¥" source="权益份额 × 25%" delay={0.4} />

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
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                投资回报率
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--cyan-flow)' }}>
                {scenario.projectionMonths === 36 ? result.roi36M : result.roi12M}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部：增长轨道 */}
      <div
        className="mt-4 rounded-xl p-4"
        style={{
          background: 'rgba(11, 20, 36, 0.5)',
          border: '1px solid rgba(126, 190, 255, 0.08)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            增长轨道
          </h3>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            权益分成逐月走势
          </span>
        </div>
        <GrowthTrack track={result.monthlyTrack} months={scenario.projectionMonths} />
      </div>
    </div>
  )
}
