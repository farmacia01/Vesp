import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, KanbanSquare } from 'lucide-react';
import { TaskBoard } from '@/components/tasks/task-board';
import { TaskDialog } from '@/components/tasks/task-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function CalendarPage() {
  const supabase = await createClient();

  // Fetch tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, clients(name)')
    .order('created_at', { ascending: false });

  // Fetch clients for the forms
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .order('name', { ascending: true });

  return (
    <div className="flex-1 space-y-4 h-[calc(100dvh-8rem)] lg:h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Gestão de Tarefas</h2>
        <div className="flex items-center space-x-2">
          <TaskDialog 
            clients={clients || []} 
            triggerButton={<Button>Nova Tarefa</Button>} 
          />
        </div>
      </div>

      <Tabs defaultValue="kanban" className="w-full flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <KanbanSquare className="h-4 w-4" /> Kanban
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" /> Calendário Mensal
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="kanban" className="flex-1 m-0 h-full overflow-hidden">
          <TaskBoard tasks={tasks || []} clients={clients || []} />
        </TabsContent>

        <TabsContent value="calendar" className="flex-1 m-0">
          <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
            A visualização em formato de calendário (mês/semana) será aprimorada em breve. Use a aba Kanban para gerenciar o fluxo!
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
