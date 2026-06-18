import { Image, Film, Radio, Palette, Video } from 'lucide-react';

type ProductionItem = {
  label: string;
  done: number;
  goal: number;
  icon: typeof Image;
  color: string;
  bg: string;
  darkBg: string;
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
    { label: 'Posts',   done: posts.done,   goal: posts.goal,   icon: Image,   color: '#d97706', bg: 'bg-amber-100',  darkBg: 'dark:bg-amber-500/10' },
    { label: 'Reels',   done: reels.done,   goal: reels.goal,   icon: Film,    color: '#0ea5e9', bg: 'bg-sky-100',    darkBg: 'dark:bg-sky-500/10' },
    { label: 'Stories', done: stories.done, goal: stories.goal, icon: Radio,   color: '#8b5cf6', bg: 'bg-violet-100', darkBg: 'dark:bg-violet-500/10' },
    { label: 'Artes',   done: 0,            goal: 0,            icon: Palette, color: '#f59e0b', bg: 'bg-amber-100',  darkBg: 'dark:bg-amber-500/10' },
    { label: 'Vídeos',  done: 0,            goal: 0,            icon: Video,   color: '#f43f5e', bg: 'bg-rose-100',   darkBg: 'dark:bg-rose-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;
        const pct = item.goal > 0 ? Math.min(100, Math.round((item.done / item.goal) * 100)) : 0;
        return (
          <div
            key={item.label}
            className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={['flex h-8 w-8 items-center justify-center rounded-lg', item.bg, item.darkBg].join(' ')}>
                <Icon className="h-4 w-4" style={{ color: item.color }} />
              </div>
              <span className="font-mono text-[11px] font-semibold text-gray-400 dark:text-gray-500 tabular-nums">
                {item.done}/{item.goal > 0 ? item.goal : '—'}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.label}</p>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              {item.goal > 0 ? `${pct}% concluído` : 'Sem meta definida'}
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
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
