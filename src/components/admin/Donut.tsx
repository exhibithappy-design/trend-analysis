type Slice = { key: string; label: string; value: number; color: string };

export default function Donut({
  slices,
  activeKey,
  onSelect,
  size = 180,
}: {
  slices: Slice[];
  activeKey?: string | null;
  onSelect?: (k: string | null) => void;
  size?: number;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  let acc = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s) => {
        const a0 = (acc / total) * Math.PI * 2 - Math.PI / 2;
        acc += s.value;
        const a1 = (acc / total) * Math.PI * 2 - Math.PI / 2;
        const x0 = cx + Math.cos(a0) * r;
        const y0 = cy + Math.sin(a0) * r;
        const x1 = cx + Math.cos(a1) * r;
        const y1 = cy + Math.sin(a1) * r;
        const large = a1 - a0 > Math.PI ? 1 : 0;
        const path = `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
        const dim = activeKey && activeKey !== s.key;
        return (
          <path
            key={s.key}
            d={path}
            fill={s.color}
            opacity={dim ? 0.25 : 1}
            style={{ cursor: onSelect ? 'pointer' : 'default', transition: 'opacity 120ms' }}
            onClick={() => onSelect && onSelect(activeKey === s.key ? null : s.key)}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.58} fill="#141414" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fill="#555" style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sessions</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="18" fill="#fff" fontWeight={700}>{total.toLocaleString()}</text>
    </svg>
  );
}
