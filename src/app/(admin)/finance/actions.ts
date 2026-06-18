'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function markInvoiceAsPaid(invoiceId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('invoices')
    .update({ 
      status: 'paid', 
      paid_at: new Date().toISOString() 
    })
    .eq('id', invoiceId);

  if (error) {
    console.error('Error marking invoice as paid:', error);
    return { success: false, error: 'Erro ao registrar pagamento' };
  }

  // Refresh page data
  revalidatePath('/finance');
  revalidatePath('/dashboard');
  
  return { success: true };
}

export async function generateMonthlyInvoices() {
  const supabase = await createClient();

  // 1. Fetch active clients with monthly_fee > 0
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('id, monthly_fee, due_day')
    .eq('status', 'active')
    .gt('monthly_fee', 0);

  if (clientsError || !clients) {
    console.error('Error fetching clients:', clientsError);
    return { success: false, error: 'Erro ao buscar clientes ativos' };
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // 2. Determine start and end of current month to check for existing invoices
  const startOfMonth = new Date(currentYear, currentMonth, 1).toISOString();
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();

  // 3. Fetch existing invoices for the current month
  const { data: existingInvoices, error: invoicesError } = await supabase
    .from('invoices')
    .select('client_id')
    .gte('due_date', startOfMonth)
    .lte('due_date', endOfMonth);

  if (invoicesError) {
    return { success: false, error: 'Erro ao buscar faturas existentes' };
  }

  const existingClientIds = new Set(existingInvoices?.map((inv) => inv.client_id));

  // 4. Prepare new invoices
  const newInvoices = [];
  for (const client of clients) {
    if (!existingClientIds.has(client.id)) {
      // Avoid impossible dates like Feb 30th
      const dueDay = Math.min(client.due_day || 5, new Date(currentYear, currentMonth + 1, 0).getDate());
      
      // Create due date at midnight UTC
      const dueDate = new Date(Date.UTC(currentYear, currentMonth, dueDay));
      
      newInvoices.push({
        client_id: client.id,
        amount: client.monthly_fee,
        due_date: dueDate.toISOString().split('T')[0], // YYYY-MM-DD
        status: 'pending',
      });
    }
  }

  // 5. Insert invoices
  if (newInvoices.length > 0) {
    const { error: insertError } = await supabase
      .from('invoices')
      .insert(newInvoices);

    if (insertError) {
      console.error('Error inserting invoices:', insertError);
      return { success: false, error: 'Erro ao gerar novas faturas' };
    }
  }

  revalidatePath('/finance');
  revalidatePath('/dashboard');

  return { 
    success: true, 
    generatedCount: newInvoices.length 
  };
}
