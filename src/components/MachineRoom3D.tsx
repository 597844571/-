import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Box, RoundedBox } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { useExhibitionStore } from '../store/exhibitionStore'
import machineRoomData from '../data/machineRoom.json'

/* ========== 硬件图标（简化 SVG） ========== */
function IconGPU({ size, active }: { size: number; active?: boolean }) {
  const c = active ? '#4AB8FF' : '#6F7F9F'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <line x1="7" y1="10" x2="7" y2="14" />
      <line x1="11" y1="10" x2="11" y2="14" />
      <line x1="15" y1="10" x2="15" y2="14" />
      <circle cx="18" cy="18" r="1.5" fill={c} stroke="none" />
    </svg>
  )
}
function IconRack({ size, active }: { size: number; active?: boolean }) {
  const c = active ? '#31F4FF' : '#6F7F9F'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5">
      <rect x="6" y="3" width="12" height="18" rx="1" />
      <line x1="6" y1="8" x2="18" y2="8" />
      <line x1="6" y1="13" x2="18" y2="13" />
      <line x1="6" y1="18" x2="18" y2="18" />
      <circle cx="9" cy="15.5" r="0.8" fill={c} stroke="none" />
    </svg>
  )
}
function IconNetwork({ size, active }: { size: number; active?: boolean }) {
  const c = active ? '#7C5CFF' : '#6F7F9F'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5">
      <rect x="4" y="10" width="16" height="4" rx="1" />
      <circle cx="8" cy="12" r="1" fill={c} stroke="none" />
      <circle cx="12" cy="12" r="1" fill={c} stroke="none" />
      <circle cx="16" cy="12" r="1" fill={c} stroke="none" />
      <line x1="12" y1="6" x2="12" y2="10" />
      <line x1="12" y1="14" x2="12" y2="18" />
    </svg>
  )
}
function IconStorage({ size, active }: { size: number; active?: boolean }) {
  const c = active ? '#F6C96B' : '#6F7F9F'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5">
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <line x1="5" y1="9" x2="19" y2="9" />
      <line x1="5" y1="15" x2="19" y2="15" />
      <circle cx="9" cy="12" r="1" fill={c} stroke="none" />
    </svg>
  )
}
function IconCooling({ size, active }: { size: number; active?: boolean }) {
  const c = active ? '#4ECDC4' : '#6F7F9F'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5">
      <circle cx="12" cy="12" r="7" />
      <path d="M12 5v3M12 16v3M5 12h3M16 12h3M7.05 7.05l2.12 2.12M14.83 14.83l2.12 2.12M7.05 16.95l2.12-2.12M14.83 9.17l2.12-2.12" />
    </svg>
  )
}
function IconPower({ size, active }: { size: number; active?: boolean }) {
  const c = active ? '#FF8C42' : '#6F7F9F'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5">
      <path d="M13 2L4.09 12.11a2 2 0 0 0 .56 3.09l.68.34a2 2 0 0 0 2.18-.18L13 11V2z" />
      <path d="M13 11l-4.5 4.5a2 2 0 0 0-.18 2.18l.34.68a2 2 0 0 0 3.09.56L13 11z" fill={active ? c + '20' : 'none'} />
    </svg>
  )
}
function IconSecurity({ size, active }: { size: number; active?: boolean }) {
  const c = active ? '#95E1D3' : '#6F7F9F'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  )
}

const HARDWARE_ICONS: Record<string, React.FC<{ size: number; active?: boolean }>> = {
  gpu_server: IconGPU,
  server_rack: IconRack,
  network_switch: IconNetwork,
  storage_array: IconStorage,
  cooling: IconCooling,
  power: IconPower,
  security: IconSecurity,
}

// Hologram scan line overlay
function HologramScan({ active, width, height, color }: {
  active: boolean
  width: number
  height: number
  color: string
}) {
  const ref = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.visible = active
      if (active) {
        const y = ((state.clock.elapsedTime * 0.6) % (height + 0.2)) - height / 2 - 0.1
        ref.current.position.y = y
        if (matRef.current) {
          matRef.current.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.15
        }
      }
    }
  })

  return (
    <mesh ref={ref} position={[0, 0, 0]} visible={false}>
      <planeGeometry args={[width, 0.015]} />
      <meshBasicMaterial ref={matRef} color={color} transparent opacity={0.5} toneMapped={false} />
    </mesh>
  )
}

