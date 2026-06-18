import { Image, Film, Radio, Palette, Video } from 'lucide-react';

type ProductionItem = {
  label: string;
  done: number;
  goal: number;
  icon: typeof Image;
  color: string;
  bg: string;
};

export function ProductionProgress({
  posts,
  reels,
  stories,
}: {
  posts: { done: number; goal: number };
  reels: { done: number; goal: number };
  stories: { done: number; goal: number };
}) {
  const items: ProductionItem[] = [
    { label: 'Posts', done: posts.done, goal: posts.goal, icon: Image, color: '#a3e635', bg: 'rgba(163,230,53,0.10)' },
    { label: 'Reels', done: reels.done, goal: reels.goal, icon: Film, color: '#38bdf8', bg: 'rgba(56,189,248,0.10)' },
    { label: 'Stories', done: stories.done, goal: stories.goal, icon: Radio, color: '#a78bfa', bg: 'rgba(167,139,250,0.10)' },
    { label: 'Artes', done: 0, goal: 0, icon: Palette, color: '#fbbf24', bg: 'rgba(251,191,36,0.10)' },
    { label: 'Vídeos', done: 0, goal: 0, icon: Video, color: '#fb7185', bg: 'rgba(251,113,133,0.10)' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;
        const pct = item.goal > 0 ? Math.min(100, Math.round((item.done / item.goal) * 100)) : 0;
        return (
          <div
            key={item.label}
            className="rounded-2xl border border-white/[0.06] bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12]"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: item.bg }}
              >
                <Icon className="h-4 w-4" style={{ color: item.color }} />
              </div>
              <span className="font-mono text-[11px] font-semibold text-muted-foreground tabular-nums">
                {item.done}/{item.goal > 0 ? item.goal : '—'}
              </span>
            </div>
            <p className="text-[13px] font-semibold text-foreground">{item.label}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {item.goal > 0 ? `${pct}% concluído` : 'Sem meta definida'}
            </p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
