import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  TrendingUp,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  ChevronRight,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { MotionItem } from '@/components/dashboard/motion-section';
import { RevenueBarChart, type MonthlyRevenue } from '@/components/dashboard/revenue-bar-chart';

// ─── helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function fmtBRL(value: number | null) {
  if (!value) return 'R$ 0';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

function relativeTime(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  return `${Math.floor(diff / 86400)} d`;
}

const statusTone: Record<string, string> = {
  active: 'bg-primary/10 text-primary',
  inactive: 'bg-muted text-muted-foreground',
};

const statusLabel: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
};

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString();

  const sixMonthsAgo = new Date(currentYear, currentMonth - 7, 1);
  const sixMonthsAgoISO = sixMonthsAgo.toISOString();

  // ── parallel data fetches ──────────────────────────────────────────────────
  const [
    { count: activeClients },
    { count: newClientsThisMonth },
    { count: openTasks },
    { count: doneTasks },
    { count: overdueInvoices },
    { count: totalPendingInvoices },
    { data: activeFees },
    { data: paidInvoices },
    { data: activityFeed },
    { data: topClients },
    { data: plansThisMonth },
  ] = await Promise.all([
    // KPI 1: active clients
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    // new clients this month
    supabase.from('clients').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    // KPI 2: open tasks
    supabase.from('tasks').select('*', { count: 'exact', head: true }).in('status', ['todo', 'doing', 'review']),
    // done tasks (for ratio)
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'done'),
    // KPI 4: overdue invoices
    supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('status', 'overdue'),
    // total non-paid invoices
    supabase.from('invoices').select('*', { count: 'exact', head: true }).in('status', ['pending', 'overdue']),
    // KPI 3: MRR (sum of active monthly fees)
    supabase.from('clients').select('monthly_fee').eq('status', 'active'),
    // revenue chart: paid invoices last 6 months
    supabase.from('invoices').select('amount, paid_at').eq('status', 'paid').gte('paid_at', sixMonthsAgoISO).order('paid_at'),
    // activity feed
    supabase.from('timeline_events').select('id, title, description, created_at, client_id, clients(name)').order('created_at', { ascending: false }).limit(8),
    // top clients table
    supabase.from('clients').select('id, name, company, monthly_fee, status, due_day').eq('status', 'active').order('monthly_fee', { ascending: false }).limit(6),
    // plan progress this month
    supabase.from('plans').select('posts_completed, reels_completed, stories_completed, posts_goal, reels_goal, stories_goal').eq('month', currentMonth).eq('year', currentYear),
  ]);

  // ── KPI 3: MRR ──────────────────────────────────────────────────────────────
  const mrr = (activeFees ?? []).reduce((sum, r) => sum + (r.monthly_fee ?? 0), 0);

  // ── plan progress ───────────────────────────────────────────────────────────
  const planDone = (plansThisMonth ?? []).reduce(
    (s, r) => s + (r.posts_completed ?? 0) + (r.reels_completed ?? 0) + (r.stories_completed ?? 0),
    0
  );
  const planTotal = (plansThisMonth ?? []).reduce(
    (s, r) => s + (r.posts_goal ?? 0) + (r.reels_goal ?? 0) + (r.stories_goal ?? 0),
    0
  );
  const planPct = planTotal > 0 ? Math.round((planDone / planTotal) * 100) : 0;

  // ── revenue chart data ──────────────────────────────────────────────────────
  const revenueByMonth: Record<string, number> = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date(currentYear, currentMonth - 1 - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    revenueByMonth[key] = 0;
  }
  for (const inv of paidInvoices ?? []) {
    if (!inv.paid_at) continue;
    const d = new Date(inv.paid_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (key in revenueByMonth) revenueByMonth[key] += inv.amount ?? 0;
  }
  const chartData: MonthlyRevenue[] = Object.entries(revenueByMonth).map(([key, pago]) => ({
    label: MONTHS_PT[parseInt(key.split('-')[1]) - 1],
    pago,
  }));

  // ── task completion ratio ───────────────────────────────────────────────────
  const totalTasks = (openTasks ?? 0) + (doneTasks ?? 0);
  const taskDeltaStr = totalTasks > 0 ? `${Math.round(((doneTasks ?? 0) / totalTasks) * 100)}%` : '0%';

  // ── clients table: fetch task counts per client ─────────────────────────────
  const clientIds = (topClients ?? []).map((c) => c.id);
  const { data: clientTasks } = clientIds.length
    ? await supabase.from('tasks').select('client_id, status').in('client_id', clientIds)
    : { data: [] };

  const taskMap: Record<string, { open: number; done: number }> = {};
  for (const t of clientTasks ?? []) {
    if (!taskMap[t.client_id]) taskMap[t.client_id] = { open: 0, done: 0 };
    if (['todo', 'doing', 'review', 'backlog'].includes(t.status)) taskMap[t.client_id].open++;
    if (t.status === 'done') taskMap[t.client_id].done++;
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">

      {/* Page heading */}
      <MotionItem className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Visão Geral</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Receita, clientes e operação em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/finance"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-accent"
          >
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Financeiro
          </Link>
          <Link
            href="/clients/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-105 active:translate-y-px"
          >
            <Plus className="h-4 w-4" /> Novo cliente
          </Link>
        </div>
      </MotionItem>

      {/* ROW 1 — KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Clientes Ativos"
          value={String(activeClients ?? 0)}
          delta={newClientsThisMonth ? `+${newClientsThisMonth} este mês` : 'estável'}
          trend="up"
          hint={`${newClientsThisMonth ?? 0} onboarding este mês`}
          icon="users"
          tone="primary"
          delay={0.05}
        />
        <KpiCard
          label="Tarefas em Aberto"
          value={String(openTasks ?? 0)}
          delta={taskDeltaStr + ' concluídas'}
          trend={(doneTasks ?? 0) >= (openTasks ?? 0) ? 'up' : 'down'}
          hint={`${doneTasks ?? 0} finalizadas no total`}
          icon="clock"
          tone="sky"
          delay={0.1}
        />
        <KpiCard
          label="Receita Recorrente"
          value={fmtBRL(mrr)}
          delta={`${activeClients ?? 0} contratos`}
          trend="up"
          hint={`Média ${fmtBRL(mrr && activeClients ? Math.round(mrr / activeClients) : 0)}/cliente`}
          icon="calendar"
          tone="violet"
          delay={0.15}
        />
        <KpiCard
          label="Faturas Vencidas"
          value={String(overdueInvoices ?? 0)}
          delta={`${totalPendingInvoices ?? 0} pendentes`}
          trend={(overdueInvoices ?? 0) === 0 ? 'up' : 'down'}
          hint={(overdueInvoices ?? 0) === 0 ? 'Tudo em dia' : 'Requer atenção'}
          icon="message"
          tone="amber"
          delay={0.2}
        />
      </div>

      {/* ROW 2 — Revenue chart + Plan progress */}
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <MotionItem delay={0.25}>
          <section className="surface rounded-2xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Receita Paga</h2>
                <p className="mt-0.5 text-[13px] text-muted-foreground">Últimos 6 meses · faturas liquidadas</p>
              </div>
              <Link
                href="/finance"
                className="text-[13px] font-medium text-primary hover:underline"
              >
                Ver tudo
              </Link>
            </div>
            <div className="h-64">
              <RevenueBarChart data={chartData} />
            </div>
          </section>
        </MotionItem>

        <MotionItem delay={0.3}>
          <section className="surface flex h-full flex-col rounded-2xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Planos do Mês</h2>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {MONTHS_PT[currentMonth - 1]} {currentYear} · posts/reels/stories
                </p>
              </div>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Donut-style progress */}
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-2">
              <div className="relative flex h-36 w-36 items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="var(--chart-1)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${planPct * 2.638} 263.8`}
                  />
                </svg>
                <div className="text-center">
                  <p className="font-mono text-3xl font-semibold text-foreground tabular-nums">{planPct}%</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">concluído</p>
                </div>
              </div>
              <div className="w-full rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-center">
                <p className="tabular-nums text-sm font-medium text-foreground">
                  {planDone} <span className="text-muted-foreground font-normal">de</span> {planTotal}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">entregas totais planejadas</p>
              </div>
            </div>

            <Link
              href="/clients"
              className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              Ver planos por cliente <ChevronRight className="h-4 w-4" />
            </Link>
          </section>
        </MotionItem>
      </div>

      {/* ROW 3 — Activity + Clients table */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">

        {/* Activity feed */}
        <MotionItem delay={0.35}>
          <section className="surface flex h-full flex-col rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Atividade Recente</h2>
              <span className="text-[11px] font-medium text-muted-foreground">timeline</span>
            </div>

            {(!activityFeed || activityFeed.length === 0) ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Nenhuma atividade registrada ainda.</p>
              </div>
            ) : (
              <ul className="-mx-2 flex flex-col">
                {activityFeed.map((ev) => {
                  // @ts-ignore — joined relation
                  const clientName = ev.clients?.name ?? '—';
                  const ini = initials(clientName);
                  return (
                    <li
                      key={ev.id}
                      className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/60"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                        {ini}
                      </span>
                      <div className="min-w-0 flex-1 text-[13px]">
                        <p className="font-medium text-foreground truncate">{ev.title}</p>
                        <p className="truncate text-[12px] text-muted-foreground">{clientName}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                        {relativeTime(ev.created_at)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </MotionItem>

        {/* Clients table */}
        <MotionItem delay={0.4}>
          <section className="surface overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">Principais Clientes</h2>
                <p className="mt-0.5 text-[13px] text-muted-foreground">Ordenados por MRR</p>
              </div>
              <Link
                href="/clients"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-accent"
              >
                Ver todos <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </div>

            {(!topClients || topClients.length === 0) ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
                Nenhum cliente ativo ainda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider">Cliente</th>
                      <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider">MRR</th>
                      <th className="hidden px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider sm:table-cell">
                        Progresso de Tarefas
                      </th>
                      <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider">Status</th>
                      <th className="px-5 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {topClients.map((c) => {
                      const tm = taskMap[c.id] ?? { open: 0, done: 0 };
                      const taskTotal = tm.open + tm.done;
                      const taskPct = taskTotal > 0 ? Math.round((tm.done / taskTotal) * 100) : 0;
                      return (
                        <tr
                          key={c.id}
                          className="border-b border-border/60 transition-colors last:border-0 hover:bg-accent/50"
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                                {initials(c.name)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-[13px] font-medium text-foreground">{c.name}</p>
                                {c.company && (
                                  <p className="truncate text-[11px] text-muted-foreground">{c.company}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 font-mono text-[13px] font-medium text-foreground tabular-nums">
                            {fmtBRL(c.monthly_fee)}
                          </td>
                          <td className="hidden px-5 py-3 sm:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary transition-all"
                                  style={{ width: `${taskPct}%` }}
                                />
                              </div>
                              <span className="text-[11px] text-muted-foreground tabular-nums">
                                {tm.done}/{taskTotal}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusTone[c.status] ?? 'bg-muted text-muted-foreground'}`}
                            >
                              {statusLabel[c.status] ?? c.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <Link
                              href={`/clients/${c.id}`}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </MotionItem>
      </div>
    </div>
  );
}
