import { createClient } from '@/lib/supabase/server';
import { PromoComposer } from '@/components/whatsapp/promo-composer';
import { InstanceConfig } from '@/components/whatsapp/instance-config';
import { getWhatsAppConfigAction } from '@/app/actions/whatsapp-actions';
import { MessageSquare } from 'lucide-react';

export default async function WhatsAppPage() {
  const supabase = await createClient();
  const [{ data: clients }, config] = await Promise.all([
    supabase.from('clients').select('id, name').order('name', { ascending: true }),
    getWhatsAppConfigAction(),
  ]);

  return (
    <div className="flex-1 space-y-4 max-w-2xl lg:mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 border border-primary/25">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">WhatsApp Status</h2>
          <p className="text-sm text-muted-foreground">Configure sua instância e publique nos status via n8n</p>
        </div>
      </div>

      <InstanceConfig
        initialInstance={config.instance}
        initialApiUrl={config.apiUrl}
        initialToken={config.token}
      />

      {/* Flow indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 border border-border rounded-xl px-4 py-2.5">
        <span className="text-foreground font-medium">Fluxo:</span>
        <span>Você escreve</span>
        <span className="text-primary">→</span>
        <span>IA melhora o texto</span>
        <span className="text-primary">→</span>
        <span>Você revisa</span>
        <span className="text-primary">→</span>
        <span>n8n posta no status</span>
      </div>

      <PromoComposer
        clients={clients || []}
        savedInstance={config.instance}
        savedApiUrl={config.apiUrl}
      />
    </div>
  );
}
