import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { init, registerMap, use as echartsUse } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GeoComponent, TooltipComponent, VisualMapComponent } from 'echarts/components'
import { LinesChart, EffectScatterChart, ScatterChart, HeatmapChart } from 'echarts/charts'
import { useExhibitionStore, type MapMode } from '../store/exhibitionStore'
import RegionDetailPanel from './RegionDetailPanel'
import regionsData from '../data/regions.json'

// Tree-shake ECharts to only include needed modules
echartsUse([CanvasRenderer, GeoComponent, TooltipComponent, VisualMapComponent, LinesChart, EffectScatterChart, ScatterChart, HeatmapChart])

const MAP_MODES: { key: MapMode; label: string; desc: string }[] = [
  {
    key: 'nodes',
    label: '全国算力节点',
    desc: '以高标准数据机房为基础，构建覆盖多区域的算力资源网络',
  },
  {
    key: 'heat',
    label: '消费生态热力',
    desc: '围绕算力通优选区、商城和本地生活场景，形成线上线下融合的消费入口',
  },
  {
    key: 'cooperation',
    label: '区域合作布局',
    desc: '通过区域合伙代理、服务网点和合作伙伴体系，推动项目在重点区域落地',
  },
  {
    key: 'growth',
    label: '增长池贡献视图',
    desc: '平台消费生态与算力机房收益共同构成数据资产增长池的重要来源',
  },
  {
    key: 'future',
    label: '未来扩张推演',
    desc: '从核心区域试点，到算力节点联网，再到全国数字算力生态网络',
  },
]

// City coordinates
const CITIES = [
  { name: '北京', value: [116.4074, 39.9042], type: 'core' },
  { name: '杭州', value: [120.1551, 30.2741], type: 'core' },
  { name: '南京', value: [118.7969, 32.0603], type: 'core' },
  { name: '广州', value: [113.2644, 23.1291], type: 'expand' },
  { name: '深圳', value: [114.0579, 22.5431], type: 'expand' },
  { name: '成都', value: [104.0668, 30.5728], type: 'pilot' },
  { name: '宁波', value: [121.544, 29.8683], type: 'core' },
  { name: '上海', value: [121.4737, 31.2304], type: 'core' },
  { name: '武汉', value: [114.3054, 30.5928], type: 'expand' },
  { name: '西安', value: [108.9398, 34.3416], type: 'pilot' },
  { name: '重庆', value: [106.5516, 29.563], type: 'pilot' },
  { name: '郑州', value: [113.6253, 34.7466], type: 'pilot' },
]

// Flight lines between cities
const FLIGHTS = [
  { from: '北京', to: '杭州' },
  { from: '北京', to: '广州' },
  { from: '北京', to: '成都' },
  { from: '杭州', to: '南京' },
  { from: '杭州', to: '深圳' },
  { from: '广州', to: '深圳' },
  { from: '成都', to: '重庆' },
  { from: '上海', to: '杭州' },
  { from: '上海', to: '南京' },
  { from: '武汉', to: '郑州' },
  { from: '西安', to: '成都' },
  { from: '北京', to: '西安' },
]

function getCityCoord(name: string): [number, number] | null {
  const city = CITIES.find((c) => c.name === name)
  return city ? (city.value as [number, number]) : null
}

