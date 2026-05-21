/**
 * 合伙权益增长推演计算引擎
 * 基于 currentScenario 参数，计算各类收益指标
 */

import type { PartnerGrowthScenario } from '../data/roadshowPreset'

export interface GrowthResult {
  // 个人基础权益
  personalInvestment: number
  productGiftValue: number
  dataAssetReward: number
  dailyReleaseMin: number
  dailyReleaseMax: number
  tradableAsset: number

  // 增长权益（12个月累计）
  referralReward: number
  teamSubsidy: number
  tierBonus: number
  teamNewContribution: number

  // 分成权益（月度）
  globalSalesShare: number
  computeIncomeShare: number
  tradeFeeShare: number
  withdrawFeeShare: number
  regionalSalesShare: number

  // 增长轨道（逐月数据）
  monthlyTrack: MonthlyData[]

  // 汇总
  totalAsset12M: number
  totalAsset36M: number
  roi12M: number
  roi36M: number
}

export interface MonthlyData {
  month: number
  newCustomers: number
  totalCustomers: number
  monthlyInvestment: number
  cumulativeInvestment: number
  dataAsset: number
  poolInjection: number
  equityShare: number
}

/** 根据身份获取基础系数 */
function getIdentityMultiplier(identity: string): number {
  const map: Record<string, number> = {
    member: 1,
    team_leader: 1.5,
    partner_10000: 2,
    partner_30000: 3,
    partner_50000: 4,
    cofounder: 6,
    regional_agent: 8,
  }
  return map[identity] ?? 1
}

/** 主计算函数 */
export function calculateGrowth(scenario: PartnerGrowthScenario): GrowthResult {
  const {
    identity,
    personalInvestment,
    invitedCustomers,
    conversionRate,
    averageCustomerInvestment,
    monthlyNewCustomers,
    monthlyGrowthRate,
    projectionMonths,
  } = scenario

  const multiplier = getIdentityMultiplier(identity)

  // === 个人基础权益 ===
  const productGiftValue = personalInvestment * 0.3 * multiplier
  const dataAssetReward = personalInvestment * 0.5 * multiplier
  const dailyReleaseMin = dataAssetReward * 0.003
  const dailyReleaseMax = dataAssetReward * 0.008
  const tradableAsset = dataAssetReward * 0.4

  // === 增长轨道（逐月计算）===
  const monthlyTrack: MonthlyData[] = []
  let totalCustomers = invitedCustomers * conversionRate
  let cumulativeInvestment = personalInvestment + invitedCustomers * conversionRate * averageCustomerInvestment

  for (let m = 1; m <= projectionMonths; m++) {
    const growthFactor = Math.pow(1 + monthlyGrowthRate, m - 1)
    const newCustomers = Math.round(monthlyNewCustomers * growthFactor)
    totalCustomers += newCustomers
    const monthlyInvestment = newCustomers * averageCustomerInvestment
    cumulativeInvestment += monthlyInvestment

    const dataAsset = monthlyInvestment * 0.5 * multiplier
    const poolInjection = dataAsset * 0.3
    const equityShare = dataAsset * 0.15 * multiplier

    monthlyTrack.push({
      month: m,
      newCustomers,
      totalCustomers: Math.round(totalCustomers),
      monthlyInvestment,
      cumulativeInvestment: Math.round(cumulativeInvestment),
      dataAsset: Math.round(dataAsset),
      poolInjection: Math.round(poolInjection),
      equityShare: Math.round(equityShare),
    })
  }

  // === 增长权益（累计）===
  const totalTeamInvestment = monthlyTrack.reduce((sum, m) => sum + m.monthlyInvestment, 0)
  const referralReward = totalTeamInvestment * 0.05 * multiplier
  const teamSubsidy = totalTeamInvestment * 0.03 * multiplier
  const tierBonus = totalTeamInvestment * 0.02 * multiplier * (projectionMonths / 12)
  const teamNewContribution = totalTeamInvestment * 0.1

  // === 分成权益（按最后一个月年化）===
  const lastMonth = monthlyTrack[monthlyTrack.length - 1]
  const globalSalesShare = lastMonth.equityShare * 0.2
  const computeIncomeShare = lastMonth.equityShare * 0.15
  const tradeFeeShare = lastMonth.equityShare * 0.1
  const withdrawFeeShare = lastMonth.equityShare * 0.05
  const regionalSalesShare = lastMonth.equityShare * 0.25

  // === 汇总 ===
  const totalAsset12M = tradableAsset + (monthlyTrack.length >= 12
    ? monthlyTrack.slice(0, 12).reduce((s, m) => s + m.equityShare, 0)
    : monthlyTrack.reduce((s, m) => s + m.equityShare, 0))
  const totalAsset36M = tradableAsset + monthlyTrack.reduce((s, m) => s + m.equityShare, 0)
  const roi12M = (totalAsset12M / personalInvestment) * 100
  const roi36M = (totalAsset36M / personalInvestment) * 100

  return {
    personalInvestment,
    productGiftValue: Math.round(productGiftValue),
    dataAssetReward: Math.round(dataAssetReward),
    dailyReleaseMin: Math.round(dailyReleaseMin),
    dailyReleaseMax: Math.round(dailyReleaseMax),
    tradableAsset: Math.round(tradableAsset),

    referralReward: Math.round(referralReward),
    teamSubsidy: Math.round(teamSubsidy),
    tierBonus: Math.round(tierBonus),
    teamNewContribution: Math.round(teamNewContribution),

    globalSalesShare: Math.round(globalSalesShare),
    computeIncomeShare: Math.round(computeIncomeShare),
    tradeFeeShare: Math.round(tradeFeeShare),
    withdrawFeeShare: Math.round(withdrawFeeShare),
    regionalSalesShare: Math.round(regionalSalesShare),

    monthlyTrack,

    totalAsset12M: Math.round(totalAsset12M),
    totalAsset36M: Math.round(totalAsset36M),
    roi12M: Math.round(roi12M * 10) / 10,
    roi36M: Math.round(roi36M * 10) / 10,
  }
}
