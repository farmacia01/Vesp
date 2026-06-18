'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createTaskAction, updateTaskAction } from '@/app/(admin)/calendar/actions'

interface ClientOption {
  id: string
  name: string
}

interface TaskFormProps {
  clients: ClientOption[]
  initialData?: any
  onSuccess?: () => void
  defaultStatus?: string // Useful if creating a task directly from a specific column
}

export function TaskForm({ clients, initialData, onSuccess, defaultStatus }: TaskFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!initialData

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    // Manual validation for required client_id since select required prop doesn't always trigger natively
    if (!formData.get('client_id')) {
      setError('Por favor, selecione um cliente.')
      setLoading(false)
      return
    }

    let result
    if (isEditing) {
      result = await updateTaskAction(initialData.id, formData)
    } else {
      result = await createTaskAction(formData)
    }

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      if (onSuccess) onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm font-medium text-destructive">{error}</div>}
      
      <div className="space-y-2">
        <Label htmlFor="title">Título da Tarefa *</Label>
        <Input id="title" name="title" defaultValue={initialData?.title} required placeholder="Ex: Post Carrossel Instagram" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="client_id">Cliente *</Label>
        <Select name="client_id" defaultValue={initialData?.client_id}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Estágio (Status)</Label>
          <Select name="status" defaultValue={initialData?.status || defaultStatus || 'backlog'}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="todo">A Fazer</SelectItem>
              <SelectItem value="doing">Em Produção</SelectItem>
              <SelectItem value="review">Revisão</SelectItem>
              <SelectItem value="done">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select name="priority" defaultValue={initialData?.priority || 'medium'}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="due_date">Prazo (Data de Entrega/Postagem)</Label>
        <Input id="due_date" name="due_date" type="date" defaultValue={initialData?.due_date} />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descrição / Briefing</Label>
        <Textarea id="description" name="description" defaultValue={initialData?.description} placeholder="Detalhes do que precisa ser feito..." rows={4} />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : isEditing ? 'Atualizar Tarefa' : 'Criar Tarefa'}
        </Button>
      </div>
    </form>
  )
}
