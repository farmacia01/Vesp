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
import { createClientAction, updateClientAction } from '@/app/(admin)/clients/actions'

interface ClientFormProps {
  initialData?: any
  onSuccess?: () => void
}

export function ClientForm({ initialData, onSuccess }: ClientFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!initialData

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    let result
    if (isEditing) {
      result = await updateClientAction(initialData.id, formData)
    } else {
      result = await createClientAction(formData)
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Cliente *</Label>
          <Input id="name" name="name" defaultValue={initialData?.name} required placeholder="João da Silva" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Empresa</Label>
          <Input id="company" name="company" defaultValue={initialData?.company} placeholder="Sua Empresa LTDA" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" defaultValue={initialData?.email} placeholder="joao@empresa.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone / WhatsApp</Label>
          <Input id="phone" name="phone" defaultValue={initialData?.phone} placeholder="(11) 99999-9999" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input id="instagram" name="instagram" defaultValue={initialData?.instagram} placeholder="@empresa" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={initialData?.status || 'active'}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthly_fee">Valor Mensal (R$)</Label>
          <Input id="monthly_fee" name="monthly_fee" type="number" step="0.01" defaultValue={initialData?.monthly_fee || 0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="due_day">Dia de Vencimento</Label>
          <Input id="due_day" name="due_day" type="number" min="1" max="31" defaultValue={initialData?.due_day || 5} />
        </div>
      </div>
      
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-semibold text-lg text-primary">Contexto Vesp AI (Gerador de Prompts)</h3>
        <p className="text-sm text-muted-foreground">Preencha o que este cliente faz, o que ele vende, seu nicho e público-alvo. Isso será usado para gerar descrições e prompts ultra-precisos.</p>
        <div className="space-y-2">
          <Label htmlFor="ai_context">Contexto da Marca (Produtos, Nicho, Paleta)</Label>
          <Textarea id="ai_context" name="ai_context" defaultValue={initialData?.ai_context} placeholder="Ex: Farmácia de bairro, vende remédios e perfumaria. Foco em mães e idosos. Cores azul e verde..." rows={4} />
        </div>
      </div>
      
      <div className="space-y-2 pt-4 border-t">
        <Label htmlFor="notes">Anotações Internas (CRM)</Label>
        <Textarea id="notes" name="notes" defaultValue={initialData?.notes} placeholder="Informações importantes sobre o cliente..." rows={4} />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : isEditing ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
        </Button>
      </div>
    </form>
  )
}
