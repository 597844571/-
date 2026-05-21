import { motion } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'

export default function EndingPage() {
  const setSection = useExhibitionStore((s) => s.setSection)
  const setIntroComplete = useExhibitionStore((s) => s.setIntroComplete)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex items-center justify-center w-full h-full"
    >
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-5xl font-bold text-glow-blue mb-6 tracking-wider"
        >
          携手神枢，共创数字算力生态新未来
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed mb-12"
        >
          神枢算力权益通以算力基础设施为支撑，以数据资产流通为牵引，以消费生态和区域合作为连接，
          推动用户、企业、商家与合作伙伴共同参与数字经济价值网络建设。
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex gap-6 justify-center"
        >
          <button
            onClick={() => setSection('map')}
            className="px-8 py-3 rounded-lg glass-panel text-primary-cyan border border-primary-cyan/30 hover:border-primary-cyan/60 transition-all"
          >
            查看区域机会
          </button>
          <button
            onClick={() => setSection('rights')}
            className="px-8 py-3 rounded-lg glass-panel text-accent-gold border border-accent-gold/30 hover:border-accent-gold/60 transition-all"
          >
            了解合伙人权益
          </button>
          <button
            onClick={() => {
              setIntroComplete(false)
              setSection('intro')
            }}
            className="px-8 py-3 rounded-lg glass-panel text-primary-blue border border-primary-blue/30 hover:border-primary-blue/60 transition-all"
          >
            重新播放展厅
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
