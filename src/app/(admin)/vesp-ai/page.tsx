import { createClient } from '@/lib/supabase/server';
import { VespAiClient } from './vesp-ai-client';

export default async function VespAiPage() {
  const supabase = await createClient();

  // Fetch all active clients to populate the selector
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, company')
    .order('name');

  return (
    <div className="flex-1 flex flex-col h-full space-y-4 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Vesp AI</h2>
          <p className="text-muted-foreground">
            Seu assistente inteligente de Marketing, Design e Copywriting.
          </p>
        </div>
      </div>

      <VespAiClient clients={clients || []} />
    </div>
  );
}
