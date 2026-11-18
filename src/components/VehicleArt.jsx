import { useId } from 'react';

/**
 * Ilustrações vetoriais das categorias (vista lateral, voltadas para a esquerda),
 * no espírito das imagens de veículos exibidas na escolha da viagem.
 */
const TONES = {
  light: { body: '#F5F5F5', shade: '#D9D9D9', stroke: '#CACACA', glass: '#363B42', rim: '#CFCFCF' },
  silver: { body: '#C7CBD0', shade: '#A3A8AE', stroke: '#A0A5AB', glass: '#2D3239', rim: '#E4E4E4' },
  gray: { body: '#6B7077', shade: '#4F535A', stroke: '#4F535A', glass: '#1F2328', rim: '#D3D3D3' },
  black: { body: '#1B1B1B', shade: '#070707', stroke: '#000000', glass: '#46505B', rim: '#A9AEB3' },
  red: { body: '#B3261E', shade: '#86170F', stroke: '#7A150E', glass: '#2A2A2A', rim: '#D3D3D3' },
};

const SHAPES = {
  hatch: {
    body: 'M16 58C12 58 11 55 11 52V45C11 40 13 37 18 35.5L28 33C36 26.5 46 23.5 58 23.5H92C102 23.5 110 28 118 35L142 38.5C149 39.5 152 43 152 48V54C152 57 150 58 147 58Z',
    windows: ['M34 35.5C40 30 48 27 58 27H79V35.5Z', 'M83 27H92C99.5 27 106 30.5 111.5 35.5H83Z'],
    wheels: [38, 126],
    radius: 11,
    door: 81,
    head: 'M144 40.5L151.5 42.5V46L144 45Z',
    tail: 'M11.5 41L17 39.5V44.5L11.5 45.5Z',
    mirror: 'M109 34h5.5l1.5 4h-7Z',
  },
  sedan: {
    body: 'M14 58C10 58 9 55 9 52V46C9 42 12 40 16 39L38 36C46 28 56 22 70 21H98C108 21 116 27 124 35L144 38C150 39 153 43 153 48V54C153 57 151 58 148 58Z',
    windows: ['M45 36C51 29.5 59 25.5 70 25.5H85V36Z', 'M89 25.5H97C105 25.5 112 29.5 118 36H89Z'],
    wheels: [40, 128],
    radius: 11,
    door: 87,
    head: 'M146 40.5 152.5 42.5V46L145 45Z',
    tail: 'M9.5 43 16 41.5V45.5L9.5 46.5Z',
    mirror: 'M114 33.5h5.5l1.5 4h-7Z',
  },
  suv: {
    body: 'M14 58C10 58 9 55 9 52V40C9 34 11 30 15 28L22 16C24 13 27 12 31 12H96C104 12 110 16 116 22L126 31L144 35C150 36 153 40 153 46V54C153 57 151 58 148 58Z',
    windows: ['M27 29 32 17H62V29Z', 'M66 17H95C101 17 106 20 110 24L115 29H66Z'],
    wheels: [38, 128],
    radius: 12,
    door: 64,
    head: 'M146 37.5 152.5 40V44L145 43Z',
    tail: 'M9.5 33 14 31.5V39L9.5 40Z',
    mirror: 'M112 27h5.5l1.5 4h-7Z',
  },
};

function Wheel({ cx, cy = 58, r, rim }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#1B1B1B" />
      <circle cx={cx} cy={cy} r={r * 0.58} fill={rim} />
      <circle cx={cx} cy={cy} r={r * 0.2} fill="#5A5A5A" />
    </g>
  );
}

