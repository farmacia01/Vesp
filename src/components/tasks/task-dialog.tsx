'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Edit2 } from 'lucide-react'
import { TaskForm } from './task-form'

interface ClientOption {
  id: string
  name: string
}

interface TaskDialogProps {
  clients: ClientOption[]
  task?: any
  mode?: 'create' | 'edit'
  defaultStatus?: string
  triggerButton?: React.ReactNode
}

export function TaskDialog({ clients, task, mode = 'create', defaultStatus, triggerButton }: TaskDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {triggerButton ? (
          triggerButton
        ) : mode === 'create' ? (
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground mt-2 border border-dashed">
            <Plus className="mr-2 h-4 w-4" /> Adicionar Tarefa
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit2 className="h-3 w-3" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nova Tarefa' : 'Editar Tarefa'}</DialogTitle>
        </DialogHeader>
        <TaskForm 
          clients={clients} 
          initialData={task} 
          defaultStatus={defaultStatus}
          onSuccess={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  )
}
