import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'

const PLATE_ITEMS = [
  { label: '全国算力网络', color: '#4ab8ff' },
  { label: '区域生态布局', color: '#31f4ff' },
  { label: '数据资产增长池', color: '#8a6fff' },
  { label: '算力机房部署', color: '#4ab8ff' },
  { label: '消费算力会员规划', color: '#31f4ff' },
  { label: '合作伙伴体系', color: '#f6c96b' },
]

export default function IntroSequence() {
  const { setIntroComplete, setSection } = useExhibitionStore()
  const [phase, setPhase] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  // Enhanced particle map animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: Array<{
      x: number
      y: number
      targetX: number
      targetY: number
      vx: number
      vy: number
      alpha: number
      size: number
      color: string
    }> = []

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const scale = Math.min(canvas.width, canvas.height) * 0.32

    // Generate particles in a silhouette shape
    for (let i = 0; i < 900; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * scale * 0.85
      particles.push({
        x: cx + (Math.random() - 0.5) * canvas.width * 0.8,
        y: cy + (Math.random() - 0.5) * canvas.height * 0.8,
        targetX: cx + dist * Math.cos(angle - 0.25) * 1.12,
        targetY: cy + dist * Math.sin(angle - 0.25) * 0.92,
        vx: 0, vy: 0, alpha: 0,
        size: Math.random() * 1.2 + 0.4,
        color: Math.random() > 0.6 ? 'rgba(138,111,255,' : Math.random() > 0.3 ? 'rgba(49,244,255,' : 'rgba(74,184,255,',
      })
    }

    let time = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.016

      // Deep space background
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.width * 0.6)
      grad.addColorStop(0, 'rgba(10, 19, 37, 0.15)')
      grad.addColorStop(1, 'rgba(2, 4, 10, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, i) => {
        const dx = p.targetX - p.x
        const dy = p.targetY - p.y
        p.vx += dx * 0.0015
        p.vy += dy * 0.0015
        p.vx *= 0.96
        p.vy *= 0.96
        p.x += p.vx
        p.y += p.vy

        const dist = Math.sqrt(dx * dx + dy * dy)
        p.alpha = Math.min(1, Math.max(0, 1 - dist / 250))

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color + (p.alpha * 0.7) + ')'
        ctx.fill()

        // Fine connections
        if (i % 4 === 0) {
          particles.slice(i + 1, i + 3).forEach((q) => {
            const d = Math.hypot(p.x - q.x, p.y - q.y)
            if (d < 35 && p.alpha > 0.3 && q.alpha > 0.3) {
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(q.x, q.y)
              ctx.strokeStyle = `rgba(74, 184, 255, ${0.06 * p.alpha})`
              ctx.lineWidth = 0.4
              ctx.stroke()
            }
          })
        }
      })

      // Glow nodes (city points) with pulse
      const nodes = [
        [cx - scale * 0.25, cy - scale * 0.18],
        [cx + scale * 0.32, cy - scale * 0.12],
        [cx - scale * 0.08, cy + scale * 0.22],
        [cx + scale * 0.18, cy + scale * 0.08],
        [cx, cy - scale * 0.32],
        [cx - scale * 0.35, cy + scale * 0.05],
      ]

      nodes.forEach(([nx, ny], i) => {
        const pulse = Math.sin(time * 1.8 + i * 1.2) * 0.25 + 0.75
        // Outer glow
        ctx.beginPath()
        ctx.arc(nx, ny, 16 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(49, 244, 255, ${0.08 * pulse})`
        ctx.fill()
        // Mid glow
        ctx.beginPath()
        ctx.arc(nx, ny, 8 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(49, 244, 255, ${0.2 * pulse})`
        ctx.fill()
        // Core
        ctx.beginPath()
        ctx.arc(nx, ny, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`
        ctx.fill()
      })

      // Flight lines between nodes
      if (phase >= 1) {
        const flightPairs = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,3],[1,4]]
        flightPairs.forEach(([a,b], fi) => {
          const [ax, ay] = nodes[a]
          const [bx, by] = nodes[b]
          const progress = ((time * 0.5 + fi * 0.3) % 1)
          const fx = ax + (bx - ax) * progress
          const fy = ay + (by - ay) * progress
          ctx.beginPath()
          ctx.arc(fx, fy, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(49, 244, 255, 0.6)'
          ctx.fill()
        })
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [phase])

  // Auto-advance phases
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 2400),
      setTimeout(() => setPhase(3), 4200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const handleEnter = () => {
    setIntroComplete(true)
    setSection('strategic')
  }

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: phase >= 1 ? 1 : 0, transition: 'opacity 2.5s ease' }}
      />

      {/* Scanline overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none z-10" />

      {/* Top brand */}
      <AnimatePresence>
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute top-10 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="text-[11px] tracking-[0.6em] text-primary-cyan/60 uppercase font-medium">
              SHENSHU COMPUTING POWER ECOSYSTEM
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center title */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              className="text-center"
            >
              {/* Decorative line */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.2, delay: 0.3 }}
                className="h-px mx-auto mb-6"
                style={{ background: 'linear-gradient(90deg, transparent, #4ab8ff60, #31f4ff60, transparent)' }}
              />

              <h1
                className="text-6xl md:text-8xl font-bold tracking-wider mb-5 text-text-main"
                style={{ textShadow: '0 0 30px rgba(74,184,255,0.4), 0 0 80px rgba(74,184,255,0.15), 0 0 120px rgba(138,111,255,0.08)' }}
              >
                神枢算力权益通
              </h1>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                transition={{ duration: 1, delay: 0.8 }}
                className="h-px mx-auto mb-5"
                style={{ background: 'linear-gradient(90deg, transparent, #4ab8ff40, transparent)' }}
              />

              <p
                className="text-xl md:text-2xl tracking-[0.35em] mb-2 text-primary-cyan"
                style={{ textShadow: '0 0 16px rgba(49,244,255,0.35)' }}
              >
                共建区域算力生态
              </p>
              <p
                className="text-xl md:text-2xl tracking-[0.35em] text-primary-cyan"
                style={{ textShadow: '0 0 16px rgba(49,244,255,0.35)' }}
              >
                共享数字经济红利
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="mt-12 text-center max-w-2xl px-6"
            >
              <p className="text-text-sub text-base leading-relaxed mb-10">
                以算力基础设施为底座
                <span className="mx-2 text-primary-blue/40">|</span>
                以数据资产流通为牵引
                <span className="mx-2 text-primary-blue/40">|</span>
                以消费生态连接用户、企业与区域资源
                <br />
                构建面向全国的数字算力价值网络
              </p>

              <div className="flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnter}
                  className="px-10 py-4 rounded-xl text-primary-blue text-base border transition-all relative overflow-hidden hover:border-[rgba(74,184,255,0.6)] hover:shadow-[0_0_36px_rgba(74,184,255,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]"
                  style={{
                    background: 'var(--primary-blue)14',
                    borderColor: 'var(--border-medium)',
                    boxShadow: '0 0 24px rgba(74,184,255,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                >
                  进入数字展厅
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIntroComplete(true)
                    setSection('future')
                  }}
                  className="px-10 py-4 rounded-xl text-primary-cyan text-base border transition-all hover:border-[rgba(49,244,255,0.5)] hover:bg-[rgba(49,244,255,0.08)]"
                  style={{
                    background: 'var(--primary-cyan)0D',
                    borderColor: 'var(--border-light)',
                  }}
                >
                  播放项目蓝图
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnter}
                  className="px-10 py-4 rounded-xl text-accent-gold text-base border transition-all hover:border-[rgba(246,201,107,0.5)] hover:bg-[rgba(246,201,107,0.08)]"
                  style={{
                    background: 'var(--accent-gold)0D',
                    borderColor: 'var(--border-gold)',
                  }}
                >
                  查看全国布局
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating data plates */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.8 }}
            className="absolute bottom-12 left-0 right-0 z-20"
          >
            <div className="flex justify-center gap-3 flex-wrap px-8">
              {PLATE_ITEMS.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 + i * 0.1 }}
                  className="px-5 py-2.5 rounded-lg text-xs border transition-all cursor-default"
                  style={{
                    background: 'var(--bg-panel)',
                    borderColor: `${item.color}25`,
                    color: item.color,
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full mr-2"
                    style={{
                      background: item.color,
                      boxShadow: `0 0 6px ${item.color}60`,
                    }}
                  />
                  {item.label}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner decorations — 展厅框架感 */}
      <div className="absolute top-6 left-6 w-20 h-20 border-l border-t border-primary-blue/15 z-20 pointer-events-none" />
      <div className="absolute top-6 right-6 w-20 h-20 border-r border-t border-primary-blue/15 z-20 pointer-events-none" />
      <div className="absolute bottom-6 left-6 w-20 h-20 border-l border-b border-primary-blue/15 z-20 pointer-events-none" />
      <div className="absolute bottom-6 right-6 w-20 h-20 border-r border-b border-primary-blue/15 z-20 pointer-events-none" />
    </div>
  )
}
