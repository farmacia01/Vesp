'use client';

import { useState } from 'react';
import { Settings2, Save, Check, Loader2, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveWhatsAppConfigAction } from '@/app/actions/whatsapp-actions';

interface Props {
  initialInstance: string;
  initialApiUrl: string;
  initialToken: string;
}

export function InstanceConfig({ initialInstance, initialApiUrl, initialToken }: Props) {
  const [instance, setInstance] = useState(initialInstance);
  const [apiUrl, setApiUrl]     = useState(initialApiUrl || 'https://free.uazapi.com');
  const [token, setToken]       = useState(initialToken);
  const [loading, setLoading]   = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const hasConfig = !!initialInstance;

  async function handleSave() {
    if (!instance.trim() || !apiUrl.trim()) return;
    setLoading(true);
    setError(null);
    setSaved(false);
    const res = await saveWhatsAppConfigAction({ instance, apiUrl, token });
    if (res.error) setError(res.error);
    else setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Settings2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Instância UaiZap</h3>
            <p className="text-xs text-muted-foreground">Salva no banco e reutilizada em todos os envios</p>
          </div>
        </div>
        {hasConfig && (
          <span className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-[11px] font-medium text-primary">
            <Wifi className="h-3 w-3" />
            Configurada
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Nome da instância</Label>
          <Input
            placeholder="minha-instancia"
            value={instance}
            onChange={e => setInstance(e.target.value)}
            className="bg-muted border-border focus-visible:ring-primary text-sm font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">URL base da API</Label>
          <Input
            placeholder="https://free.uazapi.com"
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
            className="bg-muted border-border focus-visible:ring-primary text-sm font-mono"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Token da instância</Label>
        <Input
          type="password"
          placeholder="••••••••••••••••"
          value={token}
          onChange={e => setToken(e.target.value)}
          className="bg-muted border-border focus-visible:ring-primary text-sm font-mono"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/25 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <Button
        onClick={handleSave}
        disabled={loading || !instance.trim() || !apiUrl.trim()}
        size="sm"
        className="bg-primary text-primary-foreground font-semibold shadow-sm hover:brightness-105 disabled:opacity-40"
      >
        {loading
          ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Salvando…</>
          : saved
          ? <><Check className="mr-2 h-3.5 w-3.5" /> Salvo!</>
          : <><Save className="mr-2 h-3.5 w-3.5" /> Salvar configuração</>}
      </Button>
    </div>
  );
}
