import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUSES = [
  { id: 'todo', label: 'A Fazer' },
  { id: 'doing', label: 'Em Produção' },
  { id: 'review', label: 'Em Revisão' },
  { id: 'done', label: 'Concluído' },
];

export default async function PortalTasksPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient();
  const { slug } = await params;
  const clientId = slug;

  // Fetch tasks, ignoring 'backlog' as it is usually internal planning
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('client_id', clientId)
    .neq('status', 'backlog')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
  }

  const getTasksByStatus = (statusId: string) => (tasks || []).filter((t) => t.status === statusId);

  return (
    <div className="space-y-6 h-[calc(100vh-10rem)] flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Quadro de Produção</h2>
        <p className="text-muted-foreground mt-1">Acompanhe o andamento do seu conteúdo em tempo real.</p>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => {
          const columnTasks = getTasksByStatus(status.id);
          return (
            <div key={status.id} className="flex min-w-[280px] flex-col rounded-xl bg-muted/30 border p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{status.label}</h3>
                <Badge variant="secondary">{columnTasks.length}</Badge>
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                {columnTasks.map((task) => (
                  <Card key={task.id} className="shadow-sm border-l-4" style={{ borderLeftColor: status.id === 'done' ? '#10b981' : status.id === 'review' ? '#f59e0b' : status.id === 'doing' ? '#3b82f6' : '#e5e7eb' }}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'low' ? 'secondary' : 'default'} className="text-[10px] uppercase">
                          {task.priority === 'high' ? 'Alta' : task.priority === 'low' ? 'Baixa' : 'Média'}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm leading-snug">{task.title}</h4>
                      
                      {task.due_date && (
                        <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                          Prazo: {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {columnTasks.length === 0 && (
                  <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed">
                    <span className="text-xs text-muted-foreground">Nenhuma tarefa</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
