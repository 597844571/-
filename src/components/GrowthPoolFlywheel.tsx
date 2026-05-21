import { useState } from 'react'
import { motion } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'

const FLYWHEEL_NODES = [
  { id: 'consumption', label: '消费生态', angle: 0, color: '#4ab8ff' },
  { id: 'asset', label: '数据资产', angle: 45, color: '#31f4ff' },
  { id: 'pool', label: '增长池', angle: 90, color: '#8a6fff' },
  { id: 'compute', label: '算力收益', angle: 135, color: '#4ab8ff' },
  { id: 'trade', label: '交易流通', angle: 180, color: '#31f4ff' },
  { id: 'partner', label: '合作伙伴', angle: 225, color: '#f6c96b' },
  { id: 'region', label: '区域生态', angle: 270, color: '#8a6fff' },
  { id: 'growth', label: '用户增长', angle: 315, color: '#4ab8ff' },
]

export default function GrowthPoolFlywheel() {
  const { setSection } = useExhibitionStore()
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // CSS-driven rotation via SVG animateTransform - no React setState per frame
  const radius = 150
  const centerX = 200
  const centerY = 200

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative z-10 w-full max-w-5xl 3xl:max-w-6xl 4k:max-w-7xl px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-[11px] tracking-[0.4em] mb-3 uppercase font-medium" style={{ color: '#8a6fff90' }}>
            Growth Pool & Flywheel
          </div>
          <h2
            className="text-3xl font-bold tracking-wider mb-2 text-text-main" style={{ textShadow: '0 0 24px rgba(138,111,255,0.25)' }}
          >
            增长池与生态飞轮
          </h2>
          <p className="text-sm text-text-sub">
            数据资产增长池 — 价值循环的核心引擎
          </p>
        </motion.div>

        <div className="grid grid-cols-12 gap-8 items-center">
          {/* Flywheel visualization - CSS-driven rotation */}
          <div className="col-span-7 flex justify-center">
            <div className="relative" style={{ width: 400, height: 400 }}>
              <svg width="400" height="400" viewBox="0 0 400 400">
                <defs>
                  <linearGradient id="flywheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4ab8ff" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#8a6fff" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Rotating group */}
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 200 200"
                    to="360 200 200"
                    dur="60s"
                    repeatCount="indefinite"
                  />

                  {/* Outer ring */}
                  <circle cx={centerX} cy={centerY} r={radius + 18}
                    fill="none" stroke="rgba(138,111,255,0.12)" strokeWidth={1} strokeDasharray="8 6"
                  />
                  {/* Inner ring */}
                  <circle cx={centerX} cy={centerY} r={radius - 18}
                    fill="none" stroke="rgba(74,184,255,0.08)" strokeWidth={1}
                  />
                  {/* Connection lines */}
                  {FLYWHEEL_NODES.map((node, i) => {
                    const a1 = (node.angle * Math.PI) / 180
                    const a2 = (FLYWHEEL_NODES[(i + 1) % FLYWHEEL_NODES.length].angle * Math.PI) / 180
                    const x1 = centerX + Math.cos(a1) * radius
                    const y1 = centerY + Math.sin(a1) * radius
                    const x2 = centerX + Math.cos(a2) * radius
                    const y2 = centerY + Math.sin(a2) * radius
                    return (
                      <line key={`line-${node.id}`} x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke="rgba(74, 184, 255, 0.10)" strokeWidth={0.8}
                      />
                    )
                  })}
                  {/* Node dots */}
                  {FLYWHEEL_NODES.map((node) => {
                    const a = (node.angle * Math.PI) / 180
                    const x = centerX + Math.cos(a) * radius
                    const y = centerY + Math.sin(a) * radius
                    return (
                      <g key={`dot-${node.id}`}>
                        <circle cx={x} cy={y} r={4}
                          fill={node.color} opacity={0.6}
                        />
                        <circle cx={x} cy={y} r={8}
                          fill={node.color} opacity={0.15}
                        >
                          <animate attributeName="r" values="8;12;8" dur="3s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.15;0.05;0.15" dur="3s" repeatCount="indefinite" />
                        </circle>
                      </g>
                    )
                  })}
                </g>

                {/* Center pool (static) */}
                <circle cx={centerX} cy={centerY} r={48}
                  fill="rgba(138,111,255,0.12)"
                  stroke="rgba(138,111,255,0.35)"
                  strokeWidth={1.5}
                />
                <circle cx={centerX} cy={centerY} r={32}
                  fill="rgba(138,111,255,0.18)"
                >
                  <animate attributeName="r" values="32;38;32" dur="3s" repeatCount="indefinite" />
                </circle>
                <text x={centerX} y={centerY - 4} textAnchor="middle" fill="#f0f4ff" fontSize="11" fontWeight="bold">
                  增长池
                </text>
                <text x={centerX} y={centerY + 10} textAnchor="middle" fill="#6f7f9f" fontSize="8">
                  核心引擎
                </text>
              </svg>

              {/* Nodes as HTML (static positions for interaction) */}
              {FLYWHEEL_NODES.map((node) => {
                const a = (node.angle * Math.PI) / 180
                const x = 200 + Math.cos(a) * radius
                const y = 200 + Math.sin(a) * radius
                const isActive = selectedNode === node.id || hoveredNode === node.id
                return (
                  <motion.button
                    key={node.id}
                    className="absolute"
                    style={{
                      left: x,
                      top: y,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                    animate={{ scale: isActive ? 1.12 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className="px-3 py-2 rounded-lg text-[10px] whitespace-nowrap transition-all border"
                      style={{
                        background: isActive ? node.color + '18' : 'rgba(12, 18, 32, 0.8)',
                        color: isActive ? node.color : '#6f7f9f',
                        borderColor: isActive ? node.color + '45' : 'rgba(126,190,255,0.10)',
                        boxShadow: isActive ? `0 0 16px ${node.color}20` : 'none',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      {node.label}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Info panel */}
          <div className="col-span-5">
            <div className="glass-panel-strong rounded-xl p-5 h-full">
              <div className="text-[10px] mb-4 uppercase tracking-wider text-primary-purple">
                生态飞轮说明
              </div>
              <p className="text-sm leading-relaxed mb-6 text-text-sub">
                平台消费生态与算力机房收益共同构成增长池的重要来源。
                消费生态越活跃，算力网络越强大，增长池越充足，
                数据资产流通体系越具备持续发展空间。
              </p>

              <div className="space-y-2.5">
                {FLYWHEEL_NODES.map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer"
                    style={{
                      background: selectedNode === node.id ? 'rgba(255,255,255,0.04)' : 'transparent',
                    }}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        background: node.color,
                        boxShadow: `0 0 8px ${node.color}60`,
                      }}
                    />
                    <span className="text-xs text-text-sub">{node.label}</span>
                    {selectedNode === node.id && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] ml-auto"
                        style={{ color: node.color }}
                      >
                        已选中
                      </motion.span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setSection('assetFlow')}
            className="px-5 py-2 rounded-lg text-xs border transition-all text-text-muted hover:text-text-sub hover:bg-white/[0.04] hover:border-border-light/40" style={{ borderColor: 'rgba(126,190,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
          >
            返回资产流转
          </button>
          <button
            onClick={() => setSection('rights')}
            className="px-5 py-2 rounded-lg text-xs border transition-all text-primary-cyan hover:shadow-[0_0_16px_rgba(49,244,255,0.1)] hover:border-[rgba(49,244,255,0.5)]" style={{ borderColor: 'rgba(49,244,255,0.25)', background: 'rgba(49,244,255,0.05)' }}
          >
            权益席位沙盘
          </button>
        </div>
      </div>
    </div>
  )
}
