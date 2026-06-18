import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/dashboard/stat-card';
import { DollarSign, TrendingUp, AlertCircle, CreditCard } from 'lucide-react';
import { FinanceClient } from './finance-client';

export default async function FinancePage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();
  const sp = searchParams ? await searchParams : {};
  const filterStatus = sp.status;

  // Query Invoices
  let invoicesQuery = supabase
    .from('invoices')
    .select(`
      id,
      amount,
      due_date,
      status,
      paid_at,
      clients ( name )
    `)
    .order('due_date', { ascending: false });

  if (filterStatus) {
    invoicesQuery = invoicesQuery.eq('status', filterStatus);
  }

  const { data: invoices } = await invoicesQuery;

  // Calculate stats (Mock logic for demonstration since actual SQL agg might be needed)
  const monthlyRevenue = invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.amount), 0) || 0;
  const annualRevenue = monthlyRevenue * 12; // Simplified mock
  const pendingAmount = invoices?.filter(i => i.status !== 'paid').reduce((sum, i) => sum + Number(i.amount), 0) || 0;
  const averageTicket = invoices?.length ? (monthlyRevenue / invoices.filter(i => i.status === 'paid').length) || 0 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'overdue': return 'destructive';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      paid: 'Pago',
      pending: 'Pendente',
      overdue: 'Atrasado'
    };
    return labels[status] || status;
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Financeiro</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:gap-4 lg:grid-cols-4">
        <StatCard
          title="Receita Mensal"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyRevenue)}
          icon={DollarSign}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Receita Anual"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(annualRevenue)}
          icon={TrendingUp}
        />
        <StatCard
          title="Pendências"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingAmount)}
          icon={AlertCircle}
        />
        <StatCard
          title="Ticket Médio"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(averageTicket)}
          icon={CreditCard}
        />
      </div>

      <FinanceClient invoices={invoices as any} filterStatus={filterStatus} />
    </div>
  );
}
