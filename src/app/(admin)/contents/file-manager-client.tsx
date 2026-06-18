'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, File as FileIcon, Image as ImageIcon, Video, Upload, MoreVertical, Plus, Edit2, Trash2, ChevronRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { createFolder, renameItem, deleteItem, registerUploadedFile } from './actions';
import { createClient } from '@/lib/supabase/client';

interface FileManagerProps {
  items: any[];
  breadcrumbs: any[];
  currentClientId: string | null;
  currentFolderId: string | null;
}

export function FileManagerClient({ items, breadcrumbs, currentClientId, currentFolderId }: FileManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Dialog States
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  
  const [renameOpen, setRenameOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<any>(null);
  const [newName, setNewName] = useState('');

  const [uploading, setUploading] = useState(false);

  const handleNavigate = (item: any) => {
    if (item.type === 'client_folder') {
      router.push(`/contents?client_id=${item.id}`);
    } else if (item.isFolder) {
      router.push(`/contents?client_id=${currentClientId}&folder_id=${item.id}`);
    } else {
      // It's a file, maybe preview or download
      const supabase = createClient();
      const { data } = supabase.storage.from('contents').getPublicUrl(item.storage_path);
      window.open(data.publicUrl, '_blank');
    }
  };

  const handleBreadcrumbClick = (bc: any) => {
    if (bc.id === 'root') router.push('/contents');
    else if (bc.id === 'dots') return;
    else router.push(`/contents?client_id=${bc.client_id}${bc.folder_id ? `&folder_id=${bc.folder_id}` : ''}`);
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim() || !currentClientId) return;
    startTransition(async () => {
      await createFolder(folderName, currentClientId, currentFolderId);
      setNewFolderOpen(false);
      setFolderName('');
    });
  };

  const handleRename = async () => {
    if (!newName.trim() || !itemToRename) return;
    startTransition(async () => {
      await renameItem(itemToRename.id, newName, itemToRename.isFolder);
      setRenameOpen(false);
      setItemToRename(null);
      setNewName('');
    });
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Deseja realmente excluir ${item.name}?`)) return;
    startTransition(async () => {
      await deleteItem(item.id, item.isFolder, item.storage_path);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentClientId) return;

    setUploading(true);
    const supabase = createClient();
    
    // Generate unique path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${currentClientId}/${currentFolderId ? currentFolderId + '/' : ''}${fileName}`;

    const { data, error } = await supabase.storage
      .from('contents')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error', error);
      alert('Erro no upload');
      setUploading(false);
      return;
    }

    // Register in DB
    await registerUploadedFile(
      file.name,
      filePath,
      file.size,
      file.type,
      currentClientId,
      currentFolderId
    );

    setUploading(false);
    e.target.value = ''; // Reset input
  };

  const getIcon = (item: any) => {
    if (item.isFolder) return <Folder className="h-10 w-10 text-blue-500 fill-blue-500/20" />;
    if (item.type?.startsWith('image/')) return <ImageIcon className="h-10 w-10 text-orange-500" />;
    if (item.type?.startsWith('video/')) return <Video className="h-10 w-10 text-purple-500" />;
    return <FileIcon className="h-10 w-10 text-gray-500" />;
  };

  return (
    <Card className="flex flex-col h-full min-h-[500px]">
      {/* Top Bar / Breadcrumbs */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/20">
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((bc, idx) => (
            <div key={bc.id} className="flex items-center gap-2">
              <button 
                onClick={() => handleBreadcrumbClick(bc)}
                className="hover:underline font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {bc.name}
              </button>
              {idx < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {currentClientId && (
            <>
              <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
                <DialogTrigger render={
                  <Button variant="outline" size="sm" disabled={isPending || uploading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Pasta
                  </Button>
                } />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Pasta</DialogTitle>
                  </DialogHeader>
                  <input
                    autoFocus
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Nome da pasta"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  />
                  <DialogFooter>
                    <Button onClick={handleCreateFolder} disabled={isPending}>Criar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button size="sm" className="relative" disabled={isPending || uploading}>
                {uploading ? (
                  <span className="animate-pulse">Enviando...</span>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Fazer Upload
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleFileUpload}
                    />
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear {itemToRename?.isFolder ? 'Pasta' : 'Arquivo'}</DialogTitle>
          </DialogHeader>
          <input
            autoFocus
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          />
          <DialogFooter>
            <Button onClick={handleRename} disabled={isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full h-32 flex items-center justify-center text-muted-foreground">
            {currentClientId ? 'Esta pasta está vazia.' : 'Nenhum cliente cadastrado.'}
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item.id} 
              className="group relative flex flex-col items-center p-4 border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleNavigate(item)}
            >
              {/* Context Menu for Files/Folders (Not for Client Root) */}
              {item.type !== 'client_folder' && (
                <div 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    } />
                    <DropdownMenuContent align="end">
                      {!item.isFolder && (
                        <DropdownMenuItem onClick={() => handleNavigate(item)}>
                          <Download className="h-4 w-4 mr-2" /> Visualizar / Baixar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => { setItemToRename(item); setNewName(item.name); setRenameOpen(true); }}>
                        <Edit2 className="h-4 w-4 mr-2" /> Renomear
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(item)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {getIcon(item)}
              
              <span className="mt-3 text-sm font-medium text-center truncate w-full px-2" title={item.name}>
                {item.name}
              </span>
              {!item.isFolder && item.size && (
                <span className="text-xs text-muted-foreground mt-1">
                  {Math.round(item.size / 1024)} KB
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
