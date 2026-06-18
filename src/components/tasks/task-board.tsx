'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Trash } from 'lucide-react'
import { updateTaskStatusAction, deleteTaskAction } from '@/app/(admin)/calendar/actions'
import { TaskDialog } from './task-dialog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const STATUSES = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'A Fazer' },
  { id: 'doing', label: 'Em Produção' },
  { id: 'review', label: 'Revisão' },
  { id: 'done', label: 'Concluído' },
]

export function TaskBoard({ tasks, clients }: { tasks: any[], clients: any[] }) {
  const getTasksByStatus = (statusId: string) => tasks.filter((t) => t.status === statusId)

  return (
    <div className="flex h-full w-full gap-4 overflow-x-auto pb-4">
      {STATUSES.map((status, index) => {
        const columnTasks = getTasksByStatus(status.id)
        return (
          <div key={status.id} className="flex min-w-[260px] lg:min-w-[300px] flex-col rounded-lg bg-muted/30 border p-3 lg:p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{status.label}</h3>
              <Badge variant="secondary">{columnTasks.length}</Badge>
            </div>
            <div className="flex flex-1 flex-col gap-3">
              {columnTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  clients={clients}
                  onMoveLeft={index > 0 ? () => updateTaskStatusAction(task.id, STATUSES[index - 1].id) : undefined}
                  onMoveRight={index < STATUSES.length - 1 ? () => updateTaskStatusAction(task.id, STATUSES[index + 1].id) : undefined}
                />
              ))}
              <TaskDialog clients={clients} defaultStatus={status.id} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TaskCard({ task, clients, onMoveLeft, onMoveRight }: any) {
  const [loading, setLoading] = useState(false)
  
  const handleAction = async (action: () => Promise<any>) => {
    setLoading(true)
    await action()
    setLoading(false)
  }

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      handleAction(() => deleteTaskAction(task.id))
    }
  }

  const priorityColors: Record<string, string> = {
    low: 'secondary',
    medium: 'default',
    high: 'destructive'
  }

  return (
    <Card className={`group relative shadow-sm hover:shadow-md transition-shadow ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <TaskDialog clients={clients} task={task} mode="edit" />
        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={handleDelete}>
          <Trash className="h-3 w-3" />
        </Button>
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="flex flex-wrap gap-2 mb-2">
          {task.clients && <Badge variant="outline" className="text-[10px] font-medium bg-background">{task.clients.name}</Badge>}
          <Badge variant={priorityColors[task.priority] as any} className="text-[10px] uppercase">
            {task.priority === 'high' ? 'Alta' : task.priority === 'low' ? 'Baixa' : 'Média'}
          </Badge>
        </div>
        <h4 className="font-medium text-sm leading-snug pr-8">{task.title}</h4>
        
        {task.due_date && (
          <p className="text-xs text-muted-foreground mt-2">
            Prazo: {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}
          </p>
        )}
        
        <div className="flex justify-between items-center pt-3 mt-1">
           <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground" 
            disabled={!onMoveLeft}
            onClick={() => onMoveLeft && handleAction(onMoveLeft)}
          >
            <ArrowLeft className="h-3 w-3 mr-1" /> Voltar
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground" 
            disabled={!onMoveRight}
            onClick={() => onMoveRight && handleAction(onMoveRight)}
          >
            Avançar <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
