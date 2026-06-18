'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTaskAction(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const client_id = formData.get('client_id') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as string || 'backlog'
  const priority = formData.get('priority') as string || 'medium'
  const due_date = formData.get('due_date') as string

  if (!title || !client_id) {
    return { error: 'Título e Cliente são obrigatórios.' }
  }

  const { error } = await supabase
    .from('tasks')
    .insert({
      title,
      client_id,
      description,
      status,
      priority,
      due_date: due_date ? due_date : null,
    })

  if (error) {
    console.error('Error creating task:', error)
    return { error: error.message }
  }

  revalidatePath('/calendar')
  revalidatePath('/dashboard')
  revalidatePath(`/clients/${client_id}`)
  return { success: true }
}

export async function updateTaskStatusAction(taskId: string, newStatus: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', taskId)

  if (error) {
    console.error('Error updating task status:', error)
    return { error: error.message }
  }

  revalidatePath('/calendar')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateTaskAction(taskId: string, formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const client_id = formData.get('client_id') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as string
  const priority = formData.get('priority') as string
  const due_date = formData.get('due_date') as string

  if (!title || !client_id) {
    return { error: 'Título e Cliente são obrigatórios.' }
  }

  const { error } = await supabase
    .from('tasks')
    .update({
      title,
      client_id,
      description,
      status,
      priority,
      due_date: due_date ? due_date : null,
    })
    .eq('id', taskId)

  if (error) {
    console.error('Error updating task:', error)
    return { error: error.message }
  }

  revalidatePath('/calendar')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteTaskAction(taskId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    console.error('Error deleting task:', error)
    return { error: error.message }
  }

  revalidatePath('/calendar')
  revalidatePath('/dashboard')
  return { success: true }
}