function Car({ shape, tone, clipId }) {
  const s = SHAPES[shape];
  const t = TONES[tone];
  return (
    <g transform="translate(162 0) scale(-1 1)">
      <defs>
        <clipPath id={clipId}>
          <path d={s.body} />
        </clipPath>
      </defs>
      <path d={s.body} fill={t.body} stroke={t.stroke} strokeWidth="1" />
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="47" width="162" height="12" fill={t.shade} opacity="0.55" />
        {s.wheels.map((x) => (
          <circle key={x} cx={x} cy="58" r={s.radius + 3} fill="#111" />
        ))}
        <path d="M18 39.5H150" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.2" />
      </g>
      {s.windows.map((d) => (
        <path key={d} d={d} fill={t.glass} />
      ))}
      <path d={`M${s.door} 37.5V55`} stroke="#000" strokeOpacity="0.18" strokeWidth="1" />
      <rect x={s.door + 5} y="41" width="7" height="2" rx="1" fill="#000" opacity="0.22" />
      <rect x={s.door - 22} y="41" width="7" height="2" rx="1" fill="#000" opacity="0.22" />
      <path d={s.mirror} fill={t.body} stroke={t.stroke} strokeWidth="0.8" />
      <path d={s.head} fill="#F2F2F2" stroke="#9A9A9A" strokeWidth="0.6" />
      <path d={s.tail} fill="#B3261E" />
      {s.wheels.map((x) => (
        <Wheel key={x} cx={x} r={s.radius} rim={t.rim} />
      ))}
    </g>
  );
}

function Moto({ tone }) {
  const t = TONES[tone];
  return (
    <g transform="translate(162 0) scale(-1 1)">
      <path d="M40 57 70 50" stroke="#2A2A2A" strokeWidth="5" strokeLinecap="round" />
      <path d="M123 57 108 25" stroke="#3A3A3A" strokeWidth="5" strokeLinecap="round" />
      <rect x="62" y="43" width="25" height="15" rx="3" fill="#3A3A3A" />
      <path d="M48 54H80" stroke="#9B9B9B" strokeWidth="4" strokeLinecap="round" />
      <path d="M30 44C36 37 46 36 53 39L47 43Z" fill={t.body} />
      <path d="M57 42C61 34 72 30 84 31L104 33L108 40L96 46H66Z" fill={t.body} stroke={t.stroke} strokeWidth="0.8" />
      <path d="M44 40C50 34.5 61 33.5 71 35.5L69 41H46Z" fill="#141414" />
      <path d="M99 23 113 26" stroke="#1F1F1F" strokeWidth="3" strokeLinecap="round" />
      <circle cx="111" cy="33" r="4.2" fill="#F2F2F2" stroke="#9A9A9A" strokeWidth="0.8" />
      <Wheel cx={41} cy={57} r={13} rim={t.rim} />
      <Wheel cx={123} cy={57} r={13} rim={t.rim} />
    </g>
  );
}

function Box() {
  return (
    <g>
      <rect x="112" y="42" width="36" height="28" rx="2" fill="#C9A27A" stroke="#A7825B" strokeWidth="1" />
      <rect x="126" y="42" width="8" height="28" fill="#B48C5E" />
      <path d="M117 62h7" stroke="#8C6A45" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

export default function VehicleArt({ kind = 'hatch', tone, width = 96, className = '' }) {
  const clipId = `vclip${useId().replace(/:/g, '')}`;
  const resolvedTone = tone ?? (kind === 'moto' ? 'red' : 'light');
  return (
    <svg
      viewBox="0 0 162 76"
      width={width}
      height={(width * 76) / 162}
      className={`vehicle-art ${className}`}
      aria-hidden="true"
    >
      <ellipse cx="81" cy="70" rx="66" ry="4" fill="#000" opacity="0.12" />
      {kind === 'moto' && <Moto tone={resolvedTone} />}
      {kind === 'flash' && (
        <>
          <Car shape="hatch" tone={resolvedTone} clipId={clipId} />
          <Box />
        </>
      )}
      {SHAPES[kind] && <Car shape={kind} tone={resolvedTone} clipId={clipId} />}
    </svg>
  );
}
