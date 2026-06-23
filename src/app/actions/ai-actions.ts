'use server';

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const customOpenai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type ImageFormat = 'square' | 'portrait' | 'landscape'

const FORMAT_SIZES: Record<ImageFormat, '1024x1024' | '1024x1792' | '1792x1024'> = {
  square: '1024x1024',
  portrait: '1024x1792',
  landscape: '1792x1024',
}

const FORMAT_LABELS: Record<ImageFormat, string> = {
  square: 'Feed Quadrado (1:1)',
  portrait: 'Story/Reels (9:16)',
  landscape: 'Banner (16:9)',
}

async function getClientContext(clientId: string) {
  const supabase = await createClient();
  const { data: client, error } = await supabase
    .from('clients')
    .select('name, company, ai_context')
    .eq('id', clientId)
    .single();
  if (error || !client) return null;
  return client;
}

export async function generateImagePromptAction(
  clientId: string,
  scenario: string,
  format: ImageFormat = 'square',
  referenceImageBase64?: string,
) {
  if (!process.env.OPENAI_API_KEY) {
    return { error: 'Chave de API da OpenAI não configurada.' };
  }

  const client = await getClientContext(clientId);
  if (!client) return { error: 'Cliente não encontrado ou sem contexto.' };

  const context = client.ai_context || 'Nenhum contexto específico definido para este cliente.';
  const formatLabel = FORMAT_LABELS[format];

  let referenceDescription = '';
  if (referenceImageBase64) {
    try {
      const visionRes = await openaiClient.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analise esta imagem de referência (logo ou arte da marca). Descreva de forma técnica: paleta de cores exata (hex ou nome), estilo visual, fontes aparentes, elementos gráficos marcantes. Seja conciso (máx 3 linhas).',
              },
              {
                type: 'image_url',
                image_url: { url: referenceImageBase64, detail: 'low' },
              },
            ],
          },
        ],
        max_tokens: 200,
      });
      referenceDescription = visionRes.choices[0]?.message?.content ?? '';
    } catch {
      // skip reference if vision fails
    }
  }

  try {
    const { text } = await generateText({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      model: customOpenai('gpt-4o-mini') as any,
      system: `Você é um Diretor de Arte e Copywriter especialista no mercado digital brasileiro.
O usuário fornecerá um CENÁRIO que ele deseja promover e o CONTEXTO DA MARCA do cliente.
Sua missão é gerar uma proposta completa para um Flyer Promocional com estilo 3D moderno.

Formato alvo: ${formatLabel}
A arte deve ter a estética de "Flyer Promocional de Varejo", com elementos 3D dinâmicos (como ícones arredondados flutuantes), tipografia em grande destaque, cores vibrantes (foco nas cores da marca) e alto contraste.

Responda SEMPRE em Português do Brasil (pt-BR) no seguinte formato:

**📝 Copy da Arte:**
- **Título principal (Chamada forte):** [texto curto e impactante]
- **Texto de apoio:** [subtítulo direto]
- **Legenda (Redes Sociais):** [texto persuasivo focado em conversão com CTA e hashtags]

**🎨 Descrição Visual (Estilo Flyer 3D):**
[Descreva os detalhes da imagem focando em elementos 3D estilo Blender/Cinema 4D, objetos saltando da tela, paleta de cores forte com gradientes, iluminação de estúdio volumétrica e layout limpo. Considere o formato ${formatLabel} na composição.]

**🤖 Prompt para IA de Imagem (EN):**
[Prompt em inglês técnico otimizado para DALL-E 3 / Midjourney, incluindo estilo, iluminação, composição e proporção para formato ${formatLabel}. Máx 120 palavras.]`,
      prompt: `
CONTEXTO DA MARCA:
Nome do Cliente: ${client.name} / ${client.company || ''}
Informações da Marca / Nicho: ${context}
${referenceDescription ? `\nAnálise do Material de Referência (Logo/Arte):\n${referenceDescription}` : ''}

CENÁRIO DESEJADO:
${scenario}

FORMATO: ${formatLabel}

Crie a Copy para o Brasil e o roteiro visual da arte no estilo Flyer Promocional 3D.`,
    });

    return { prompt: text };
  } catch (err: unknown) {
    console.error('AI Generation Error:', err);
    return { error: `Erro interno: ${err instanceof Error ? err.message : String(err)}` };
  }
}

export async function generateImageAction(params: {
  clientId: string
  promptText: string
  format: ImageFormat
  referenceImageBase64?: string
}) {
  if (!process.env.OPENAI_API_KEY) {
    return { error: 'Chave de API da OpenAI não configurada.' };
  }

  const { clientId, promptText, format, referenceImageBase64 } = params;
  const client = await getClientContext(clientId);
  if (!client) return { error: 'Cliente não encontrado.' };

  const context = client.ai_context || '';
  const size = FORMAT_SIZES[format];

  let referenceDescription = '';
  if (referenceImageBase64) {
    try {
      const visionRes = await openaiClient.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Descreva tecnicamente esta imagem de referência para uso em prompt de IA: cores, estilo visual, elementos gráficos. Máx 2 linhas em inglês.',
              },
              {
                type: 'image_url',
                image_url: { url: referenceImageBase64, detail: 'low' },
              },
            ],
          },
        ],
        max_tokens: 150,
      });
      referenceDescription = visionRes.choices[0]?.message?.content ?? '';
    } catch {
      // skip
    }
  }

  // Build final prompt for DALL-E
  const dallePrompt = await generateText({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: customOpenai('gpt-4o-mini') as any,
    system: `You are an expert AI image prompt engineer specializing in commercial social media art for Brazilian market.
Convert the user's brief into a detailed DALL-E 3 prompt in English.
Requirements:
- 3D promotional flyer aesthetic, Blender/Cinema 4D style
- Vibrant colors, studio lighting, high contrast
- No text in the image (DALL-E handles text poorly)
- Aspect ratio: ${size}
- Brand context: ${client.name} — ${context}
${referenceDescription ? `- Visual reference: ${referenceDescription}` : ''}
Output ONLY the prompt, no explanations. Max 150 words.`,
    prompt: promptText,
  });

  try {
    const response = await openaiClient.images.generate({
      model: 'dall-e-3',
      prompt: dallePrompt.text,
      n: 1,
      size,
      quality: 'hd',
      response_format: 'url',
    });

    const imageUrl = response.data?.[0]?.url;
    const revisedPrompt = response.data?.[0]?.revised_prompt;

    if (!imageUrl) return { error: 'DALL-E não retornou imagem.' };

    return { imageUrl, revisedPrompt };
  } catch (err: unknown) {
    console.error('DALL-E Error:', err);
    return { error: `Erro ao gerar imagem: ${err instanceof Error ? err.message : String(err)}` };
  }
}
