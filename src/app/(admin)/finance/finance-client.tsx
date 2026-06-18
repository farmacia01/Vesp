'use client';

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { markInvoiceAsPaid, generateMonthlyInvoices } from './actions';

interface Invoice {
  id: string;
  amount: number;
  due_date: string;
  status: string;
  paid_at: string | null;
  clients: { name: string } | null;
}

interface FinanceClientProps {
  invoices: Invoice[] | null;
  filterStatus: string | undefined;
}

export function FinanceClient({ invoices, filterStatus }: FinanceClientProps) {
  const [isPending, startTransition] = useTransition();
  const [generating, setGenerating] = useState(false);
  const [loadingInvoiceId, setLoadingInvoiceId] = useState<string | null>(null);

  const handleMarkAsPaid = (invoiceId: string) => {
    setLoadingInvoiceId(invoiceId);
    startTransition(async () => {
      const result = await markInvoiceAsPaid(invoiceId);
      if (!result.success) {
        alert(result.error);
      }
      setLoadingInvoiceId(null);
    });
  };

  const handleGenerateInvoices = async () => {
    setGenerating(true);
    startTransition(async () => {
      const result = await generateMonthlyInvoices();
      if (result.success) {
        alert(`Sucesso! ${result.generatedCount} novas faturas foram geradas.`);
      } else {
        alert(result.error);
      }
      setGenerating(false);
    });
  };

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
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <Button 
            onClick={handleGenerateInvoices} 
            disabled={generating || isPending}
            size="sm"
            variant="outline"
            className="hidden sm:flex"
          >
            {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Gerar Faturas do Mês
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <a href="/finance" className={`text-sm px-3 py-1 rounded-full ${!filterStatus ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>Todos</a>
          <a href="/finance?status=paid" className={`text-sm px-3 py-1 rounded-full ${filterStatus === 'paid' ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}`}>Pagos</a>
          <a href="/finance?status=pending" className={`text-sm px-3 py-1 rounded-full ${filterStatus === 'pending' ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'}`}>Pendentes</a>
          <a href="/finance?status=overdue" className={`text-sm px-3 py-1 rounded-full ${filterStatus === 'overdue' ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'}`}>Atrasados</a>
        </div>
        {/* Mobile Button */}
        <Button 
          onClick={handleGenerateInvoices} 
          disabled={generating || isPending}
          size="sm"
          variant="outline"
          className="w-full sm:hidden mt-2"
        >
          {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Gerar Faturas
        </Button>
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
              invoices.map((invoice: any) => {
                const isLoading = loadingInvoiceId === invoice.id;
                const isPaid = invoice.status === 'paid';
                
                return (
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
                      {!isPaid ? (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-success hover:text-success hover:bg-success/10"
                          onClick={() => handleMarkAsPaid(invoice.id)}
                          disabled={isLoading || isPending}
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                          Marcar Pago
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground mr-4">
                          Pago em {format(new Date(invoice.paid_at), 'dd/MM/yy', { locale: ptBR })}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
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
  );
}
