'use client';

import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  CheckSquare,
  Clock,
  TrendingUp,
  Layers,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Sparkline } from './sparkline';

type Tone = 'lime' | 'sky' | 'violet' | 'amber' | 'rose' | 'teal';

const TONES: Record<Tone, { hex: string; bg: string; text: string }> = {
  lime:   { hex: '#d97706', bg: 'bg-amber-100 dark:bg-amber-500/10',   text: 'text-amber-700 dark:text-amber-400' },
  sky:    { hex: '#0ea5e9', bg: 'bg-sky-100 dark:bg-sky-500/10',       text: 'text-sky-700 dark:text-sky-400' },
  violet: { hex: '#8b5cf6', bg: 'bg-violet-100 dark:bg-violet-500/10', text: 'text-violet-700 dark:text-violet-400' },
  amber:  { hex: '#f59e0b', bg: 'bg-amber-100 dark:bg-amber-500/10',   text: 'text-amber-700 dark:text-amber-400' },
  rose:   { hex: '#f43f5e', bg: 'bg-rose-100 dark:bg-rose-500/10',     text: 'text-rose-700 dark:text-rose-400' },
  teal:   { hex: '#14b8a6', bg: 'bg-teal-100 dark:bg-teal-500/10',     text: 'text-teal-700 dark:text-teal-400' },
};

const ICON_MAP: Record<string, LucideIcon> = {
  DollarSign, Users, CheckSquare, Clock, TrendingUp, Layers,
};

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
  hint?: string;
  iconName: string;
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
  iconName,
  tone = 'lime',
  sparkData,
  delay = 0,
}: MetricCardProps) {
  const t = TONES[tone];
  const isUp = trend === 'up';
  const isDown = trend === 'down';
  const Icon = ICON_MAP[iconName] ?? DollarSign;

  return (
    <div
      className="flex flex-col bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Header row: label + trend badge */}
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
          {label}
        </p>
        <div className={['flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', t.bg].join(' ')}>
          <Icon className={['h-4 w-4', t.text].join(' ')} />
        </div>
      </div>

      {/* Value + delta */}
      <div className="flex items-end gap-2 mb-1">
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 tabular-nums leading-none">
          {value}
        </p>
        {delta && (
          <span className={[
            'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums mb-0.5',
            isUp   ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' :
            isDown ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400' :
                     'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
          ].join(' ')}>
            {isUp && <ArrowUpRight className="h-2.5 w-2.5" />}
            {isDown && <ArrowDownRight className="h-2.5 w-2.5" />}
            {delta}
          </span>
        )}
      </div>

      {hint && (
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{hint}</p>
      )}

      {/* Sparkline */}
      {sparkData && sparkData.length > 1 && (
        <div className="mt-3 h-9 w-full opacity-70">
          <Sparkline data={sparkData} color={t.hex} id={`metric-${tone}-${label}`} />
        </div>
      )}
    </div>
  );
}
