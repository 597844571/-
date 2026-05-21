/**
 * V1.3 展厅级图标系统
 * 统一线性风格，与蓝紫金色调协调
 */

import { type SVGProps } from 'react'

const iconProps: SVGProps<SVGSVGElement> = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const IconAuthority = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M12 3L2 9v12h20V9L12 3z"/><path d="M9 21V12h6v9"/><path d="M4 9h16"/></svg>
)

export const IconOperators = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
)

export const IconDatacenter = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>
)

export const IconTeam = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><circle cx="9" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><path d="M4 20c0-3 2.5-5 5-5h4c2.5 0 5 2 5 5"/><path d="M14 15c2.5 0 5 2 5 5"/></svg>
)

export const IconManagement = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
)

export const IconTech = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
)

// AssetFlow icons
export const IconConsume = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
)

export const IconAsset = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
)

export const IconRelease = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
)

export const IconTrade = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
)

export const IconFlash = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
)

export const IconTransfer = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
)

export const IconCashout = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 12h.01M12 12h.01M18 12h.01"/></svg>
)

export const IconFee = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
)

export const IconBurn = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M12 2c0 0-6 4-6 10 0 3.31 2.69 6 6 6s6-2.69 6-6c0-6-6-10-6-10z"/></svg>
)

export const IconPool = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M2 12h20M2 12c0-3 3-5 5-5s5 2 5 5-3 5-5 5-5-2-5-5z"/><path d="M12 12c0-3 3-5 5-5s5 2 5 5-3 5-5 5-5-2-5-5z"/></svg>
)

// Enterprise icons
export const IconLocalLife = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
)

export const IconEcommerce = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
)

export const IconIndustrial = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/></svg>
)

export const IconAI = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/></svg>
)

export const IconDataService = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
)

export const IconRegionalOp = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
)

// Identity icons
export const IconLeader = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
)

export const IconEnterprise = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/></svg>
)

export const IconPartner = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
)

export const IconUser = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
)

export const IconMerchant = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
)

export const IconAgent = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
)

export const IconCofounder = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
)

// Archive icons
export const IconDoc = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
)

export const IconMap = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/></svg>
)

export const IconChart = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
)
