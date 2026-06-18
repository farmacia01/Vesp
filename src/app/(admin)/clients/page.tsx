import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Plus, Search, MoreHorizontal, FileEdit, Trash, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ClientDialog } from '@/components/clients/client-dialog';
import { ClientActionsDropdown } from '@/components/clients/client-actions-dropdown';
import { ClientDeleteButton } from '@/components/clients/client-delete-button';

export default async function ClientsPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string }>;
}) {
  const supabase = await createClient();
  const sp = searchParams ? await searchParams : {};
  const query = sp.query || '';

  let clientQuery = supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (query) {
    clientQuery = clientQuery.ilike('name', `%${query}%`);
  }

  const { data: clients } = await clientQuery;

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Clientes</h2>
        <div className="flex items-center space-x-2 shrink-0">
          <ClientDialog mode="create" />
        </div>
      </div>

      <div className="flex items-center py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar clientes..." className="pl-8" />
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Empresa</TableHead>
              <TableHead className="hidden md:table-cell">Plano Mensal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients && clients.length > 0 ? (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <Link href={`/clients/${client.id}`} className="hover:underline flex items-center gap-2">
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{client.company || '-'}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.monthly_fee)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                      {client.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ClientActionsDropdown client={client} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
