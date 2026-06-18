import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  accentColor?: 'green' | 'pink' | 'purple' | 'orange';
}

const accentStyles: Record<NonNullable<StatCardProps['accentColor']>, { icon: string; bg: string }> = {
  green:  { icon: 'text-primary', bg: 'bg-primary/10' },
  pink:   { icon: 'text-[#ec4899]', bg: 'bg-[#ec4899]/10' },
  purple: { icon: 'text-[var(--chart-3)]', bg: 'bg-[var(--chart-3)]/10' },
  orange: { icon: 'text-[var(--chart-4)]', bg: 'bg-[var(--chart-4)]/10' },
};

export function StatCard({ title, value, description, icon: Icon, trend, accentColor = 'green' }: StatCardProps) {
  const accent = accentStyles[accentColor];

  return (
    <div className="surface surface-hover group flex flex-col gap-3 rounded-xl p-4 lg:gap-4 lg:p-5">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{title}</span>
        <div className={['flex h-8 w-8 items-center justify-center rounded-lg lg:h-9 lg:w-9', accent.bg].join(' ')}>
          <Icon className={['h-3.5 w-3.5 lg:h-4 lg:w-4', accent.icon].join(' ')} />
        </div>
      </div>

      <div>
        <div className="font-mono text-xl font-semibold tracking-tight tabular-nums text-foreground lg:text-2xl">{value}</div>
        {(description || trend) && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {trend && (
              <span className={trend.isPositive ? 'font-medium text-primary' : 'font-medium text-destructive'}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
