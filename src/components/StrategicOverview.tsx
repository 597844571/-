import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'

/* ============================================================
   V2.0 数字展厅首页
   全国地图光网 + 增长池核心 + 展厅入口铭牌
   性能优化：Canvas 粒子 200 个，无 WebGL
   ============================================================ */

const ENTRIES = [
  { key: 'map', label: '全国算力网络', sub: '算力节点 · 区域布局' },
  { key: 'machineRoom', label: '算力基础设施', sub: '三维机房 · 硬件资产' },
  { key: 'consumption', label: '消费权益生态', sub: '消费场景 · 权益入口' },
  { key: 'assetFlow', label: '数据资产引擎', sub: '资产流转 · 增长飞轮' },
  { key: 'growthPool', label: '增长池核心', sub: '权益推演 · 收益沙盘' },
  { key: 'rights', label: '合作权益体系', sub: '身份路径 · 合伙人网络' },
]

/** 轻量背景粒子 — 200 个，Canvas 2D */
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width = w
    canvas.height = h

    const PARTICLE_COUNT = 200
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.4 + 0.1,
    }))

    let frame = 0
    const animate = () => {
      frame++
      // 每 2 帧渲染一次，降低 CPU 占用
      if (frame % 2 === 0) {
        ctx.clearRect(0, 0, w, h)
        for (const p of particles) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0) p.x = w
          if (p.x > w) p.x = 0
          if (p.y < 0) p.y = h
          if (p.y > h) p.y = 0

          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(74, 184, 255, ${p.alpha})`
          ctx.fill()
        }

        // 连线 — 只连距离近的，限制计算量
        for (let i = 0; i < particles.length; i += 3) {
          for (let j = i + 1; j < particles.length; j += 5) {
            const dx = particles[i].x - particles[j].x
            const dy = particles[i].y - particles[j].y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 120) {
              ctx.beginPath()
              ctx.moveTo(particles[i].x, particles[i].y)
              ctx.lineTo(particles[j].x, particles[j].y)
              ctx.strokeStyle = `rgba(74, 184, 255, ${0.06 * (1 - dist / 120)})`
              ctx.lineWidth = 0.5
              ctx.stroke()
            }
          }
        }
      }
      requestAnimationFrame(animate)
    }

    const raf = requestAnimationFrame(animate)

    const handleResize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    />
  )
}

/** 中国地图轮廓 — SVG 简化版 */
function ChinaMapOutline() {
  return (
    <svg
      viewBox="0 0 800 600"
      className="w-full h-full opacity-30"
      style={{ filter: 'drop-shadow(0 0 20px rgba(74,184,255,0.15))' }}
    >
      {/* 简化中国地图轮廓 — 用 path 近似 */}
      <path
        d="M 220 180 L 260 140 L 320 130 L 400 120 L 480 100 L 560 90 L 620 110 L 660 140 L 680 180 L 670 220 L 640 260 L 600 300 L 560 340 L 520 380 L 480 420 L 440 450 L 400 470 L 360 460 L 320 440 L 280 400 L 240 360 L 200 320 L 180 280 L 170 240 L 180 200 Z"
        fill="none"
        stroke="rgba(74, 184, 255, 0.25)"
        strokeWidth="1"
      />
      {/* 省份边界虚线 */}
      <path
        d="M 300 200 L 350 220 L 400 210 L 450 230 L 500 220 L 550 240"
        fill="none"
        stroke="rgba(74, 184, 255, 0.1)"
        strokeWidth="0.5"
        strokeDasharray="4 4"
      />
      <path
        d="M 280 280 L 330 300 L 380 290 L 430 310 L 480 300 L 530 320"
        fill="none"
        stroke="rgba(74, 184, 255, 0.1)"
        strokeWidth="0.5"
        strokeDasharray="4 4"
      />
      {/* 算力节点 */}
      {[
        { cx: 560, cy: 140, r: 4 }, // 北京
        { cx: 580, cy: 260, r: 3 }, // 上海
        { cx: 520, cy: 340, r: 3 }, // 广州
        { cx: 480, cy: 300, r: 3 }, // 武汉
        { cx: 420, cy: 240, r: 3 }, // 西安
        { cx: 360, cy: 200, r: 3 }, // 兰州
        { cx: 320, cy: 160, r: 3 }, // 呼和浩特
        { cx: 280, cy: 280, r: 3 }, // 成都
        { cx: 380, cy: 380, r: 3 }, // 昆明
        { cx: 460, cy: 400, r: 2 }, // 南宁
      ].map((node, i) => (
        <g key={i}>
          <circle cx={node.cx} cy={node.cy} r={node.r + 2} fill="rgba(74, 184, 255, 0.15)">
            <animate attributeName="r" values={`${node.r + 2};${node.r + 6};${node.r + 2}`} dur="3s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
          </circle>
          <circle cx={node.cx} cy={node.cy} r={node.r} fill="#4AB8FF" />
        </g>
      ))}
      {/* 飞线 */}
      <line x1="560" y1="140" x2="580" y2="260" stroke="rgba(49, 244, 255, 0.2)" strokeWidth="0.8">
        <animate attributeName="stroke-dasharray" values="0,300;150,150;300,0" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="580" y1="260" x2="520" y2="340" stroke="rgba(49, 244, 255, 0.15)" strokeWidth="0.8">
        <animate attributeName="stroke-dasharray" values="0,250;125,125;250,0" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
      </line>
      <line x1="560" y1="140" x2="420" y2="240" stroke="rgba(49, 244, 255, 0.15)" strokeWidth="0.8">
        <animate attributeName="stroke-dasharray" values="0,280;140,140;280,0" dur="2.2s" repeatCount="indefinite" begin="1s" />
      </line>
    </svg>
  )
}

/** 增长池核心 — CSS 脉冲动画 */
function GrowthCore() {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      {/* 外层光环 */}
      <div
        className="absolute inset-0 rounded-full animate-ping"
        style={{
          background: 'radial-gradient(circle, rgba(124,92,255,0.15) 0%, transparent 70%)',
          animationDuration: '3s',
        }}
      />
      {/* 中层光环 */}
      <div
        className="absolute inset-4 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(74,184,255,0.1) 0%, transparent 70%)',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />
      {/* 核心 */}
      <div
        className="relative w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(74,184,255,0.2), rgba(124,92,255,0.2))',
          border: '1px solid rgba(74, 184, 255, 0.3)',
          boxShadow: '0 0 24px rgba(74,184,255,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <span className="text-[10px] font-medium" style={{ color: 'var(--blue-core)' }}>
          增长池
        </span>
      </div>
    </div>
  )
}

/** 展厅入口铭牌 */
function EntryBadge({
  label,
  sub,
  delay,
  onClick,
}: {
  label: string
  sub: string
  delay: number
  onClick: () => void
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      onClick={onClick}
      className="group relative px-5 py-3 rounded-xl text-left transition-all hover:scale-[1.02]"
      style={{
        background: 'rgba(11, 20, 36, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(126, 190, 255, 0.12)',
      }}
    >
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: 'linear-gradient(135deg, rgba(74,184,255,0.06), rgba(124,92,255,0.06))',
        }}
      />
      <div className="relative">
        <div className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
          {label}
        </div>
        <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {sub}
        </div>
      </div>
      {/* 发光角标 */}
      <div
        className="absolute top-2 right-2 w-1 h-1 rounded-full"
        style={{
          background: 'var(--cyan-flow)',
          boxShadow: '0 0 6px var(--cyan-flow)',
        }}
      />
    </motion.button>
  )
}

export default function StrategicOverview() {
  const { setSection } = useExhibitionStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col">
      {/* 背景粒子 */}
      <ParticleBackground />

      {/* 背景地图 */}
      <div className="absolute inset-0 z-[1] flex items-center justify-center">
        <div className="w-[70vw] h-[70vh] max-w-[900px] max-h-[700px]">
          <ChinaMapOutline />
        </div>
      </div>

      {/* 内容层 */}
      <div className="relative z-10 flex flex-col h-full">
        {/* 顶部标题区 */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div
              className="text-xs tracking-[0.3em] mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              全国算力生态数字展厅
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-wider mb-4"
              style={{
                color: 'var(--text-main)',
                textShadow: '0 0 40px rgba(74,184,255,0.15)',
              }}
            >
              神枢算力权益通
            </h1>
            <p className="text-lg mb-2" style={{ color: 'var(--text-sub)' }}>
              算力连接价值 · 智能驱动增长
            </p>
            <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
              以算力基础设施为底座，以数据资产流通为牵引，以区域消费生态为入口，构建面向全国的数字算力价值网络
            </p>
          </motion.div>

          {/* 中央增长池 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={mounted ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-8"
          >
            <GrowthCore />
          </motion.div>
        </div>

        {/* 底部入口铭牌 */}
        <div className="px-8 pb-24">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 max-w-5xl mx-auto">
            {ENTRIES.map((entry, i) => (
              <EntryBadge
                key={entry.key}
                label={entry.label}
                sub={entry.sub}
                delay={0.8 + i * 0.1}
                onClick={() => setSection(entry.key as any)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
