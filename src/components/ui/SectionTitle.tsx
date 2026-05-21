import { motion } from 'framer-motion'

interface SectionTitleProps {
  suptitle?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  glowColor?: 'blue' | 'purple' | 'gold' | 'cyan'
}

const GLOW_MAP = {
  blue: '0 0 24px rgba(74,184,255,0.25), 0 0 60px rgba(74,184,255,0.08)',
  purple: '0 0 24px rgba(138,111,255,0.25), 0 0 60px rgba(138,111,255,0.08)',
  gold: '0 0 24px rgba(246,201,107,0.25), 0 0 60px rgba(246,201,107,0.08)',
  cyan: '0 0 24px rgba(49,244,255,0.25), 0 0 60px rgba(49,244,255,0.08)',
}

const COLOR_MAP = {
  blue: '#4ab8ff',
  purple: '#8a6fff',
  gold: '#f6c96b',
  cyan: '#31f4ff',
}

export default function SectionTitle({
  suptitle,
  title,
  subtitle,
  align = 'center',
  glowColor = 'blue',
}: SectionTitleProps) {
  const textAlign = align === 'center' ? 'text-center' : 'text-left'
  const glow = GLOW_MAP[glowColor]
  const accentColor = COLOR_MAP[glowColor]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-8 ${textAlign}`}
    >
      {suptitle && (
        <div
          className="text-[11px] tracking-[0.4em] mb-3 uppercase font-medium"
          style={{ color: accentColor + '90' }}
        >
          {suptitle}
        </div>
      )}
      <h2
        className="text-3xl md:text-4xl font-bold tracking-wider mb-2"
        style={{
          color: '#f0f4ff',
          textShadow: glow,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm md:text-base max-w-2xl mx-auto leading-relaxed" style={{ color: '#8a9bb8' }}>
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
