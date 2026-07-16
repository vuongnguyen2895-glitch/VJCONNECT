import { useId } from "react";

interface LogoMarkProps {
  className?: string;
}

/**
 * Recreated vector approximation of the VJConnect mark (folded-corner card + "vj" monogram).
 * Not traced from the original source file — swap for the real asset when available.
 */
export function LogoMark({ className = "h-9 w-7" }: LogoMarkProps) {
  const gradientId = `vjc-logo-gradient-${useId()}`;

  return (
    <svg viewBox="0 0 200 280" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M24,0 L144,0 L200,56 L200,256 Q200,280 176,280 L24,280 Q0,280 0,256 L0,24 Q0,0 24,0 Z"
        fill={`url(#${gradientId})`}
      />
      <text
        x="100"
        y="185"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="118"
        fill="#EDE6E8"
      >
        vj
      </text>
      <circle cx="146" cy="76" r="13" fill="#EDE6E8" />
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="200" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6B3364" />
          <stop offset="1" stopColor="#4A2244" />
        </linearGradient>
      </defs>
    </svg>
  );
}

interface LogoProps {
  markClassName?: string;
  textClassName?: string;
}

export default function Logo({ markClassName = "h-9 w-7", textClassName = "text-lg" }: LogoProps) {
  return (
    <span className="flex items-center gap-2">
      <LogoMark className={markClassName} />
      <span className={`font-extrabold tracking-tight text-slate-900 ${textClassName}`}>VJConnect</span>
    </span>
  );
}
