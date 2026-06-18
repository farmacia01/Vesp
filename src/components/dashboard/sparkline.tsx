'use client';

import { Area, AreaChart, ResponsiveContainer } from 'recharts';

export function Sparkline({
  data,
  color = 'var(--chart-1)',
  id = 'spark',
}: {
  data: number[];
  color?: string;
  id?: string;
}) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={64}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          fill={`url(#spark-${id})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
