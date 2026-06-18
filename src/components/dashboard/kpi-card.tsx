'use client';

import {
  ArrowDownRight,
  ArrowUpRight,
  Users,
  CalendarCheck,
  Clock,
  MessageSquare,
} from 'lucide-react';

export type KpiTone = 'primary' | 'sky' | 'violet' | 'amber';

const toneMap: Record<KpiTone, { icon: string; bg: string }> = {
  primary: { icon: 'text-primary', bg: 'bg-primary/10' },
  sky: { icon: 'text-[var(--chart-2)]', bg: 'bg-[var(--chart-2)]/10' },
  violet: { icon: 'text-[var(--chart-3)]', bg: 'bg-[var(--chart-3)]/10' },
  amber: { icon: 'text-[var(--chart-4)]', bg: 'bg-[var(--chart-4)]/10' },
};

const iconMap = {
  users: Users,
  calendar: CalendarCheck,
  clock: Clock,
  message: MessageSquare,
} as const;

export type KpiIcon = keyof typeof iconMap;

export function KpiCard({
  label,
  value,
  delta,
  trend,
  hint,
  icon,
  tone = 'primary',
  delay = 0,
}: {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
  hint?: string;
  icon: KpiIcon;
  tone?: KpiTone;
  delay?: number;
}) {
  const IconComponent = iconMap[icon];
  const t = toneMap[tone];
  const up = trend === 'up';

  return (
    <div
      className="surface surface-hover animate-in-up rounded-xl p-5 transition-transform hover:-translate-y-0.5"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.bg}`}>
          <IconComponent className={`h-[18px] w-[18px] ${t.icon}`} />
        </span>
        <span
          className={[
            'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
            up ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive',
          ].join(' ')}
        >
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {delta}
        </span>
      </div>
      <p className="mt-4 text-[13px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
