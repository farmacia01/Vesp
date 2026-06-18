'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { month: 'Jan', receita: 2100 },
  { month: 'Fev', receita: 2800 },
  { month: 'Mar', receita: 2200 },
  { month: 'Abr', receita: 3500 },
  { month: 'Mai', receita: 3100 },
  { month: 'Jun', receita: 4200 },
  { month: 'Jul', receita: 3800 },
  { month: 'Ago', receita: 4800 },
  { month: 'Set', receita: 4200 },
  { month: 'Out', receita: 5100 },
  { month: 'Nov', receita: 4600 },
  { month: 'Dez', receita: 5800 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground mt-0.5">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function RevenueAreaChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#199349" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#199349" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: '#6B9970', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fill: '#6B9970', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(25,147,73,0.2)', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="receita"
          stroke="#199349"
          strokeWidth={2}
          fill="url(#revenueGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#199349', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