// Server Rack Component
function ServerRack({ position, highlighted, onClick, index }: {
  position: [number, number, number]
  highlighted: boolean
  onClick: () => void
  index: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const targetIntensity = useRef(0.05)
  const breatheOffset = useRef(index)

  // Update target via ref when props change (bypass React render in useFrame)
  useEffect(() => {
    targetIntensity.current = highlighted ? 0.4 : hovered ? 0.15 : 0.05
    breatheOffset.current = index
  }, [highlighted, hovered, index])

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      const breathe = highlighted ? Math.sin(state.clock.elapsedTime * 3 + breatheOffset.current) * 0.2 : 0
      const target = targetIntensity.current + breathe
      mat.emissiveIntensity += (target - mat.emissiveIntensity) * 0.1
    }
  })

  return (
    <group position={position}>
      <RoundedBox
        ref={meshRef}
        args={[0.8, 2.2, 0.8]}
        radius={0.04}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={highlighted ? '#1a3a5c' : '#0f1f35'}
          emissive={highlighted ? '#4ab8ff' : '#0a1a30'}
          emissiveIntensity={0.05}
          metalness={0.8}
          roughness={0.3}
        />
      </RoundedBox>
      {/* LED strip */}
      <Box args={[0.6, 0.02, 0.82]} position={[0, 0.9, 0]}>
        <meshBasicMaterial
          color="#38f2ff"
          transparent
          opacity={highlighted ? 0.8 : 0.3}
        />
      </Box>
      <Box args={[0.6, 0.02, 0.82]} position={[0, 0.5, 0]}>
        <meshBasicMaterial
          color="#4ab8ff"
          transparent
          opacity={highlighted ? 0.6 : 0.2}
        />
      </Box>
      <Box args={[0.6, 0.02, 0.82]} position={[0, 0.1, 0]}>
        <meshBasicMaterial
          color="#7c5cff"
          transparent
          opacity={highlighted ? 0.5 : 0.15}
        />
      </Box>
      {/* Highlight border */}
      {(highlighted || hovered) && (
        <Box args={[0.85, 2.25, 0.85]}>
          <meshBasicMaterial color="#4ab8ff" wireframe transparent opacity={0.3} />
        </Box>
      )}
      {/* Hologram scan line on front face */}
      <group position={[0, 0, 0.41]}>
        <HologramScan active={highlighted} width={0.72} height={2.2} color="#4ab8ff" />
      </group>
    </group>
  )
}

// GPU Server (larger, different shape)
function GPUServer({ position, highlighted, onClick }: {
  position: [number, number, number]
  highlighted: boolean
  onClick: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const targetIntensity = useRef(0.08)

  useEffect(() => {
    targetIntensity.current = highlighted ? 0.5 : hovered ? 0.2 : 0.08
  }, [highlighted, hovered])

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      const breathe = highlighted ? Math.sin(state.clock.elapsedTime * 4) * 0.2 : 0
      const target = targetIntensity.current + breathe
      mat.emissiveIntensity += (target - mat.emissiveIntensity) * 0.1
    }
  })

  return (
    <group position={position}>
      <RoundedBox
        ref={meshRef}
        args={[1.2, 1.8, 1.2]}
        radius={0.06}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={highlighted ? '#2a2050' : '#151030'}
          emissive={highlighted ? '#7c5cff' : '#0f0a20'}
          emissiveIntensity={0.08}
          metalness={0.7}
          roughness={0.4}
        />
      </RoundedBox>
      {/* GPU glow strips */}
      {[-0.3, 0, 0.3].map((y, i) => (
        <Box key={i} args={[1.22, 0.04, 0.3]} position={[0, y, 0.62]}>
          <meshBasicMaterial
            color="#7c5cff"
            transparent
            opacity={highlighted ? 0.7 : 0.2}
          />
        </Box>
      ))}
      {(highlighted || hovered) && (
        <Box args={[1.28, 1.86, 1.28]}>
          <meshBasicMaterial color="#7c5cff" wireframe transparent opacity={0.3} />
        </Box>
      )}
      {/* Hologram scan line on front face */}
      <group position={[0, 0, 0.61]}>
        <HologramScan active={highlighted} width={1.1} height={1.8} color="#7c5cff" />
      </group>
    </group>
  )
}

