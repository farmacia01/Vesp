'use server';

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@/lib/supabase/server';

export async function getWhatsAppConfigAction() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('whatsapp_config')
    .select('instance, api_url, token')
    .eq('id', 'default')
    .single();
  return {
    instance: data?.instance ?? '',
    apiUrl: data?.api_url ?? 'https://free.uazapi.com',
    token: data?.token ?? '',
  };
}

export async function saveWhatsAppConfigAction(config: { instance: string; apiUrl: string; token: string }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('whatsapp_config')
    .upsert({ id: 'default', instance: config.instance, api_url: config.apiUrl, token: config.token, updated_at: new Date().toISOString() });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function improvePromoTextAction(text: string, clientName?: string) {
  if (!text.trim()) return { error: 'Digite o texto da promoção.' };
  if (!process.env.OPENAI_API_KEY) return { error: 'Chave OpenAI não configurada.' };

  try {
    const { text: improved } = await generateText({
      model: openai('gpt-4o-mini'),
      system: `Você é um especialista em copywriting para WhatsApp de agências de marketing.
Reescreva a promoção recebida deixando o texto mais persuasivo, natural e adequado para WhatsApp.
Use emojis estrategicamente (2-4 no máximo), linguagem direta e crie urgência quando aplicável.
Mantenha o texto conciso (máximo 4 parágrafos curtos).
Responda APENAS com o texto final, sem introduções ou explicações.`,
      prompt: `${clientName ? `Cliente: ${clientName}\n` : ''}Promoção original:\n${text}`,
    });
    return { improved };
  } catch (err: any) {
    return { error: 'Erro ao chamar OpenAI. Verifique a chave de API.' };
  }
}

export async function sendWhatsAppAction(payload: {
  phone: string;
  message: string;
  instance: string;
  apiUrl: string;
}) {
  const { phone, message, instance, apiUrl } = payload;

  if (!phone || !message || !instance || !apiUrl) {
    return { error: 'Preencha todos os campos antes de enviar.' };
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n-production-a73f.up.railway.app/webhook/evosm-whatsapp';

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message, instance, apiUrl }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { error: `Webhook retornou ${res.status}: ${body}` };
    }

    return { ok: true };
  } catch (err: any) {
    return { error: `Falha ao contatar o webhook: ${err.message}` };
  }
}
