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

export type MonthlyRevenue = { label: string; pago: number };

function TooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div className="rounded-xl border border-white/10 bg-card px-3 py-2.5 text-xs shadow-xl">
      <p className="mb-1 text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="font-mono text-base font-bold text-foreground tabular-nums">
        {new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          maximumFractionDigits: 0,
        }).format(val)}
      </p>
    </div>
  );
}

export function RevenueAreaRealChart({ data }: { data: MonthlyRevenue[] }) {
  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Sem dados de receita ainda.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={220}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a3e635" stopOpacity={0.20} />
            <stop offset="75%" stopColor="#a3e635" stopOpacity={0.03} />
            <stop offset="100%" stopColor="#a3e635" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="rgba(255,255,255,0.05)"
        />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'inherit' }}
          dy={8}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'inherit' }}
          tickFormatter={(v) =>
            v === 0 ? '' : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
          }
          width={40}
        />
        <Tooltip content={<TooltipContent />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="pago"
          stroke="#a3e635"
          strokeWidth={2}
          fill="url(#revenueGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#a3e635', stroke: '#111827', strokeWidth: 2 }}
          name="Receita"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
