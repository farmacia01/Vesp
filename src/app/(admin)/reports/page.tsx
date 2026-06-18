import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/dashboard/stat-card';
import { DollarSign, Users, AlertCircle, TrendingUp } from 'lucide-react';
import { ChartsClient } from './charts-client';

export default async function ReportsPage() {
  const supabase = await createClient();

  // Fetch invoices for revenue stats
  const { data: invoices } = await supabase
    .from('invoices')
    .select('amount, status, paid_at')
    .order('paid_at', { ascending: true });

  // Fetch clients for client stats
  const { data: clients } = await supabase
    .from('clients')
    .select('status');

  // Basic KPI calculations
  const totalRevenue = invoices?.filter(i => i.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  const pendingRevenue = invoices?.filter(i => i.status !== 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  const activeClients = clients?.filter(c => c.status === 'active').length || 0;
  const inactiveClients = clients?.filter(c => c.status !== 'active').length || 0;
  
  const defaultRate = (totalRevenue + pendingRevenue) > 0 
    ? (pendingRevenue / (totalRevenue + pendingRevenue)) * 100 
    : 0;

  // Process data for charts
  // 1. Revenue by Month (Last 6 months simplified mock logic)
  const revenueByMonthMap: Record<string, number> = {};
  
  if (invoices) {
    invoices.filter(i => i.status === 'paid' && i.paid_at).forEach(invoice => {
      const date = new Date(invoice.paid_at);
      const monthYear = `${date.toLocaleString('pt-BR', { month: 'short' })}/${date.getFullYear()}`;
      if (!revenueByMonthMap[monthYear]) {
        revenueByMonthMap[monthYear] = 0;
      }
      revenueByMonthMap[monthYear] += Number(invoice.amount);
    });
  }

  // Convert map to array for Recharts and sort/limit (very basic)
  const revenueData = Object.entries(revenueByMonthMap).map(([name, total]) => ({
    name,
    total
  })).slice(-6); // get last 6 entries

  // Fallback if no data
  if (revenueData.length === 0) {
    revenueData.push({ name: 'Atual', total: 0 });
  }

  // 2. Client Status Data
  const clientsData = [
    { name: 'Ativos', value: activeClients },
    { name: 'Inativos', value: inactiveClients }
  ];

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Relatórios Gerenciais</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:gap-4 lg:grid-cols-4">
        <StatCard
          title="Receita Histórica"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
          icon={DollarSign}
        />
        <StatCard
          title="A Receber"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingRevenue)}
          icon={TrendingUp}
        />
        <StatCard
          title="Clientes Ativos"
          value={activeClients.toString()}
          icon={Users}
        />
        <StatCard
          title="Taxa de Inadimplência"
          value={`${defaultRate.toFixed(1)}%`}
          icon={AlertCircle}
          accentColor={defaultRate > 20 ? 'pink' : 'orange'}
        />
      </div>

      {/* Interactive Charts Component */}
      <ChartsClient revenueData={revenueData} clientsData={clientsData} />
    </div>
  );
}
