'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Point = { label: string; receita: number; meta: number };

const data: Point[] = [
  { label: 'Jan', receita: 82, meta: 70 },
  { label: 'Fev', receita: 91, meta: 75 },
  { label: 'Mar', receita: 88, meta: 80 },
  { label: 'Abr', receita: 105, meta: 85 },
  { label: 'Mai', receita: 117, meta: 90 },
  { label: 'Jun', receita: 124, meta: 95 },
  { label: 'Jul', receita: 142, meta: 100 },
  { label: 'Ago', receita: 138, meta: 105 },
  { label: 'Set', receita: 156, meta: 110 },
  { label: 'Out', receita: 171, meta: 115 },
  { label: 'Nov', receita: 189, meta: 120 },
  { label: 'Dez', receita: 211, meta: 125 },
];

function TooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-[var(--shadow-lg)]">
      <p className="mb-1.5 font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="capitalize text-muted-foreground">{entry.name}</span>
          <span className="ml-auto font-semibold tabular-nums text-foreground">
            R$ {entry.value}k
          </span>
        </div>
      ))}
    </div>
  );
}

export function RevenueAreaChart() {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={180}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="fillReceita" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          dy={8}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          tickFormatter={(v) => `${v}k`}
          width={44}
        />
        <Tooltip content={<TooltipContent />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="meta"
          stroke="var(--muted-foreground)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          fill="none"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="receita"
          stroke="var(--chart-1)"
          strokeWidth={2.5}
          fill="url(#fillReceita)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
