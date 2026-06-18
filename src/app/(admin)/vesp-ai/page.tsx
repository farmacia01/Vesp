import { createClient } from '@/lib/supabase/server';
import { VespAIGenerator } from './client-component';
import { Sparkles } from 'lucide-react';

export default async function VespAIPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .order('name', { ascending: true });

  return (
    <div className="flex-1 space-y-4 max-w-4xl lg:mx-auto">
      <div className="flex items-center space-x-2">
        <Sparkles className="h-7 w-7 lg:h-8 lg:w-8 text-primary" />
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Vesp AI</h2>
      </div>
      <p className="text-muted-foreground text-base lg:text-lg">
        Gerador de Prompts ultra-precisos para Midjourney e DALL-E, alimentado pelo contexto salvo de cada cliente.
      </p>

      <div className="mt-8">
        <VespAIGenerator clients={clients || []} />
      </div>
    </div>
  );
}
