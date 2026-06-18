import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Edit } from 'lucide-react';
import { ProgressCard } from '@/components/dashboard/progress-card';
import { ClientDialog } from '@/components/clients/client-dialog';
import Link from 'next/link';

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch client details
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !client) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">{client.name}</h2>
          <p className="text-muted-foreground">{client.company}</p>
        </div>
        <div className="flex space-x-2 shrink-0">
          <ClientDialog mode="edit" client={client} />
          <Link href={`/portal/${client.id}`} target="_blank">
            <Button>
              <ExternalLink className="mr-2 h-4 w-4" /> Portal
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 overflow-x-auto w-full justify-start">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="planning">Planejamento</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
          <TabsTrigger value="finance">Financeiro</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dados de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">E-mail</p>
                  <p>{client.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                  <p>{client.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Instagram</p>
                  <p>{client.instagram || '-'}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contrato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mensalidade</p>
                  <p className="font-semibold text-lg text-primary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.monthly_fee)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dia de Vencimento</p>
                  <p>Dia {client.due_day}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="capitalize">{client.status === 'active' ? 'Ativo' : 'Inativo'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Anotações Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{client.notes || 'Nenhuma anotação.'}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="planning" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Metas do Mês Atual</h3>
            <Button variant="outline" size="sm">Ajustar Metas</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <ProgressCard title="Posts" completed={2} total={12} />
            <ProgressCard title="Reels" completed={1} total={4} />
            <ProgressCard title="Stories" completed={15} total={40} />
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardContent className="p-6">
              <div className="h-[500px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                <p>Kanban Board será renderizado aqui.</p>
                <p className="text-sm mt-2">Para habilitar drag-and-drop, utilizaremos @dnd-kit futuramente.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crm">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de CRM</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Linha do tempo de notas de CRM.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance">
          <Card>
            <CardHeader>
              <CardTitle>Faturas e Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Lista de faturas vinculadas ao cliente.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Timeline Automática</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Eventos automáticos registrados para este cliente.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
