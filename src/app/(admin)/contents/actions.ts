'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createFolder(name: string, clientId: string, parentFolderId: string | null) {
  const supabase = await createClient();
  
  const { error } = await supabase.from('content_folders').insert({
    name,
    client_id: clientId,
    parent_folder_id: parentFolderId,
  });

  if (error) {
    console.error('Error creating folder:', error);
    return { success: false, error: 'Erro ao criar pasta.' };
  }

  revalidatePath('/contents');
  return { success: true };
}

export async function renameItem(id: string, newName: string, isFolder: boolean) {
  const supabase = await createClient();
  const table = isFolder ? 'content_folders' : 'content_files';

  const { error } = await supabase.from(table).update({ name: newName }).eq('id', id);

  if (error) {
    console.error('Error renaming item:', error);
    return { success: false, error: 'Erro ao renomear item.' };
  }

  revalidatePath('/contents');
  return { success: true };
}

export async function deleteItem(id: string, isFolder: boolean, storagePath?: string) {
  const supabase = await createClient();
  
  if (isFolder) {
    // Rely on ON DELETE CASCADE for DB records, but we'd theoretically need to delete storage files too.
    // For simplicity, just deleting the folder record. Production apps would clean up storage bucket recursively.
    const { error } = await supabase.from('content_folders').delete().eq('id', id);
    if (error) return { success: false, error: 'Erro ao excluir pasta.' };
  } else {
    // Delete from DB
    const { error: dbError } = await supabase.from('content_files').delete().eq('id', id);
    if (dbError) return { success: false, error: 'Erro ao excluir arquivo.' };
    
    // Delete from Storage
    if (storagePath) {
      await supabase.storage.from('contents').remove([storagePath]);
    }
  }

  revalidatePath('/contents');
  return { success: true };
}

export async function registerUploadedFile(
  name: string, 
  storagePath: string, 
  size: number, 
  type: string, 
  clientId: string, 
  folderId: string | null
) {
  const supabase = await createClient();

  const { error } = await supabase.from('content_files').insert({
    name,
    storage_path: storagePath,
    size,
    type,
    client_id: clientId,
    folder_id: folderId,
  });

  if (error) {
    console.error('Error registering file:', error);
    return { success: false, error: 'Erro ao registrar arquivo.' };
  }

  revalidatePath('/contents');
  return { success: true };
}
