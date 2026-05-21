import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExhibitionStore } from '../store/exhibitionStore'
import consumptionData from '../data/consumption.json'

const AMOUNTS = [300, 500, 1000, 10000, 30000, 50000, 100000, 200000]

export default function ConsumptionDemo() {
  const { setSection } = useExhibitionStore()
  const [scene, setScene] = useState<string | null>(null)
  const [amount, setAmount] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)

  // Fix P0: Math.random() in render causes flickering - memoize particle positions
  const particlePositions = useMemo(() =>
    Array.from({ length: 8 }).map(() => 20 + Math.random() * 60),
    []
  )

  const selectedScene = consumptionData.find((s) => s.id === scene)
  const assetReward = amount ? Math.round(amount * 0.6) : 0

  const handleSimulate = () => {
    if (!scene || !amount) return
    setAnimating(true)
    setTimeout(() => setAnimating(false), 3000)
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(74,184,255,0.3) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl 3xl:max-w-6xl 4k:max-w-7xl px-8">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-glow-blue tracking-wider mb-2">
            消费权益互动演示
          </h2>
          <p className="text-sm text-text-muted">
            选择消费场景与金额，体验权益能量注入
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Scene selection */}
          <div className="col-span-4">
            <div className="glass-panel-strong rounded-xl p-5">
              <div className="text-xs text-text-muted mb-3 tracking-wider">消费场景</div>
              <div className="space-y-2">
                {consumptionData.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setScene(s.id)
                      setAmount(null)
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      scene === s.id
                        ? 'bg-primary-blue/15 border border-primary-blue/40'
                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className="text-sm font-medium text-text-main mb-1">{s.name}</div>
                    <div className="text-[10px] text-text-muted leading-relaxed">
                      {s.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Amount selection */}
          <div className="col-span-4">
            <div className="glass-panel-strong rounded-xl p-5">
              <div className="text-xs text-text-muted mb-3 tracking-wider">消费金额</div>
              <div className="grid grid-cols-2 gap-2">
                {AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    disabled={!scene}
                    className={`py-2.5 rounded-lg text-xs transition-all ${
                      amount === a
                        ? 'bg-accent-gold/15 text-accent-gold border border-accent-gold/40'
                        : scene
                        ? 'bg-white/5 text-text-secondary hover:bg-white/10 border border-transparent'
                        : 'bg-white/5 text-text-muted border border-transparent cursor-not-allowed'
                    }`}
                  >
                    {a.toLocaleString()} 元
                  </button>
                ))}
              </div>

              {scene && amount && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleSimulate}
                  className="w-full mt-4 py-3 rounded-lg bg-primary-blue/15 text-primary-blue text-xs border border-primary-blue/40 hover:bg-primary-blue/25 transition-all"
                >
                  启动权益能量注入
                </motion.button>
              )}
            </div>
          </div>

          {/* Result panel */}
          <div className="col-span-4">
            <AnimatePresence mode="wait">
              {scene && amount ? (
                <motion.div
                  key={`${scene}-${amount}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-panel-strong rounded-xl p-5 h-full"
                >
                  <div className="text-xs text-text-muted mb-4 tracking-wider">权益结果</div>

                  {/* Energy flow animation */}
                  <div className="relative h-32 mb-4 rounded-lg bg-bg-space border border-border-light overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {animating ? (
                        <motion.div
                          className="flex items-center gap-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <motion.div
                            className="text-accent-gold text-lg font-bold"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            ¥{amount.toLocaleString()}
                          </motion.div>
                          <motion.div
                            className="w-16 h-0.5 bg-gradient-to-r from-accent-gold to-primary-blue"
                            animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <motion.div
                            className="text-primary-blue text-lg font-bold"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                          >
                            {assetReward.toLocaleString()} 数据资产
                          </motion.div>
                        </motion.div>
                      ) : (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-accent-gold mb-1">
                            ¥{amount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-text-muted">消费金额</div>
                        </div>
                      )}
                    </div>
                    {/* Flowing particles */}
                    {animating && (
                      <>
                        {particlePositions.map((pos, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 rounded-full bg-primary-blue"
                            style={{ top: `${pos}%` }}
                            animate={{ left: ['10%', '90%'], opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </>
                    )}
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-muted">消费场景</span>
                      <span className="text-text-main">{selectedScene?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">数据资产奖励</span>
                      <span className="text-primary-blue font-bold">
                        {assetReward.toLocaleString()} 元
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">奖励比例</span>
                      <span className="text-accent-gold">60%</span>
                    </div>
                    <div className="h-px bg-border-light my-2" />
                    <div className="text-[10px] text-text-muted leading-relaxed">
                      权益路径：个人数据资产账户 → 每日释放 → 交易账户 → 闪兑 / 出金 / 消费抵扣
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="glass-panel-strong rounded-xl p-5 h-full flex items-center justify-center">
                  <p className="text-xs text-text-muted text-center">
                    请选择消费场景和金额
                    <br />
                    查看权益演示
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex gap-4">
        <button
          onClick={() => setSection('machineRoom')}
          className="glass-panel px-5 py-2 rounded-lg text-xs text-text-secondary border border-border-light hover:text-text-main transition-all"
        >
          返回机房展厅
        </button>
        <button
          onClick={() => setSection('assetFlow')}
          className="glass-panel px-5 py-2 rounded-lg text-xs text-primary-cyan border border-primary-cyan/30 hover:border-primary-cyan/60 transition-all"
        >
          数据资产流转引擎
        </button>
      </div>
    </div>
  )
}
