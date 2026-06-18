type StatusCounts = {
  doing: number;
  review: number;
  todo: number;
  backlog: number;
  done: number;
};

function DonutRing({
  value,
  total,
  color,
  label,
  count,
}: {
  value: number;
  total: number;
  color: string;
  label: string;
  count: number;
}) {
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const pct = total > 0 ? value / total : 0;
  const dash = pct * circumference;

  return (
    <div className="flex flex-col items-center gap-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-all duration-200 hover:-translate-y-0.5">
      <div className="relative flex h-[88px] w-[88px] items-center justify-center">
        <svg className="-rotate-90" width="88" height="88" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" className="dark:[stroke:#374151]" />
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xl font-bold text-gray-800 dark:text-gray-100 tabular-nums">{count}</span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">{Math.round(pct * 100)}%</span>
        </div>
      </div>
      <p className="text-xs font-medium text-gray-600 dark:text-gray-300 text-center">{label}</p>
    </div>
  );
}

export function StatusOverview({ counts }: { counts: StatusCounts }) {
  const total = counts.doing + counts.review + counts.todo + counts.backlog + counts.done;

  const sections = [
    { label: 'Em Produção',       value: counts.doing,                  color: '#d97706' },
    { label: 'Aguard. Aprovação', value: counts.review,                 color: '#f59e0b' },
    { label: 'A Fazer',           value: counts.todo + counts.backlog,  color: '#0ea5e9' },
    { label: 'Finalizados',       value: counts.done,                   color: '#8b5cf6' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {sections.map((s) => (
        <DonutRing
          key={s.label}
          value={s.value}
          total={total}
          color={s.color}
          label={s.label}
          count={s.value}
        />
      ))}
    </div>
  );
}