// Network Switch
function NetworkSwitch({ highlighted, onClick }: {
  highlighted: boolean
  onClick: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const targetIntensity = useRef(0.05)

  useEffect(() => {
    targetIntensity.current = highlighted ? 0.3 : 0.05
  }, [highlighted])

  useFrame(() => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity += (targetIntensity.current - mat.emissiveIntensity) * 0.1
    }
  })

  return (
    <group position={[0, -0.3, 0]}>
      <RoundedBox
        ref={meshRef}
        args={[1, 0.4, 0.6]}
        radius={0.03}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
      >
        <meshStandardMaterial
          color={highlighted ? '#1a3050' : '#0f1a30'}
          emissive={highlighted ? '#4ab8ff' : '#0a1525'}
          emissiveIntensity={0.05}
          metalness={0.9}
          roughness={0.2}
        />
      </RoundedBox>
      {/* Port lights */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Box key={i} args={[0.04, 0.04, 0.62]} position={[-0.25 + i * 0.1, 0.05, 0]}>
          <meshBasicMaterial
            color="#38f2ff"
            transparent
            opacity={highlighted ? 0.9 : 0.3}
          />
        </Box>
      ))}
    </group>
  )
}

// Data flow particle (emissive for Bloom capture)
function DataParticle({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const ref = useRef<THREE.Mesh>(null)
  const progress = useRef(Math.random())

  useFrame((_, delta) => {
    progress.current += delta * 0.15
    if (progress.current > 1) progress.current = 0
    if (ref.current) {
      const pos = curve.getPoint(progress.current)
      ref.current.position.copy(pos)
    }
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.035, 8, 8]} />
      <meshStandardMaterial
        color="#38f2ff"
        emissive="#38f2ff"
        emissiveIntensity={2}
        toneMapped={false}
      />
    </mesh>
  )
}

// Room floor
function RoomFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial
        color="#060c18"
        metalness={0.9}
        roughness={0.2}
      />
    </mesh>
  )
}

// Camera smooth focus rig
function CameraRig({ selectedHardware }: { selectedHardware: string | null }) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3(6, 4, 6))
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0))

  useEffect(() => {
    if (!selectedHardware) {
      targetPos.current.set(6, 4, 6)
      lookAtTarget.current.set(0, 0, 0)
    } else if (selectedHardware === 'server_rack') {
      targetPos.current.set(0, 2.8, 5.5)
      lookAtTarget.current.set(0, 0.5, 0)
    } else if (selectedHardware === 'gpu_server') {
      targetPos.current.set(0, 2.8, 5)
      lookAtTarget.current.set(0, 0.5, 0)
    } else if (selectedHardware === 'network_switch') {
      targetPos.current.set(3, 2, 3)
      lookAtTarget.current.set(0, -0.3, 0)
    }
  }, [selectedHardware])

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.035)
    const currentLookAt = new THREE.Vector3(0, 0, -1)
      .applyQuaternion(camera.quaternion)
      .add(camera.position)
    currentLookAt.lerp(lookAtTarget.current, 0.035)
    camera.lookAt(currentLookAt)
  })

  return null
}

