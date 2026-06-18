'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface SalesDonutChartProps {
  percentage?: number;
  label?: string;
}

export function SalesDonutChart({ percentage = 72, label = 'Meta atingida' }: SalesDonutChartProps) {
  const data = [
    { value: percentage },
    { value: 100 - percentage },
  ];

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={62}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill="#199349" />
            <Cell fill="rgba(255,255,255,0.05)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-foreground tabular-nums">{percentage}%</span>
        <span className="text-[9px] text-muted-foreground text-center leading-tight mt-0.5">{label}</span>
      </div>
    </div>
  );
}
