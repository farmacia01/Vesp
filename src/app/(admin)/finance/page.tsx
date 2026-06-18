import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/dashboard/stat-card';
import { DollarSign, TrendingUp, AlertCircle, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <div className="flex flex-wrap gap-2">
            <a href="/finance" className={`text-sm px-3 py-1 rounded-full ${!filterStatus ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>Todos</a>
            <a href="/finance?status=paid" className={`text-sm px-3 py-1 rounded-full ${filterStatus === 'paid' ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}`}>Pagos</a>
            <a href="/finance?status=pending" className={`text-sm px-3 py-1 rounded-full ${filterStatus === 'pending' ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'}`}>Pendentes</a>
            <a href="/finance?status=overdue" className={`text-sm px-3 py-1 rounded-full ${filterStatus === 'overdue' ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'}`}>Atrasados</a>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="hidden sm:table-cell">Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right hidden md:table-cell">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices && invoices.length > 0 ? (
                invoices.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.clients?.name}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.amount)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(invoice.status) as any}>
                        {getStatusLabel(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      {/* Actions like register payment, send reminder */}
                      <button className="text-sm text-primary hover:underline">Detalhes</button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhuma fatura encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