// Room Scene
function RoomScene({ selectedHardware, onSelect }: {
  selectedHardware: string | null
  onSelect: (id: string) => void
}) {
  const racks: Array<{ pos: [number, number, number]; id: string }> = useMemo(() => {
    const arr: Array<{ pos: [number, number, number]; id: string }> = []
    for (let i = 0; i < 8; i++) {
      arr.push({ pos: [-3 + i * 0.9, 0, -1.5], id: 'server_rack' })
      arr.push({ pos: [-3 + i * 0.9, 0, 1.5], id: 'server_rack' })
    }
    return arr
  }, [])

  const gpuPositions: Array<[number, number, number]> = useMemo(() => [
    [-2.5, 0, 0],
    [2.5, 0, 0],
  ], [])

  // Data flow curves
  const curves = useMemo(() => [
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.5, 0.5, 0),
      new THREE.Vector3(-1, 0.8, -0.5),
      new THREE.Vector3(0, 1.2, 0),
      new THREE.Vector3(1, 0.8, 0.5),
      new THREE.Vector3(2.5, 0.5, 0),
    ]),
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3, 0, -1.5),
      new THREE.Vector3(-1.5, 0.5, -0.5),
      new THREE.Vector3(0, 0.8, 0),
      new THREE.Vector3(1.5, 0.5, 0.5),
      new THREE.Vector3(3, 0, 1.5),
    ]),
  ], [])

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#4ab8ff" />
      <pointLight position={[-5, 3, -3]} intensity={0.3} color="#7c5cff" />
      <pointLight position={[5, 3, 3]} intensity={0.3} color="#38f2ff" />

      <RoomFloor />

      {/* Server racks */}
      {racks.map((rack, i) => (
        <ServerRack
          key={`rack-${i}`}
          position={rack.pos}
          highlighted={selectedHardware === rack.id}
          onClick={() => onSelect(rack.id)}
          index={i}
        />
      ))}

      {/* GPU servers */}
      {gpuPositions.map((pos, i) => (
        <GPUServer
          key={`gpu-${i}`}
          position={pos}
          highlighted={selectedHardware === 'gpu_server'}
          onClick={() => onSelect('gpu_server')}
        />
      ))}

      <NetworkSwitch
        highlighted={selectedHardware === 'network_switch'}
        onClick={() => onSelect('network_switch')}
      />

      {/* Data particles */}
      {curves.map((curve, i) => (
        <group key={`particles-${i}`}>
          {Array.from({ length: 5 }).map((_, j) => (
            <DataParticle key={j} curve={curve} />
          ))}
        </group>
      ))}

      <CameraRig selectedHardware={selectedHardware} />

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={12}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 6}
        autoRotate={!selectedHardware}
        autoRotateSpeed={0.5}
      />

      {/* Post-processing: Bloom for emissive glow */}
      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}

