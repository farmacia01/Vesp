import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  Star,
  ChevronRight,
} from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { MotionItem } from '@/components/dashboard/motion-section';
import { RevenueAreaRealChart, type MonthlyRevenue } from '@/components/dashboard/revenue-area-real';
import { TodayAgenda } from '@/components/dashboard/today-agenda';
import { ProductionProgress } from '@/components/dashboard/production-progress';
import { StatusOverview } from '@/components/dashboard/status-overview';

// ─── helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function fmtBRL(value: number | null) {
  if (!value) return 'R$ 0';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

function fmtBRLCompact(value: number) {
  if (value >= 1000) return `R$${(value / 1000).toFixed(1)}k`;
  return `R$${value}`;
}

function relativeTime(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function greeting() {
  const h = new Date().getUTCHours() - 3;
  const hour = ((h % 24) + 24) % 24;
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

const activityIcon: Record<string, { emoji: string; bg: string }> = {
  'Cliente cadastrado':  { emoji: '👤', bg: 'bg-sky-100 dark:bg-sky-500/10' },
  'Cadastro atualizado': { emoji: '✏️', bg: 'bg-violet-100 dark:bg-violet-500/10' },
  'Tarefa concluída':    { emoji: '✅', bg: 'bg-amber-100 dark:bg-amber-500/10' },
  'Pagamento registrado':{ emoji: '💰', bg: 'bg-amber-100 dark:bg-amber-500/10' },
};

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString();
  const sixMonthsAgo = new Date(currentYear, currentMonth - 7, 1).toISOString();
  const todayStr = now.toISOString().split('T')[0];

  const [
    { count: activeClients },
    { count: newClientsThisMonth },
    { count: openTasks },
    { count: doneTasks },
    { count: overdueInvoices },
    { count: reviewTasksCount },
    { data: activeFees },
    { data: paidInvoices },
    { data: activityFeed },
    { data: topClients },
    { data: plansThisMonth },
    { data: reviewTasks },
    { data: todayTasksRaw },
    { data: allTaskStatuses },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('clients').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).in('status', ['todo', 'doing', 'review', 'backlog']),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'done'),
    supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('status', 'overdue'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'review'),
    supabase.from('clients').select('monthly_fee').eq('status', 'active'),
    supabase.from('invoices').select('amount, paid_at').eq('status', 'paid').gte('paid_at', sixMonthsAgo).order('paid_at'),
    supabase.from('timeline_events').select('id, title, description, created_at, client_id, clients(name)').order('created_at', { ascending: false }).limit(8),
    supabase.from('clients').select('id, name, company, monthly_fee, status').eq('status', 'active').order('monthly_fee', { ascending: false }).limit(5),
    supabase.from('plans').select('posts_completed, reels_completed, stories_completed, posts_goal, reels_goal, stories_goal').eq('month', currentMonth).eq('year', currentYear),
    supabase.from('tasks').select('id, title, client_id, clients(name), created_at').eq('status', 'review').order('created_at', { ascending: false }).limit(4),
    supabase.from('tasks').select('id, title, client_id, clients(name), due_date, status, priority').eq('due_date', todayStr).neq('status', 'done').order('priority').limit(8),
    supabase.from('tasks').select('status'),
  ]);

  // ── KPIs ─────────────────────────────────────────────────────────────────────
  const mrr = (activeFees ?? []).reduce((s, r) => s + (r.monthly_fee ?? 0), 0);
  const avgTicket = mrr && activeClients ? Math.round(mrr / (activeClients ?? 1)) : 0;

  // ── Revenue chart ─────────────────────────────────────────────────────────────
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
  const sparkData = chartData.map((d) => d.pago);

  // ── Plan progress ─────────────────────────────────────────────────────────────
  const planAgg = (plansThisMonth ?? []).reduce(
    (s, r) => ({
      postsDone: s.postsDone + (r.posts_completed ?? 0),
      postsGoal: s.postsGoal + (r.posts_goal ?? 0),
      reelsDone: s.reelsDone + (r.reels_completed ?? 0),
      reelsGoal: s.reelsGoal + (r.reels_goal ?? 0),
      storiesDone: s.storiesDone + (r.stories_completed ?? 0),
      storiesGoal: s.storiesGoal + (r.stories_goal ?? 0),
    }),
    { postsDone: 0, postsGoal: 0, reelsDone: 0, reelsGoal: 0, storiesDone: 0, storiesGoal: 0 }
  );
  const planTotal = planAgg.postsGoal + planAgg.reelsGoal + planAgg.storiesGoal;
  const planDone  = planAgg.postsDone + planAgg.reelsDone + planAgg.storiesDone;

  // ── Task status counts ────────────────────────────────────────────────────────
  const statusCounts = (allTaskStatuses ?? []).reduce(
    (s, t) => ({ ...s, [t.status]: (s[t.status as keyof typeof s] ?? 0) + 1 }),
    { backlog: 0, todo: 0, doing: 0, review: 0, done: 0 }
  );

  // ── Today tasks ───────────────────────────────────────────────────────────────
  const todayTasks = (todayTasksRaw ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    // @ts-ignore
    clientName: t.clients?.name ?? '—',
    due_date: t.due_date,
    status: t.status,
    priority: t.priority,
  }));

  // ── Client task map ───────────────────────────────────────────────────────────
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

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 pb-10">

      {/* ── GREETING HEADER ── */}
      <MotionItem className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">{today}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
            {greeting()}, Ryan! 👋
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Aqui está o resumo da sua operação hoje.
          </p>
        </div>
        <Link
          href="/clients"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110 active:translate-y-px"
        >
          + Novo Cliente
        </Link>
      </MotionItem>

      {/* ── ROW 1: 6 METRIC CARDS ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Receita Mensal"   value={fmtBRL(mrr)}              delta={`${activeClients ?? 0} contratos`} trend="up"      hint={`+${newClientsThisMonth ?? 0} este mês`} iconName="DollarSign"  tone="lime"   sparkData={sparkData.length > 1 ? sparkData : undefined} delay={0.04} />
        <MetricCard label="Ticket Médio"     value={fmtBRL(avgTicket)}        delta={activeClients ? `${activeClients} clientes` : 'sem dados'} trend="up" hint="Por cliente ativo" iconName="TrendingUp"  tone="sky"    delay={0.08} />
        <MetricCard label="Clientes Ativos"  value={String(activeClients ?? 0)} delta={newClientsThisMonth ? `+${newClientsThisMonth} este mês` : 'estável'} trend={newClientsThisMonth ? 'up' : 'neutral'} iconName="Users" tone="violet" delay={0.12} />
        <MetricCard label="Produção do Mês"  value={String(planDone)}         delta={`de ${planTotal} planejados`} trend={planDone >= planTotal * 0.7 ? 'up' : 'neutral'} hint={`${planTotal > 0 ? Math.round((planDone / planTotal) * 100) : 0}% concluído`} iconName="Layers" tone="amber" delay={0.16} />
        <MetricCard label="Tarefas Pendentes" value={String(openTasks ?? 0)}  delta={`${doneTasks ?? 0} concluídas`} trend={(doneTasks ?? 0) >= (openTasks ?? 0) ? 'up' : 'down'} iconName="Clock" tone="rose"   delay={0.20} />
        <MetricCard label="Aprovações"       value={String(reviewTasksCount ?? 0)} delta={(reviewTasksCount ?? 0) === 0 ? 'tudo ok' : 'aguardando'} trend={(reviewTasksCount ?? 0) === 0 ? 'up' : 'down'} hint="Aguardando cliente" iconName="CheckSquare" tone="teal" delay={0.24} />
      </div>

      {/* ── ROW 2: CHART + AGENDA ── */}
      <div className="grid gap-4 lg:grid-cols-[2.2fr_1fr]">

        {/* Revenue area chart */}
        <MotionItem delay={0.28}>
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">Receita dos Últimos Meses</h2>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">Faturas pagas · últimos 6 meses</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Receita
                </div>
                <Link href="/finance" className="text-xs font-medium text-primary hover:underline">
                  Ver tudo →
                </Link>
              </div>
            </div>
            <div className="p-5 h-[240px]">
              <RevenueAreaRealChart data={chartData} />
            </div>
          </div>
        </MotionItem>

        <MotionItem delay={0.32}>
          <TodayAgenda tasks={todayTasks} />
        </MotionItem>
      </div>

      {/* ── ROW 3: 3 COLUMNS ── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Principais Clientes */}
        <MotionItem delay={0.36}>
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Principais Clientes</h3>
              </div>
              <Link href="/clients" className="text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
                Ver todos
              </Link>
            </div>
            <div className="p-3">
              {(!topClients || topClients.length === 0) ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                  <AlertCircle className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-400">Nenhum cliente ativo ainda.</p>
                </div>
              ) : (
                <ul className="space-y-0.5">
                  {topClients.map((c) => {
                    const tm = taskMap[c.id] ?? { open: 0, done: 0 };
                    const taskTotal = tm.open + tm.done;
                    const taskPct = taskTotal > 0 ? Math.round((tm.done / taskTotal) * 100) : 0;
                    return (
                      <li key={c.id}>
                        <Link
                          href={`/clients/${c.id}`}
                          className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/10 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                            {initials(c.name)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-gray-800 dark:text-gray-200">{c.name}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${taskPct}%` }} />
                              </div>
                              <span className="text-[10px] text-gray-400 tabular-nums">{tm.done}/{taskTotal}</span>
                            </div>
                          </div>
                          <span className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
                            {fmtBRLCompact(c.monthly_fee ?? 0)}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </MotionItem>

        {/* Atividades Recentes */}
        <MotionItem delay={0.40}>
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Atividades Recentes</h3>
            </div>
            <div className="p-3">
              {(!activityFeed || activityFeed.length === 0) ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                  <p className="text-sm text-gray-400">Nenhuma atividade registrada.</p>
                </div>
              ) : (
                <ul className="relative space-y-0 pl-4">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-100 dark:bg-gray-700" />
                  {activityFeed.slice(0, 7).map((ev) => {
                    // @ts-ignore
                    const clientName = ev.clients?.name ?? '—';
                    const ai = activityIcon[ev.title] ?? { emoji: '📌', bg: 'bg-gray-100 dark:bg-gray-700' };
                    return (
                      <li key={ev.id} className="flex items-start gap-3 py-2">
                        <div className={`relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ring-2 ring-white dark:ring-gray-800 ${ai.bg}`}>
                          {ai.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-gray-800 dark:text-gray-200">{ev.title}</p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500">{clientName} · {relativeTime(ev.created_at)}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </MotionItem>

        {/* Aprovações Pendentes */}
        <MotionItem delay={0.44}>
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Aprovações Pendentes</h3>
              </div>
              {(reviewTasksCount ?? 0) > 0 && (
                <span className="rounded-full bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
                  {reviewTasksCount}
                </span>
              )}
            </div>
            <div className="p-3">
              {(!reviewTasks || reviewTasks.length === 0) ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                  <CheckCircle2 className="h-6 w-6 text-amber-500" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tudo aprovado!</p>
                  <p className="text-xs text-gray-400">Nenhum conteúdo aguardando aprovação.</p>
                </div>
              ) : (
                <ul className="space-y-0.5">
                  {reviewTasks.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-gray-800 dark:text-gray-200">{t.title}</p>
                        {/* @ts-ignore */}
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">{t.clients?.name ?? '—'} · {relativeTime(t.created_at)}</p>
                      </div>
                      <Link
                        href="/tasks"
                        className="shrink-0 rounded-lg border border-gray-200 dark:border-gray-600 px-2 py-1 text-[10px] font-medium text-gray-400 transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        Ver
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </MotionItem>
      </div>

      {/* ── ROW 4: PRODUÇÃO DO MÊS ── */}
      <MotionItem delay={0.48}>
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                Produção do Mês
                <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">
                  {MONTHS_PT[currentMonth - 1]} {currentYear}
                </span>
              </h2>
            </div>
            <Link href="/clients" className="text-xs font-medium text-primary hover:underline">
              Ver por cliente →
            </Link>
          </div>
          <div className="p-5">
            <ProductionProgress
              posts={{ done: planAgg.postsDone, goal: planAgg.postsGoal }}
              reels={{ done: planAgg.reelsDone, goal: planAgg.reelsGoal }}
              stories={{ done: planAgg.storiesDone, goal: planAgg.storiesGoal }}
            />
          </div>
        </div>
      </MotionItem>

      {/* ── ROW 5: VISÃO OPERACIONAL ── */}
      <MotionItem delay={0.52}>
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Visão Operacional</h2>
            <Link href="/tasks" className="text-xs font-medium text-primary hover:underline">
              Todas as tarefas →
            </Link>
          </div>
          <div className="p-5">
            <StatusOverview counts={statusCounts} />
          </div>
        </div>
      </MotionItem>

    </div>
  );
}
