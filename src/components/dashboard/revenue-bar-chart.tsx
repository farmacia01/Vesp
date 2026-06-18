'use client';

import {
  Bar,
  BarChart,
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
  payload?: Array<{ name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-[var(--shadow-lg)]">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      <p className="tabular-nums text-primary font-semibold">
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val)}
      </p>
    </div>
  );
}

export function RevenueBarChart({ data }: { data: MonthlyRevenue[] }) {
  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Sem dados de receita ainda.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={180}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barSize={24}>
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
          tickFormatter={(v) =>
            v >= 1000
              ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`
              : String(v)
          }
          width={48}
        />
        <Tooltip content={<TooltipContent />} cursor={{ fill: 'var(--muted)', opacity: 0.5 }} />
        <Bar
          dataKey="pago"
          fill="var(--chart-1)"
          radius={[4, 4, 0, 0]}
          name="Receita Paga"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
