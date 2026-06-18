'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateWhatsappConfig(formData: FormData) {
  const supabase = await createClient();

  const instance = formData.get('instance') as string;
  const api_url = formData.get('api_url') as string;
  const token = formData.get('token') as string;

  const { error } = await supabase
    .from('whatsapp_config')
    .upsert({
      id: 'default',
      instance,
      api_url,
      token,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error updating whatsapp config:', error);
    return { success: false, error: 'Erro ao salvar configurações do WhatsApp.' };
  }

  revalidatePath('/settings');
  return { success: true };
}
