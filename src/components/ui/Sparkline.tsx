/** A tiny trend line for tables and lists (L-04): inline SVG, no chart library. */
export function sparklinePoints(
  values: number[],
  width: number,
  height: number,
  pad = 2,
): string {
  if (values.length === 0) return "";
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
  return values
    .map((v, i) => {
      const x = pad + i * step;
      const y = height - pad - ((v - min) / span) * (height - pad * 2);
      return `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`;
    })
    .join(" ");
}

export function Sparkline({
  values,
  label,
  width = 96,
  height = 28,
}: {
  values: number[];
  label: string;
  width?: number;
  height?: number;
}) {
  const points = sparklinePoints(values, width, height);
  const last = points.split(" ").pop()?.split(",").map(Number);
  return (
    <svg
      className="ui-sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {last && last.length === 2 && (
        <circle cx={last[0]} cy={last[1]} r={2.5} fill="currentColor" />
      )}
    </svg>
  );
}
