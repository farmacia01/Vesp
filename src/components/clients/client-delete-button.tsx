'use client'

import { useState } from 'react'
import { Trash } from 'lucide-react'
import { deleteClientAction } from '@/app/(admin)/clients/actions'

interface ClientDeleteButtonProps {
  id: string
  name: string
}

export function ClientDeleteButton({ id, name }: ClientDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm(`Tem certeza que deseja excluir o cliente "${name}"? Esta ação não pode ser desfeita e excluirá todas as tarefas e projetos associados.`)) {
      setIsDeleting(true)
      await deleteClientAction(id)
      setIsDeleting(false) // Component might unmount, but good practice
    }
  }

  return (
    <div 
      onClick={handleDelete}
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive hover:bg-destructive hover:text-destructive-foreground ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <Trash className="mr-2 h-4 w-4" /> 
      {isDeleting ? 'Excluindo...' : 'Excluir'}
    </div>
  )
}
