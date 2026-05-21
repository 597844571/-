import { useEffect, useRef } from 'react'

/**
 * V1.3 全局背景特效
 * - 深空粒子场（缓慢漂浮 + 微弱连接）
 * - 网格地面（透视感）
 * - 扫描线
 * - 鼠标视差偏移
 */
export default function GlobalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width = w
    canvas.height = h

    const PARTICLE_COUNT = Math.min(120, Math.floor((w * h) / 15000))
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      alpha: number
      color: string
      parallax: number
    }> = []

    const colors = ['rgba(74,184,255,', 'rgba(49,244,255,', 'rgba(138,111,255,']

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.4 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        parallax: Math.random() * 0.5 + 0.2,
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / w - 0.5) * 2
      mouseRef.current.targetY = (e.clientY / h - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMouseMove)

    const animate = () => {
      ctx.clearRect(0, 0, w, h)

      // Smooth mouse interpolation
      const m = mouseRef.current
      m.x += (m.targetX - m.x) * 0.05
      m.y += (m.targetY - m.y) * 0.05

      // Draw deep space radial gradient
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7)
      grad.addColorStop(0, 'rgba(10, 19, 37, 0)')
      grad.addColorStop(1, 'rgba(2, 4, 10, 0.5)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // Update & draw particles with parallax
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        const parallaxX = m.x * 20 * p.parallax
        const parallaxY = m.y * 12 * p.parallax

        ctx.beginPath()
        ctx.arc(p.x + parallaxX, p.y + parallaxY, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color + p.alpha + ')'
        ctx.fill()

        // Connect nearby particles
        if (i % 3 === 0) {
          for (let j = i + 1; j < Math.min(i + 5, particles.length); j++) {
            const q = particles[j]
            const qpx = q.x + m.x * 20 * q.parallax
            const qpy = q.y + m.y * 12 * q.parallax
            const px = p.x + parallaxX
            const py = p.y + parallaxY
            const dx = px - qpx
            const dy = py - qpy
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 120) {
              ctx.beginPath()
              ctx.moveTo(px, py)
              ctx.lineTo(qpx, qpy)
              ctx.strokeStyle = `rgba(74, 184, 255, ${0.04 * (1 - dist / 120)})`
              ctx.lineWidth = 0.5
              ctx.stroke()
            }
          }
        }
      })

      animRef.current = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* Grid floor */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(74, 184, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74, 184, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          maskImage: 'linear-gradient(to top, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
        }}
      />
      {/* Top vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(74,184,255,0.03) 0%, transparent 60%)',
        }}
      />
    </div>
  )
}
