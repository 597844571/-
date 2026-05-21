/**
 * 神枢算力权益通 · 路演推演预设数据
 * V2.0 默认内置方案，开箱即用
 */

export interface PartnerGrowthScenario {
  id: string
  name: string
  identity: PartnerIdentity
  personalInvestment: number
  invitedCustomers: number
  conversionRate: number
  averageCustomerInvestment: number
  monthlyNewCustomers: number
  monthlyGrowthRate: number
  projectionMonths: 12 | 24 | 36
}

export type PartnerIdentity =
  | 'member'
  | 'team_leader'
  | 'partner_10000'
  | 'partner_30000'
  | 'partner_50000'
  | 'cofounder'
  | 'regional_agent'

export const IDENTITY_LABELS: Record<PartnerIdentity, string> = {
  member: '普通会员',
  team_leader: '团队长',
  partner_10000: '1万合伙人',
  partner_30000: '3万合伙人',
  partner_50000: '5万合伙人',
  cofounder: '联合创始人',
  regional_agent: '区域合伙代理',
}

/** V2.0 默认路演方案 — 5万合伙人级别 */
export const DEFAULT_SCENARIO: PartnerGrowthScenario = {
  id: 'preset-v2-default',
  name: '标准路演方案',
  identity: 'partner_50000',
  personalInvestment: 50000,
  invitedCustomers: 12,
  conversionRate: 0.35,
  averageCustomerInvestment: 8000,
  monthlyNewCustomers: 3,
  monthlyGrowthRate: 0.08,
  projectionMonths: 12,
}

/** 备选方案：联合创始人级别 */
export const COFOUNDER_SCENARIO: PartnerGrowthScenario = {
  id: 'preset-cofounder',
  name: '联合创始人推演',
  identity: 'cofounder',
  personalInvestment: 200000,
  invitedCustomers: 30,
  conversionRate: 0.40,
  averageCustomerInvestment: 12000,
  monthlyNewCustomers: 5,
  monthlyGrowthRate: 0.12,
  projectionMonths: 24,
}

/** 备选方案：区域代理级别 */
export const AGENT_SCENARIO: PartnerGrowthScenario = {
  id: 'preset-agent',
  name: '区域代理推演',
  identity: 'regional_agent',
  personalInvestment: 500000,
  invitedCustomers: 80,
  conversionRate: 0.45,
  averageCustomerInvestment: 15000,
  monthlyNewCustomers: 8,
  monthlyGrowthRate: 0.15,
  projectionMonths: 36,
}

export const PRESET_SCENARIOS: PartnerGrowthScenario[] = [
  DEFAULT_SCENARIO,
  COFOUNDER_SCENARIO,
  AGENT_SCENARIO,
]
