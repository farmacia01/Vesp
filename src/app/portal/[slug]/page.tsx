import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, Eye, LayoutList } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default async function PortalDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient();
  const { slug } = await params;
  const clientId = slug;

  // Verify client exists
  const { data: client } = await supabase
    .from('clients')
    .select('name')
    .eq('id', clientId)
    .single();

  if (!client) {
    notFound();
  }

  // Fetch tasks for metrics
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, status, created_at') // Using created_at or we could add updated_at to schema, let's use created_at as fallback for sorting recent
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  const allTasks = tasks || [];
  
  // Metrics calculation
  const tasksInReview = allTasks.filter(t => t.status === 'review').length;
  const tasksInProduction = allTasks.filter(t => t.status === 'doing').length;
  const tasksDone = allTasks.filter(t => t.status === 'done').length;
  
  const recentTasks = allTasks.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'backlog': return <Badge variant="secondary">Backlog</Badge>;
      case 'todo': return <Badge variant="outline">A Fazer</Badge>;
      case 'doing': return <Badge className="bg-blue-500 hover:bg-blue-600">Em Produção</Badge>;
      case 'review': return <Badge className="bg-amber-500 hover:bg-amber-600">Aguardando Revisão</Badge>;
      case 'done': return <Badge className="bg-emerald-500 hover:bg-emerald-600">Concluído</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Resumo do Projeto</h2>
        <p className="text-muted-foreground mt-1">Acompanhe as métricas de produção do seu conteúdo.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:gap-4 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="text-3xl font-bold">{tasksInReview}</h3>
            <p className="text-sm font-medium text-muted-foreground">Aguardando Revisão</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-3xl font-bold">{tasksInProduction}</h3>
            <p className="text-sm font-medium text-muted-foreground">Em Produção</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-3xl font-bold">{tasksDone}</h3>
            <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-muted/40 border-dashed">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 bg-muted text-muted-foreground rounded-full">
              <LayoutList className="h-6 w-6" />
            </div>
            <h3 className="text-3xl font-bold">{allTasks.length}</h3>
            <p className="text-sm font-medium text-muted-foreground">Total de Tarefas</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Tarefas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTasks.length > 0 ? (
            <div className="space-y-4">
              {recentTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Adicionada em {format(new Date(task.created_at || new Date()), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(task.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma tarefa foi movimentada ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
