import { Clock, CheckCircle2, AlertCircle, CalendarDays } from 'lucide-react';
import Link from 'next/link';

type AgendaTask = {
  id: string;
  title: string;
  clientName: string;
  due_date: string | null;
  status: string;
  priority: string;
};

const priorityDot: Record<string, string> = {
  high:   'bg-rose-400',
  medium: 'bg-amber-400',
  low:    'bg-gray-300 dark:bg-gray-600',
};

const statusIcon: Record<string, { icon: typeof Clock; cls: string }> = {
  todo:   { icon: Clock,         cls: 'text-sky-500' },
  doing:  { icon: CheckCircle2,  cls: 'text-amber-500' },
  review: { icon: AlertCircle,   cls: 'text-amber-500' },
};

export function TodayAgenda({ tasks }: { tasks: AgendaTask[] }) {
  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Card header — Mosaic pattern */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/10">
            <CalendarDays className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Agenda de Hoje</h3>
        </div>
        <span className="text-xs tabular-nums font-medium text-gray-400 dark:text-gray-500">
          {tasks.length} {tasks.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      <div className="flex-1 p-3">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/10">
              <CheckCircle2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dia limpo!</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Nenhuma entrega com prazo hoje.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-0.5 overflow-y-auto scrollbar-none">
            {tasks.map((t) => {
              const s = statusIcon[t.status] ?? statusIcon.todo;
              const Icon = s.icon;
              return (
                <li
                  key={t.id}
                  className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${s.cls}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-gray-800 dark:text-gray-200 leading-tight">{t.title}</p>
                    <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500 truncate">{t.clientName}</p>
                  </div>
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${priorityDot[t.priority] ?? priorityDot.medium}`} />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700/60">
        <Link
          href="/calendar"
          className="flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
        >
          Ver calendário completo →
        </Link>
      </div>
    </div>
  );
}
