'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const company = formData.get('company') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const instagram = formData.get('instagram') as string
  const monthly_fee = parseFloat((formData.get('monthly_fee') as string) || '0')
  const due_day = parseInt((formData.get('due_day') as string) || '5')
  const status = formData.get('status') as 'active' | 'inactive'
  const notes = formData.get('notes') as string
  const ai_context = formData.get('ai_context') as string

  if (!name) {
    return { error: 'O nome do cliente é obrigatório.' }
  }

  const { error } = await supabase
    .from('clients')
    .insert({
      name,
      company,
      email,
      phone,
      instagram,
      monthly_fee,
      due_day,
      status: status || 'active',
      notes,
      ai_context,
    })

  if (error) {
    console.error('Error creating client:', error)
    return { error: error.message }
  }

  revalidatePath('/clients')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateClientAction(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const company = formData.get('company') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const instagram = formData.get('instagram') as string
  const monthly_fee = parseFloat((formData.get('monthly_fee') as string) || '0')
  const due_day = parseInt((formData.get('due_day') as string) || '5')
  const status = formData.get('status') as 'active' | 'inactive'
  const notes = formData.get('notes') as string
  const ai_context = formData.get('ai_context') as string

  if (!name) {
    return { error: 'O nome do cliente é obrigatório.' }
  }

  const { error } = await supabase
    .from('clients')
    .update({
      name,
      company,
      email,
      phone,
      instagram,
      monthly_fee,
      due_day,
      status: status || 'active',
      notes,
      ai_context,
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating client:', error)
    return { error: error.message }
  }

  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteClientAction(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting client:', error)
    return { error: error.message }
  }

  revalidatePath('/clients')
  revalidatePath('/dashboard')
  redirect('/clients')
}
