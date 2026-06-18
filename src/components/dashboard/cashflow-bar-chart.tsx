'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { name: 'Seg', income: 4000, expense: 2400 },
  { name: 'Ter', income: 3000, expense: 1398 },
  { name: 'Qua', income: 2000, expense: 9800 },
  { name: 'Qui', income: 2780, expense: 3908 },
  { name: 'Sex', income: 1890, expense: 4800 },
  { name: 'Sáb', income: 2390, expense: 3800 },
  { name: 'Dom', income: 3490, expense: 4300 },
];

export function CashflowBarChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
        barSize={12}
        barGap={4}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#8B8E98', fontSize: 11 }}
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#8B8E98', fontSize: 11 }}
          tickFormatter={(value) => `$${value/1000}k`}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.02)' }}
          contentStyle={{ backgroundColor: '#1E2025', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
          itemStyle={{ fontSize: '12px', fontWeight: 600 }}
          labelStyle={{ fontSize: '11px', color: '#8B8E98', marginBottom: '4px' }}
        />
        <Bar dataKey="income" fill="#B0FF29" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" fill="#2C2F36" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
