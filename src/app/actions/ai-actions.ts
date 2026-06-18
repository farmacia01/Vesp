'use server';

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@/lib/supabase/server';

export async function generateImagePromptAction(clientId: string, scenario: string) {
  if (!process.env.OPENAI_API_KEY) {
    return { error: 'Chave de API da OpenAI não configurada.' };
  }

  const supabase = await createClient();

  // Fetch the client's AI context
  const { data: client, error } = await supabase
    .from('clients')
    .select('name, company, ai_context')
    .eq('id', clientId)
    .single();

  if (error || !client) {
    return { error: 'Cliente não encontrado ou sem contexto.' };
  }

  const context = client.ai_context || 'Nenhum contexto específico definido para este cliente.';

  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: `Você é um Diretor de Arte e Copywriter especialista no mercado digital brasileiro.
O usuário fornecerá um CENÁRIO que ele deseja promover e o CONTEXTO DA MARCA do cliente.
Sua missão é gerar uma proposta completa para um Flyer Promocional com estilo 3D moderno.

A arte deve ter a estética de "Flyer Promocional de Varejo", com elementos 3D dinâmicos (como ícones arredondados flutuantes), tipografia em grande destaque, cores vibrantes (foco nas cores da marca) e alto contraste.

Responda SEMPRE em Português do Brasil (pt-BR) no seguinte formato:

**📝 Copy da Arte:**
- **Título principal (Chamada forte):** [texto curto e impactante]
- **Texto de apoio:** [subtítulo direto]
- **Legenda (Redes Sociais):** [texto persuasivo focado em conversão com CTA e hashtags]

**🎨 Descrição Visual (Estilo Flyer 3D):**
[Descreva os detalhes da imagem focando em elementos 3D estilo Blender/Cinema 4D, objetos saltando da tela, paleta de cores forte com gradientes, iluminação de estúdio volumétrica e layout limpo focado na conversão.]`,
      prompt: `
CONTEXTO DA MARCA:
Nome do Cliente: ${client.name} / ${client.company || ''}
Informações da Marca / Nicho: ${context}

CENÁRIO DESEJADO:
${scenario}

Crie a Copy para o Brasil e o roteiro visual da arte no estilo Flyer Promocional 3D.`,
    });

    return { prompt: text };
  } catch (err: any) {
    console.error('AI Generation Error:', err);
    return { error: 'Ocorreu um erro ao gerar o prompt. Verifique sua chave de API e tente novamente.' };
  }
}
