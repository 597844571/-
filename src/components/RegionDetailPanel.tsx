import { motion } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'
import regionsData from '../data/regions.json'

export default function RegionDetailPanel() {
  const { selectedRegion, setSelectedRegion, setSection } = useExhibitionStore()
  const region = regionsData.find((r) => r.id === selectedRegion)

  if (!region) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="absolute right-8 top-24 bottom-24 z-40 w-80"
    >
      <div className="glass-panel-strong rounded-xl p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-text-main mb-1">{region.name}</h3>
            <p className="text-xs text-primary-cyan">{region.position}</p>
          </div>
          <button
            onClick={() => setSelectedRegion(null)}
            className="text-text-muted hover:text-text-main transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Status badge */}
        <div className="mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] bg-primary-blue/10 text-primary-blue border border-primary-blue/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-blue mr-1.5 animate-pulse" />
            {region.status}
          </span>
        </div>

        {/* Nodes */}
        <div className="mb-5">
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
            算力基础
          </div>
          <div className="space-y-1.5">
            {region.nodes.map((node) => (
              <div
                key={node}
                className="flex items-center gap-2 text-xs text-text-secondary"
              >
                <span className="w-1 h-1 rounded-full bg-primary-cyan" />
                {node}
              </div>
            ))}
          </div>
        </div>

        {/* Ecosystem */}
        <div className="mb-5">
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
            生态布局
          </div>
          <div className="flex flex-wrap gap-1.5">
            {region.ecosystem.map((item) => (
              <span
                key={item}
                className="px-2 py-1 rounded text-[10px] bg-white/5 text-text-secondary border border-border-light"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Opportunities */}
        <div className="mb-6">
          <div className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
            合作方向
          </div>
          <div className="space-y-1.5">
            {region.opportunities.map((opp) => (
              <div
                key={opp}
                className="flex items-center gap-2 text-xs text-text-secondary"
              >
                <span className="w-1 h-1 rounded-full bg-accent-gold" />
                {opp}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-2">
          <button
            onClick={() => setSection('machineRoom')}
            className="w-full py-2.5 rounded-lg bg-primary-blue/10 text-primary-blue text-xs border border-primary-blue/30 hover:bg-primary-blue/20 transition-all"
          >
            进入机房节点
          </button>
          <button
            onClick={() => setSection('rights')}
            className="w-full py-2.5 rounded-lg glass-panel text-accent-gold text-xs border border-accent-gold/30 hover:border-accent-gold/60 transition-all"
          >
            查看区域合作
          </button>
          <button
            onClick={() => setSection('future')}
            className="w-full py-2.5 rounded-lg glass-panel text-primary-cyan text-xs border border-primary-cyan/30 hover:border-primary-cyan/60 transition-all"
          >
            加入未来推演
          </button>
        </div>
      </div>
    </motion.div>
  )
}
