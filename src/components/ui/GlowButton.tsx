import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface GlowButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'gold' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  disabled?: boolean
}

const VARIANT_STYLES = {
  primary: {
    color: '#4ab8ff',
    bg: 'rgba(74, 184, 255, 0.08)',
    border: 'rgba(74, 184, 255, 0.30)',
    hoverBorder: 'rgba(74, 184, 255, 0.55)',
    hoverGlow: '0 0 20px rgba(74,184,255,0.15)',
  },
  secondary: {
    color: '#31f4ff',
    bg: 'rgba(49, 244, 255, 0.05)',
    border: 'rgba(49, 244, 255, 0.25)',
    hoverBorder: 'rgba(49, 244, 255, 0.50)',
    hoverGlow: '0 0 20px rgba(49,244,255,0.12)',
  },
  gold: {
    color: '#f6c96b',
    bg: 'rgba(246, 201, 107, 0.05)',
    border: 'rgba(246, 201, 107, 0.25)',
    hoverBorder: 'rgba(246, 201, 107, 0.50)',
    hoverGlow: '0 0 20px rgba(246,201,107,0.12)',
  },
  ghost: {
    color: '#6f7f9f',
    bg: 'rgba(255,255,255,0.02)',
    border: 'rgba(126, 190, 255, 0.12)',
    hoverBorder: 'rgba(126, 190, 255, 0.25)',
    hoverGlow: 'none',
    hoverColor: '#b0c4e8',
  },
}

const SIZE_STYLES = {
  sm: 'px-4 py-2 text-[11px]',
  md: 'px-6 py-2.5 text-xs',
  lg: 'px-8 py-3.5 text-sm',
}

export default function GlowButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
}: GlowButtonProps) {
  const v = VARIANT_STYLES[variant]
  const isGhost = variant === 'ghost'

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border transition-all duration-300 cursor-pointer ${SIZE_STYLES[size]} ${className}`}
      style={{
        color: v.color,
        background: v.bg,
        borderColor: v.border,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={(e) => {
        if (disabled) return
        const el = e.currentTarget
        el.style.borderColor = v.hoverBorder
        el.style.boxShadow = v.hoverGlow
        if (isGhost) el.style.color = (v as any).hoverColor
      }}
      onMouseLeave={(e) => {
        if (disabled) return
        const el = e.currentTarget
        el.style.borderColor = v.border
        el.style.boxShadow = 'none'
        if (isGhost) el.style.color = v.color
      }}
    >
      {children}
    </motion.button>
  )
}
