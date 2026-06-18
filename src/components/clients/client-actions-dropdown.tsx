'use client'

import { MoreHorizontal, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ClientDialog } from './client-dialog'
import { ClientDeleteButton } from './client-delete-button'

export function ClientActionsDropdown({ client }: { client: any }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
        <span className="sr-only">Abrir menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuItem>
          <Link href={`/clients/${client.id}`} className="cursor-pointer w-full flex items-center">
            <ArrowRight className="mr-2 h-4 w-4" /> Detalhes
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-0">
          <ClientDialog mode="edit" client={client} />
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive p-0">
          <ClientDeleteButton id={client.id} name={client.name} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
