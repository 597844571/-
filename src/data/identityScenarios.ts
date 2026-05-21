/**
 * 每个身份的默认路演参数
 * 点击身份阶梯时自动加载，无需手动输入
 */

import type { PartnerGrowthScenario, PartnerIdentity } from './roadshowPreset'

export const IDENTITY_SCENARIOS: Record<PartnerIdentity, PartnerGrowthScenario> = {
  member: {
    id: 'auto-member',
    name: '普通会员方案',
    identity: 'member',
    personalInvestment: 30000,
    invitedCustomers: 5,
    conversionRate: 0.25,
    averageCustomerInvestment: 10000,
    monthlyNewCustomers: 1,
    monthlyGrowthRate: 0.05,
    projectionMonths: 12,
  },
  team_leader: {
    id: 'auto-teamleader',
    name: '团队长方案',
    identity: 'team_leader',
    personalInvestment: 80000,
    invitedCustomers: 12,
    conversionRate: 0.3,
    averageCustomerInvestment: 20000,
    monthlyNewCustomers: 2,
    monthlyGrowthRate: 0.08,
    projectionMonths: 12,
  },
  partner_10000: {
    id: 'auto-partner10k',
    name: '1万合伙人方案',
    identity: 'partner_10000',
    personalInvestment: 100000,
    invitedCustomers: 15,
    conversionRate: 0.35,
    averageCustomerInvestment: 25000,
    monthlyNewCustomers: 2,
    monthlyGrowthRate: 0.1,
    projectionMonths: 24,
  },
  partner_30000: {
    id: 'auto-partner30k',
    name: '3万合伙人方案',
    identity: 'partner_30000',
    personalInvestment: 300000,
    invitedCustomers: 30,
    conversionRate: 0.4,
    averageCustomerInvestment: 35000,
    monthlyNewCustomers: 3,
    monthlyGrowthRate: 0.12,
    projectionMonths: 24,
  },
  partner_50000: {
    id: 'auto-partner50k',
    name: '5万合伙人方案',
    identity: 'partner_50000',
    personalInvestment: 500000,
    invitedCustomers: 50,
    conversionRate: 0.45,
    averageCustomerInvestment: 50000,
    monthlyNewCustomers: 5,
    monthlyGrowthRate: 0.15,
    projectionMonths: 36,
  },
  cofounder: {
    id: 'auto-cofounder',
    name: '联合创始人方案',
    identity: 'cofounder',
    personalInvestment: 500000,
    invitedCustomers: 100,
    conversionRate: 0.5,
    averageCustomerInvestment: 80000,
    monthlyNewCustomers: 8,
    monthlyGrowthRate: 0.18,
    projectionMonths: 36,
  },
  regional_agent: {
    id: 'auto-agent',
    name: '区域代理方案',
    identity: 'regional_agent',
    personalInvestment: 1000000,
    invitedCustomers: 200,
    conversionRate: 0.55,
    averageCustomerInvestment: 100000,
    monthlyNewCustomers: 10,
    monthlyGrowthRate: 0.2,
    projectionMonths: 36,
  },
}

/** 获取身份的默认方案 */
export function getScenarioByIdentity(identity: PartnerIdentity): PartnerGrowthScenario {
  return IDENTITY_SCENARIOS[identity]
}
