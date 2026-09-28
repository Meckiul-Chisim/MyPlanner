import type { SVGProps } from 'react'

export function MyPlannerLogo({ size = 42, className = '', ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label="MyPlanner logo"
      {...props}
    >
      <defs>
        <linearGradient id="myplannerLogoGradient" x1="8" y1="8" x2="56" y2="56">
          <stop stopColor="#72AD8D" />
          <stop offset=".55" stopColor="#5D9678" />
          <stop offset="1" stopColor="#A99AD6" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#myplannerLogoGradient)" />
      <path
        d="M18 39V25c0-2.2 3.1-3.1 4.4-1.1L30 34l7.6-10.1C38.9 22 42 22.8 42 25v14"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M47 17h4M49 15v4" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity=".9" />
      <circle cx="49" cy="47" r="3" fill="white" opacity=".9" />
    </svg>
  )
}
