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
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-xs shadow-lg">
      <p className="mb-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-mono text-base font-bold text-gray-800 dark:text-gray-100 tabular-nums">
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
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Sem dados de receita ainda.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary, #d97706)" stopOpacity={0.18} />
            <stop offset="100%" stopColor="var(--color-primary, #d97706)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="var(--color-border, #e2e8f0)"
        />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--color-muted-foreground, #64748b)', fontSize: 11, fontFamily: 'inherit' }}
          dy={8}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--color-muted-foreground, #64748b)', fontSize: 11, fontFamily: 'inherit' }}
          tickFormatter={(v) =>
            v === 0 ? '' : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
          }
          width={40}
        />
        <Tooltip
          content={<TooltipContent />}
          cursor={{ stroke: 'var(--color-border, #e2e8f0)', strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="pago"
          stroke="var(--color-primary, #d97706)"
          strokeWidth={2}
          fill="url(#revenueGrad)"
          dot={false}
          activeDot={{ r: 4, fill: 'var(--color-primary, #d97706)', stroke: '#fff', strokeWidth: 2 }}
          name="Receita"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
