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
  high: 'bg-rose-400',
  medium: 'bg-amber-400',
  low: 'bg-muted-foreground',
};

const statusIcon: Record<string, { icon: typeof Clock; cls: string }> = {
  todo: { icon: Clock, cls: 'text-sky-400' },
  doing: { icon: CheckCircle2, cls: 'text-lime-400' },
  review: { icon: AlertCircle, cls: 'text-amber-400' },
};

export function TodayAgenda({ tasks }: { tasks: AgendaTask[] }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/[0.06] bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10">
            <CalendarDays className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-foreground">Agenda de Hoje</h3>
          </div>
        </div>
        <span className="text-[11px] tabular-nums font-medium text-muted-foreground">
          {tasks.length} {tasks.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/40">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <p className="text-[13px] font-medium text-foreground">Dia limpo!</p>
          <p className="text-[11px] text-muted-foreground">Nenhuma entrega com prazo para hoje.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5 overflow-y-auto scrollbar-none">
          {tasks.map((t) => {
            const s = statusIcon[t.status] ?? statusIcon.todo;
            const Icon = s.icon;
            return (
              <li
                key={t.id}
                className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-accent/40"
              >
                <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${s.cls}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-foreground leading-tight">{t.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{t.clientName}</p>
                </div>
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${priorityDot[t.priority] ?? priorityDot.medium}`}
                />
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/calendar"
        className="mt-auto pt-3 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/[0.08] py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
      >
        Ver calendário completo
      </Link>
    </div>
  );
}
