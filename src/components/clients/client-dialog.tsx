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
import { Plus, FileEdit } from 'lucide-react'
import { ClientForm } from './client-form'

interface ClientDialogProps {
  client?: any
  mode?: 'create' | 'edit'
}

export function ClientDialog({ client, mode = 'create' }: ClientDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {mode === 'create' ? (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
          </Button>
        ) : (
          <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground cursor-pointer">
            <FileEdit className="mr-2 h-4 w-4" /> Editar
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Cadastrar Novo Cliente' : 'Editar Cliente'}</DialogTitle>
        </DialogHeader>
        <ClientForm initialData={client} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
