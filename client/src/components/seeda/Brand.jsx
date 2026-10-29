import React from 'react';

/** Official SEEDA logo */
export function Logo({ variant = 'color', className = '', height = 32 }) {
  const src = variant === 'white' 
    ? '/brand/seeda-logo-white.svg' 
    : variant === 'dark' 
      ? '/brand/seeda-logo-dark.svg' 
      : '/brand/seeda-logo.svg';
  return (
    <img 
      src={src} 
      alt="SEEDA سيدا" 
      height={height} 
      style={{ height, width: 'auto' }} 
      className={`select-none ${className}`} 
      draggable={false} 
    />
  );
}

export function LogoMark({ variant = 'color', size = 32, className = '' }) {
  const src = variant === 'white' ? '/brand/seeda-mark-white.svg' : '/brand/seeda-mark.svg';
  return (
    <img 
      src={src} 
      alt="SEEDA" 
      style={{ height: size, width: 'auto' }} 
      className={className} 
      draggable={false} 
    />
  );
}

const COLOR_MAP = {
  black: '#1E1E24', 'أسود': '#1E1E24',
  white: '#E9EAEE', 'أبيض': '#E9EAEE',
  silver: '#B5B9C2', 'فضي': '#B5B9C2',
  gray: '#6C717E', grey: '#6C717E', 'رمادي': '#6C717E',
  blue: '#2E4C8C', 'أزرق': '#2E4C8C',
  red: '#A3262F', 'أحمر': '#A3262F',
  navy: '#22305C', 'كحلي': '#22305C',
  green: '#2F5D49',
  beige: '#CDBB9B',
};

/** Vehicle side-profile illustration tinted to the order's colour */
export function VehicleArt({ color, className = '', kind = 'suv' }) {
  const fill = COLOR_MAP[(color || '').toLowerCase().trim()] || '#3A3F4E';
  const light = ['#E9EAEE', '#B5B9C2', '#CDBB9B'].includes(fill);
  const body = kind === 'suv'
    ? 'M14 66 C 14 56 20 52 30 50 L 52 47 C 62 36 74 28 92 26 L 150 25 C 166 25 178 32 190 44 L 214 48 C 226 50 232 56 232 64 L 232 72 C 232 76 229 78 225 78 L 20 78 C 16 78 14 75 14 72 Z'
    : 'M12 68 C 12 60 18 56 28 54 L 58 50 C 72 38 90 32 112 32 L 146 32 C 164 32 178 40 192 50 L 216 54 C 226 56 232 61 232 67 L 232 72 C 232 76 229 78 225 78 L 18 78 C 14 78 12 75 12 72 Z';

  return (
    <div className={`relative grid place-items-center overflow-hidden bg-gradient-to-br from-[#EEF0F5] to-[#DADDE6] ${className}`} aria-hidden>
      <svg viewBox="0 0 246 100" className="w-[88%]">
        <ellipse cx="123" cy="86" rx="108" ry="7" fill="#000" opacity=".16" />
        <path d={body} fill={fill} />
        <path 
          d={kind === 'suv' ? 'M60 47 C 70 37 80 32 94 31 L 120 31 L 120 48 Z M126 31 L 150 31 C 162 31 172 36 182 46 L 126 48 Z' : 'M66 50 C 78 40 92 36 110 36 L 120 36 L 120 51 Z M126 36 L 146 36 C 160 36 170 42 180 50 L 126 51 Z'} 
          fill={light ? '#2A2F3B' : '#9FB3CF'} 
          opacity={light ? 0.85 : 0.55} 
        />
        <path d="M20 60 L 228 60" stroke="#fff" strokeOpacity={light ? 0.6 : 0.18} strokeWidth="1.2" />
        <rect x="216" y="56" width="12" height="4" rx="2" fill="#FFF3C9" opacity=".9" />
        <rect x="16" y="58" width="8" height="4" rx="2" fill="#E2434F" opacity=".85" />
        {[62, 186].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="78" r="15" fill="#15171D" />
            <circle cx={cx} cy="78" r="8.5" fill="#8A8F9C" />
            <circle cx={cx} cy="78" r="3" fill="#2A2D36" />
          </g>
        ))}
      </svg>
    </div>
  );
}

export function VehicleThumb({ color, className = '' }) {
  return <VehicleArt color={color} className={className} />;
}

