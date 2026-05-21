/**
 * 路演推演数据持久化
 * localStorage 封装 + 版本管理
 */

import type { PartnerGrowthScenario } from '../data/roadshowPreset'
import { DEFAULT_SCENARIO } from '../data/roadshowPreset'

const STORAGE_KEY = 'shenshu-roadshow-scenario-v1'
const STORAGE_VERSION = 1

interface StoredData {
  version: number
  updatedAt: string
  scenario: PartnerGrowthScenario
}

/** 保存用户编辑的方案到 localStorage */
export function saveScenario(scenario: PartnerGrowthScenario): void {
  try {
    const data: StoredData = {
      version: STORAGE_VERSION,
      updatedAt: new Date().toISOString(),
      scenario,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // 忽略存储失败（如隐私模式）
  }
}

/** 从 localStorage 读取用户方案，没有则返回 null */
export function loadUserScenario(): PartnerGrowthScenario | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as StoredData

    // 版本兼容检查
    if (!parsed.version || parsed.version < STORAGE_VERSION) {
      // 未来可以在这里做数据迁移
      return null
    }

    return parsed.scenario
  } catch {
    return null
  }
}

/** 加载有效方案：用户数据优先，否则返回预设 */
export function loadEffectiveScenario(): PartnerGrowthScenario {
  return loadUserScenario() ?? DEFAULT_SCENARIO
}

/** 清除用户数据，恢复默认 */
export function resetToDefault(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // 忽略
  }
}

/** 检查是否有用户自定义数据 */
export function hasUserScenario(): boolean {
  return loadUserScenario() !== null
}