// Hardware info panel
function HardwareInfoPanel() {
  const { selectedHardware, setSelectedHardware } = useExhibitionStore()
  const hw = machineRoomData.find((h) => h.id === selectedHardware)

  if (!hw) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ duration: 0.4 }}
      className="absolute right-8 top-24 bottom-24 z-30 w-72"
    >
      <div className="glass-panel-strong rounded-xl p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-primary-blue">{hw.name}</h3>
          <button
            onClick={() => setSelectedHardware(null)}
            className="text-text-muted hover:text-text-main"
          >
            ×
          </button>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">{hw.description}</p>
        <div className="mt-auto pt-4">
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>状态</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm" style={{ color: 'var(--text-sub)' }}>正常运行</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function MachineRoom3D() {
  const { selectedHardware, setSelectedHardware, setSection, showMachineDocs, setShowMachineDocs } = useExhibitionStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-text-muted">加载三维机房...</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [6, 4, 6], fov: 50 }}
          style={{ background: '#05070d' }}
        >
          <RoomScene
            selectedHardware={selectedHardware}
            onSelect={(id) => setSelectedHardware(id === selectedHardware ? null : id)}
          />
        </Canvas>
      </div>

      {/* Title */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none">
        <h2 className="text-2xl font-bold text-glow-blue tracking-wider mb-1">
          三维机房展厅
        </h2>
        <p className="text-sm text-text-muted">
          算力基础设施核心硬件体系
        </p>
      </div>

      {/* Hardware list on left */}
      <div className="absolute left-8 top-24 bottom-24 z-30 flex flex-col justify-center">
        <div className="rounded-xl p-4 w-64 space-y-2"
          style={{
            background: 'rgba(11, 20, 36, 0.6)',
            backdropFilter: 'blur(16px) saturate(140%)',
            border: '1px solid rgba(126, 190, 255, 0.1)',
          }}
        >
          <div className="text-sm tracking-wider mb-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <span className="w-1 h-1 rounded-full" style={{ background: 'var(--cyan-flow)' }} />
            机房设备
          </div>
          {machineRoomData.map((hw) => {
            const Icon = HARDWARE_ICONS[hw.id]
            const isActive = selectedHardware === hw.id
            return (
              <button
                key={hw.id}
                onClick={() => setSelectedHardware(hw.id === selectedHardware ? null : hw.id)}
                className="w-full text-left rounded-lg transition-all group"
                style={{
                  padding: '10px 12px',
                  background: isActive ? 'rgba(74, 184, 255, 0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(74, 184, 255, 0.25)' : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                    e.currentTarget.style.border = '1px solid rgba(126, 190, 255, 0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.border = '1px solid transparent'
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  {Icon && (
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{
                        background: isActive ? 'rgba(74, 184, 255, 0.15)' : 'rgba(255,255,255,0.04)',
                      }}
                    >
                      <Icon size={16} active={isActive} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-medium truncate"
                      style={{ color: isActive ? 'var(--blue-core)' : 'var(--text-main)' }}
                    >
                      {hw.name}
                    </div>
                    <div className="text-sm truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {hw.description.slice(0, 20)}...
                    </div>
                  </div>
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all"
                    style={{
                      background: isActive ? 'var(--cyan-flow)' : 'rgba(111, 127, 159, 0.3)',
                      boxShadow: isActive ? '0 0 6px var(--cyan-flow)' : 'none',
                    }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Hardware info panel */}
      <AnimatePresence>
        {selectedHardware && <HardwareInfoPanel />}
      </AnimatePresence>

      {/* Machine docs drawer */}
      <AnimatePresence>
        {showMachineDocs && (
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            className="absolute right-8 top-24 bottom-24 z-30 w-80"
          >
            <div className="glass-panel-strong rounded-xl p-6 h-full flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-primary-blue">机房真实资料</h3>
                <button
                  onClick={() => setShowMachineDocs(false)}
                  className="text-text-muted hover:text-text-main"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3 flex-1">
                <div className="p-3 rounded-lg bg-white/5 border border-border-light">
                  <div className="text-sm text-text-muted mb-1">节点名称</div>
                  <div className="text-sm text-text-main">杭州算力节点</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-border-light">
                  <div className="text-sm text-text-muted mb-1">机房类型</div>
                  <div className="text-sm text-text-main">高标准数据机房</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-border-light">
                  <div className="text-sm text-text-muted mb-1">资源能力</div>
                  <div className="text-sm text-text-sub">GPU服务器 / 网络交换 / 存储阵列 / 运维监控</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-border-light">
                  <div className="text-sm text-text-muted mb-1">资料类型</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['实景图', '设备图', '运维说明', '合作说明'].map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded text-sm bg-primary-blue/10 text-primary-blue border border-primary-blue/20">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-3 text-sm text-text-muted text-center">
                资料占位，后续可接入真实文件
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex gap-4">
        <button
          onClick={() => setSection('map')}
          className="glass-panel px-5 py-2 rounded-lg text-sm text-text-secondary border border-border-light hover:text-text-main transition-all"
        >
          返回全国地图
        </button>
        <button
          onClick={() => setShowMachineDocs(true)}
          className="glass-panel px-5 py-2 rounded-lg text-sm text-accent-gold border border-accent-gold/30 hover:border-accent-gold/60 transition-all"
        >
          查看真实资料
        </button>
        <button
          onClick={() => setSection('consumption')}
          className="glass-panel px-5 py-2 rounded-lg text-sm text-primary-cyan border border-primary-cyan/30 hover:border-primary-cyan/60 transition-all"
        >
          消费权益演示
        </button>
      </div>
    </div>
  )
}
