import { useId } from 'react';

/** Retrato ilustrado (sem fotos reais) usado para passageira e motoristas. */
export default function Avatar({ person, size = 48, className = '' }) {
  const id = `av${useId().replace(/:/g, '')}`;
  const { skin = '#C68E63', hair = '#1F1712', shirt = '#333', long = false } = person ?? {};
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={`avatar ${className}`} aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="64" height="64" fill="#E2E2E2" />
        {long && <path d="M17 30C15 16 23 9 32 9s17 7 15 21l2 20H15Z" fill={hair} />}
        <path d="M8 66C10 51 20 45 32 45s22 6 24 21Z" fill={shirt} />
        <rect x="27" y="36" width="10" height="11" rx="4" fill={skin} />
        <ellipse cx="32" cy="28" rx="11" ry="13" fill={skin} />
        <path d="M20.5 27C19.5 16 25.5 11.5 32 11.5c7.5 0 13 5 11.5 15.5-1.6-5.5-6-8-11.5-8-5.2 0-9.6 2.6-11.5 8Z" fill={hair} />
      </g>
    </svg>
  );
}
