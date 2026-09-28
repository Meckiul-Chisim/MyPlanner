import type { SVGProps } from 'react'

export function MyPlannerLogo({
  size = 42,
  className = '',
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
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
        <linearGradient id="myplannerLogoGradient" x1="8" y1="54" x2="56" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4FBF93" />
          <stop offset=".52" stopColor="#8CE0B6" />
          <stop offset="1" stopColor="#B9A6FF" />
        </linearGradient>
        <filter id="myplannerLogoGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <path
        d="M32 5C18.745 5 8 15.745 8 29v6c0 13.255 10.745 24 24 24s24-10.745 24-24v-6C56 15.745 45.255 5 32 5Z"
        fill="url(#myplannerLogoGradient)"
        opacity=".13"
      />
      <path
        d="M15 44V23.5c0-2.5 3.2-3.35 4.4-1.2L28 37l8.8-14.7c1.2-2.05 4.4-1.2 4.4 1.2V44"
        stroke="url(#myplannerLogoGradient)"
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#myplannerLogoGlow)"
      />
      <path
        d="M35.5 20.5c1.2-6.2 5.3-10 11.8-10-1.2 5.9-4.8 9.9-11.8 10Z"
        fill="url(#myplannerLogoGradient)"
      />
      <path
        d="M36 20c2.8-2.1 5.8-4.5 9-6.9"
        stroke="#DDF9E9"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity=".9"
      />
      <path d="M49 18v6M46 21h6" stroke="#DDF9E9" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="18" cy="17" r="2.2" fill="#B9A6FF" opacity=".9" />
    </svg>
  )
}