export default function NationalMapStage() {
  const { mapMode, setMapMode, selectedRegion, setSelectedRegion, setSection } =
    useExhibitionStore()
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<ReturnType<typeof init> | null>(null)
  const [geoLoaded, setGeoLoaded] = useState(false)

  const initChart = useCallback(() => {
    if (!chartRef.current || !geoLoaded) return

    if (chartInstance.current) {
      chartInstance.current.dispose()
    }

    const chart = init(chartRef.current, undefined, { renderer: 'canvas' })
    chartInstance.current = chart

    const flightsData = FLIGHTS.map((f) => {
      const from = getCityCoord(f.from)
      const to = getCityCoord(f.to)
      return {
        coords: from && to ? [from, to] : null,
        lineStyle: {
          color: mapMode === 'future' ? '#7c5cff' : '#4ab8ff',
          opacity: 0.6,
          width: 1,
        },
      }
    }).filter((f): f is { coords: [number, number][]; lineStyle: { color: string; opacity: number; width: number } } => f.coords !== null)

    const scatterData = CITIES.map((c) => ({
      name: c.name,
      value: c.value,
      itemStyle: {
        color:
          c.type === 'core'
            ? '#38f2ff'
            : c.type === 'expand'
            ? '#4ab8ff'
            : '#7c5cff',
        shadowBlur: 12,
        shadowColor:
          c.type === 'core'
            ? 'rgba(56, 242, 255, 0.5)'
            : c.type === 'expand'
            ? 'rgba(74, 184, 255, 0.4)'
            : 'rgba(124, 92, 255, 0.4)',
      },
    }))

    const effectScatterData = CITIES.filter((c) => c.type === 'core').map((c) => ({
      name: c.name,
      value: c.value,
    }))

    const option: any = {
      backgroundColor: 'transparent',
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.2,
        center: [105, 36],
        label: { show: false },
        itemStyle: {
          areaColor: 'rgba(12, 24, 48, 0.6)',
          borderColor: 'rgba(74, 184, 255, 0.25)',
          borderWidth: 1,
          shadowColor: 'rgba(0, 0, 0, 0.4)',
          shadowBlur: 10,
        },
        emphasis: {
          itemStyle: {
            areaColor: 'rgba(74, 184, 255, 0.15)',
            borderColor: 'rgba(74, 184, 255, 0.5)',
            borderWidth: 1.5,
          },
        },
        select: {
          itemStyle: {
            areaColor: 'rgba(124, 92, 255, 0.2)',
            borderColor: '#7c5cff',
            borderWidth: 1.5,
          },
        },
      },
      series: [
        {
          type: 'lines',
          coordinateSystem: 'geo',
          data: flightsData,
          effect: {
            show: true,
            period: 4,
            trailLength: 0.4,
            symbol: 'arrow',
            symbolSize: 4,
            color: mapMode === 'future' ? '#7c5cff' : '#38f2ff',
          },
          lineStyle: {
            curveness: 0.2,
          },
          zlevel: 2,
        },
        {
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: effectScatterData,
          symbolSize: 12,
          rippleEffect: {
            brushType: 'stroke',
            scale: 3,
            period: 3,
          },
          itemStyle: {
            color: '#38f2ff',
            opacity: 0.8,
          },
          zlevel: 3,
        },
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          data: scatterData,
          symbolSize: 6,
          zlevel: 3,
        },
      ],
    }

    // Heat mode: use effectScatter with visualMap instead of heatmap
    // (heatmap in geo coordinateSystem is not reliably supported in tree-shaking mode)
    if (mapMode === 'heat') {
      const heatScatterData = CITIES.map((c) => ({
        name: c.name,
        value: [...c.value, Math.floor(Math.random() * 60 + 40)],
      }))
      const series = option.series as any[]
      series.push({
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: heatScatterData,
        symbolSize: (val: number[]) => Math.sqrt((val[2] || 50)) * 1.8,
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'fill',
          scale: 4,
          period: 4,
        },
        itemStyle: {
          color: '#f6c96b',
          opacity: 0.9,
        },
        zlevel: 4,
      })
    }

    chart.setOption(option)

    chart.on('click', (params: any) => {
      if (params.componentType === 'geo' || params.name) {
        const region = regionsData.find(
          (r) => r.name.includes(params.name) || params.name.includes(r.name.replace('区域', ''))
        )
        if (region) {
          setSelectedRegion(region.id)
        }
      }
    })

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }, [geoLoaded, mapMode, setSelectedRegion])

  useEffect(() => {
    fetch('./maps/china.geo.json')
      .then((res) => res.json())
      .then((geoJson) => {
        registerMap('china', geoJson)
        setGeoLoaded(true)
      })
      .catch((err) => {
        console.error('Failed to load china geo json:', err)
      })
  }, [])

  useEffect(() => {
    const cleanup = initChart()
    return () => {
      cleanup?.()
    }
  }, [initChart])

  return (
    <div className="relative w-full h-full">
      {/* Map container with CSS 3D perspective */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          perspective: '1400px',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          ref={chartRef}
          className="absolute inset-0 w-full h-full"
          style={{
            transform: 'rotateX(10deg) scale(0.96)',
            transformOrigin: 'center 55%',
          }}
        />
      </div>

      {/* Left mode switcher */}
      <div className="absolute left-8 top-24 bottom-24 z-30 flex flex-col justify-center">
        <div className="glass-panel-strong rounded-xl p-4 space-y-2 w-56">
          <div className="text-xs text-text-muted mb-2 tracking-wider">地图模式</div>
          {MAP_MODES.map((mode) => (
            <button
              key={mode.key}
              onClick={() => {
                setMapMode(mode.key)
                setSelectedRegion(null)
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all ${
                mapMode === mode.key
                  ? 'bg-primary-blue/15 text-primary-blue border border-primary-blue/30'
                  : 'text-text-secondary hover:bg-white/5 hover:text-text-main'
              }`}
            >
              <div className="font-medium">{mode.label}</div>
              {mapMode === mode.key && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-[10px] text-text-muted mt-1 leading-relaxed"
                >
                  {mode.desc}
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right detail panel */}
      <AnimatePresence>
        {selectedRegion && <RegionDetailPanel />}
      </AnimatePresence>

      {/* Title overlay */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none">
        <h2 className="text-2xl font-bold text-glow-blue tracking-wider mb-1">
          全国算力生态地图
        </h2>
        <p className="text-xs text-text-muted">
          {MAP_MODES.find((m) => m.key === mapMode)?.desc}
        </p>
      </div>

      {/* Legend */}
      <div className="absolute right-8 bottom-20 z-30 glass-panel rounded-lg p-3">
        <div className="text-[10px] text-text-muted mb-2">节点类型</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[10px] text-text-secondary">
            <span className="w-2 h-2 rounded-full bg-[#38f2ff] shadow-[0_0_6px_rgba(56,242,255,0.5)]" />
            核心运营区
          </div>
          <div className="flex items-center gap-2 text-[10px] text-text-secondary">
            <span className="w-2 h-2 rounded-full bg-[#4ab8ff]" />
            重点拓展区
          </div>
          <div className="flex items-center gap-2 text-[10px] text-text-secondary">
            <span className="w-2 h-2 rounded-full bg-[#7c5cff]" />
            试点拓展区
          </div>
        </div>
      </div>

      {/* Enter machine room hint */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => setSection('machineRoom')}
          className="glass-panel px-6 py-2.5 rounded-lg text-xs text-primary-cyan border border-primary-cyan/30 hover:border-primary-cyan/60 transition-all flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary-cyan animate-pulse" />
          进入三维机房展厅
        </button>
      </div>
    </div>
  )
}
