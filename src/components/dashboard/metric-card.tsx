'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Sparkline } from './sparkline';

type Tone = 'lime' | 'sky' | 'violet' | 'amber' | 'rose' | 'teal';

const TONES: Record<Tone, { hex: string; bg: string; deltaUp: string; deltaDown: string }> = {
  lime:   { hex: '#a3e635', bg: 'rgba(163,230,53,0.10)',   deltaUp: 'bg-lime-500/10 text-lime-400',   deltaDown: 'bg-red-500/10 text-red-400' },
  sky:    { hex: '#38bdf8', bg: 'rgba(56,189,248,0.10)',   deltaUp: 'bg-sky-500/10 text-sky-400',     deltaDown: 'bg-red-500/10 text-red-400' },
  violet: { hex: '#a78bfa', bg: 'rgba(167,139,250,0.10)',  deltaUp: 'bg-violet-500/10 text-violet-400', deltaDown: 'bg-red-500/10 text-red-400' },
  amber:  { hex: '#fbbf24', bg: 'rgba(251,191,36,0.10)',   deltaUp: 'bg-amber-500/10 text-amber-400', deltaDown: 'bg-red-500/10 text-red-400' },
  rose:   { hex: '#fb7185', bg: 'rgba(251,113,133,0.10)',  deltaUp: 'bg-rose-500/10 text-rose-400',   deltaDown: 'bg-red-500/10 text-red-400' },
  teal:   { hex: '#2dd4bf', bg: 'rgba(45,212,191,0.10)',   deltaUp: 'bg-teal-500/10 text-teal-400',   deltaDown: 'bg-red-500/10 text-red-400' },
};

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
  hint?: string;
  icon: LucideIcon;
  tone?: Tone;
  sparkData?: number[];
  delay?: number;
}

export function MetricCard({
  label,
  value,
  delta,
  trend = 'neutral',
  hint,
  icon: Icon,
  tone = 'lime',
  sparkData,
  delay = 0,
}: MetricCardProps) {
  const t = TONES[tone];
  const isUp = trend === 'up';
  const isDown = trend === 'down';

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: t.bg }}
        >
          <Icon className="h-4 w-4" style={{ color: t.hex }} />
        </div>

        {delta && (
          <span
            className={[
              'inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
              isUp ? t.deltaUp : isDown ? t.deltaDown : 'bg-muted text-muted-foreground',
            ].join(' ')}
          >
            {isUp && <ArrowUpRight className="h-2.5 w-2.5" />}
            {isDown && <ArrowDownRight className="h-2.5 w-2.5" />}
            {delta}
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="font-mono text-[22px] font-bold tracking-tight text-foreground tabular-nums leading-none">
          {value}
        </p>
        <p className="mt-1 text-[12px] font-medium text-muted-foreground">{label}</p>
        {hint && <p className="mt-0.5 text-[11px] text-muted-foreground/60 truncate">{hint}</p>}
      </div>

      {sparkData && sparkData.length > 1 && (
        <div className="mt-3 h-9 w-full opacity-50 group-hover:opacity-80 transition-opacity duration-200">
          <Sparkline data={sparkData} color={t.hex} id={`metric-${tone}-${label}`} />
        </div>
      )}
    </div>
  );
}
