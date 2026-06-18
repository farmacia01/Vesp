import { createClient } from '@/lib/supabase/server';
import { FileManagerClient } from './file-manager-client';
import { Folder, Users } from 'lucide-react';

export default async function ContentsPage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string; folder_id?: string }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const clientId = resolvedParams.client_id || null;
  const folderId = resolvedParams.folder_id || null;

  let items: any[] = [];
  let breadcrumbs: any[] = [{ name: 'Todos os Clientes', id: 'root' }];
  let currentClient = null;

  if (!clientId) {
    // 1. Root Level: Show all clients as folders
    const { data: clients } = await supabase.from('clients').select('*').order('name');
    if (clients) {
      items = clients.map(c => ({
        id: c.id,
        name: c.name,
        type: 'client_folder',
        isFolder: true,
      }));
    }
  } else {
    // 2. Inside a Client
    const { data: client } = await supabase.from('clients').select('*').eq('id', clientId).single();
    if (client) {
      currentClient = client;
      breadcrumbs.push({ name: client.name, id: `client_${client.id}`, client_id: client.id, folder_id: null });

      if (folderId) {
        // Fetch folder path for breadcrumbs (simplified, just fetch current folder name for now)
        const { data: currentFolder } = await supabase.from('content_folders').select('*').eq('id', folderId).single();
        if (currentFolder) {
          // Ideally we would recursively fetch parent folders, but for now we just show current
          if (currentFolder.parent_folder_id) {
             breadcrumbs.push({ name: '...', id: 'dots' });
          }
          breadcrumbs.push({ name: currentFolder.name, id: `folder_${currentFolder.id}`, client_id: client.id, folder_id: currentFolder.id });
        }
      }

      // Fetch Sub-folders
      const folderQuery = supabase.from('content_folders').select('*').eq('client_id', clientId);
      if (folderId) {
        folderQuery.eq('parent_folder_id', folderId);
      } else {
        folderQuery.is('parent_folder_id', null);
      }
      const { data: folders } = await folderQuery.order('name');

      // Fetch Files
      const fileQuery = supabase.from('content_files').select('*').eq('client_id', clientId);
      if (folderId) {
        fileQuery.eq('folder_id', folderId);
      } else {
        fileQuery.is('folder_id', null);
      }
      const { data: files } = await fileQuery.order('name');

      if (folders) {
        items = [...items, ...folders.map(f => ({ ...f, type: 'folder', isFolder: true }))];
      }
      if (files) {
        items = [...items, ...files.map(f => ({ ...f, type: f.type, isFolder: false }))];
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Conteúdos</h2>
          <p className="text-muted-foreground">
            Gerencie os arquivos e imagens separados por cliente.
          </p>
        </div>
      </div>

      <FileManagerClient 
        items={items} 
        breadcrumbs={breadcrumbs} 
        currentClientId={clientId}
        currentFolderId={folderId}
      />
    </div>
  );
}
