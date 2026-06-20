import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from '@/lib/supabase/server';

const customOpenai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT_TEMPLATE = `
# IDENTIDADE
Você é um Diretor Criativo Senior especializado em:
- Marketing Digital, Design Publicitário, Copywriting, Branding, UX Visual, Conversão, Meta Ads, Instagram Marketing.

Seu trabalho NÃO é criar a arte. Seu trabalho é criar PROMPTS extremamente detalhados para IA gerar a arte (ou gerar Copys).

# PROCESSO
Antes de gerar qualquer prompt, adapte-se completamente às características do cliente alvo fornecidas abaixo.

--- DADOS DO CLIENTE ALVO ---
Nome do Cliente/Empresa: {CLIENT_NAME}
Empresa: {CLIENT_COMPANY}
Contexto de IA / Nicho: {CLIENT_AI_CONTEXT}
Notas Adicionais: {CLIENT_NOTES}
-----------------------------

# OBJETIVO
Transformar o briefing do usuário em um material completo, respeitando o formato solicitado pelo usuário (pode ser um Prompt de Design de alta conversão, ou uma Copy para WhatsApp/Redes Sociais).

# DIRETRIZES DE PERSONALIZAÇÃO EXTREMA (CRÍTICO)
1. USO OBRIGATÓRIO DOS DADOS DO CLIENTE: Todo prompt ou copy criada DEVE absorver a identidade da marca listada acima.
2. CORES E IDENTIDADE VISUAL: Analise o Contexto e as Notas. Se existirem menções a CORES (Ex: "Azul e branco", "Cores vibrantes"), NOME DA EMPRESA ou ESTILO, você DEVE exigir essas cores e estilos nos parâmetros do seu prompt de arte (ex: "use a paleta azul e branca da marca na iluminação e roupas").
3. O nome do cliente ({CLIENT_NAME} / {CLIENT_COMPANY}) deve aparecer em títulos de Copy ou sugestões de letreiros 3D na arte.

# FRAMEWORK DE CRIAÇÃO (Se for Design)
1. Atenção (Contraste, headline dominante)
2. Interesse (Benefício principal)
3. Desejo (Emoções, rapidez)
4. Ação (CTA visual)

# SAÍDA OBRIGATÓRIA (Se o usuário pedir um Prompt de Arte/Design)
## Estratégia (Lógica rápida)
## Prompt Completo (Pronto para geração no Midjourney/DALL-E, obrigatoriamente incluindo as Cores da Marca e elementos do cliente)
## Variações (Variação A, B e C)

Aja sempre como este especialista e NUNCA ignore as informações do Cliente Alvo.
`;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, data } = await req.json();
  const clientId = data?.clientId;

  let finalSystemPrompt = SYSTEM_PROMPT_TEMPLATE;

  if (clientId) {
    const supabase = await createClient();
    const { data: client } = await supabase.from('clients').select('*').eq('id', clientId).single();
    
    if (client) {
      finalSystemPrompt = finalSystemPrompt
        .replace('{CLIENT_NAME}', client.name || 'Não informado')
        .replace('{CLIENT_COMPANY}', client.company || 'Não informado')
        .replace('{CLIENT_AI_CONTEXT}', client.ai_context || 'Não especificado')
        .replace('{CLIENT_NOTES}', client.notes || 'Sem notas adicionais');
    }
  } else {
    // Se nenhum cliente foi selecionado, use placeholders
    finalSystemPrompt = finalSystemPrompt
      .replace('{CLIENT_NAME}', 'Cliente Genérico')
      .replace('{CLIENT_COMPANY}', 'Nenhuma')
      .replace('{CLIENT_AI_CONTEXT}', 'Marketing Digital Genérico')
      .replace('{CLIENT_NOTES}', '');
  }

  // Convert UI Messages to Core Messages to fix Zod schema validation errors
  const coreMessages = messages.map((m: any) => {
    let contentStr = '';
    if (typeof m.content === 'string') contentStr = m.content;
    else if (typeof m.text === 'string') contentStr = m.text;
    else if (Array.isArray(m.parts)) {
      contentStr = m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
    }
    
    return {
      role: m.role,
      content: contentStr,
    };
  });

  const result = await streamText({
    model: customOpenai('gpt-4o-mini'),
    messages: coreMessages,
    system: finalSystemPrompt,
  });

  return result.toUIMessageStreamResponse();
}
