import { type ReactNode } from 'react'

interface GlassSurfaceProps {
  children: ReactNode
  variant?: 'panel' | 'strong' | 'weak'
  glow?: 'none' | 'blue' | 'purple' | 'gold' | 'cyan'
  className?: string
  onClick?: () => void
}

const VARIANT_STYLES = {
  panel: {
    background: 'rgba(15, 25, 48, 0.72)',
    backdropFilter: 'blur(20px) saturate(160%)',
    borderColor: 'rgba(126, 190, 255, 0.18)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
  },
  strong: {
    background: 'rgba(18, 32, 56, 0.88)',
    backdropFilter: 'blur(28px) saturate(180%)',
    borderColor: 'rgba(126, 190, 255, 0.30)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
  },
  weak: {
    background: 'rgba(10, 19, 37, 0.45)',
    backdropFilter: 'blur(12px) saturate(120%)',
    borderColor: 'rgba(126, 190, 255, 0.10)',
    boxShadow: 'none',
  },
}

const GLOW_STYLES = {
  none: '',
  blue: '0 0 24px rgba(74,184,255,0.20)',
  purple: '0 0 24px rgba(138,111,255,0.20)',
  gold: '0 0 24px rgba(246,201,107,0.20)',
  cyan: '0 0 24px rgba(49,244,255,0.20)',
}

export default function GlassSurface({
  children,
  variant = 'panel',
  glow = 'none',
  className = '',
  onClick,
}: GlassSurfaceProps) {
  const v = VARIANT_STYLES[variant]
  const glowShadow = GLOW_STYLES[glow]
  const shadow = glowShadow ? `${v.boxShadow}, ${glowShadow}` : v.boxShadow

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border transition-all duration-300 ${className}`}
      style={{
        background: v.background,
        backdropFilter: v.backdropFilter,
        WebkitBackdropFilter: v.backdropFilter,
        borderColor: v.borderColor,
        boxShadow: shadow,
      }}
    >
      {children}
    </div>
  )
}
