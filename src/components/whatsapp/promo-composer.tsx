'use client';

import { useState } from 'react';
import { Sparkles, Send, Copy, Check, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { improvePromoTextAction, sendWhatsAppAction } from '@/app/actions/whatsapp-actions';

interface Client { id: string; name: string }

interface Props {
  clients: Client[];
  savedInstance?: string;
  savedApiUrl?: string;
}

export function PromoComposer({ clients, savedInstance = '', savedApiUrl = 'https://free.uazapi.com' }: Props) {
  const [rawText, setRawText]   = useState('');
  const [improved, setImproved] = useState('');
  const [phone, setPhone]       = useState('');
  const [clientId, setClientId] = useState('');

  const [loadingAI, setLoadingAI]     = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);
  const [copied, setCopied]           = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState(false);

  const clientName = clients.find(c => c.id === clientId)?.name;

  async function handleImprove() {
    if (!rawText.trim()) return;
    setLoadingAI(true);
    setError(null);
    setImproved('');
    setSuccess(false);

    const res = await improvePromoTextAction(rawText, clientName);
    if (res.error) setError(res.error);
    else if (res.improved) setImproved(res.improved);
    setLoadingAI(false);
  }

  async function handleSend() {
    const textToSend = improved || rawText;
    if (!textToSend.trim() || !phone) return;
    setLoadingSend(true);
    setError(null);
    setSuccess(false);

    const res = await sendWhatsAppAction({ phone, message: textToSend, instance: savedInstance, apiUrl: savedApiUrl });
    if (res.error) setError(res.error);
    else setSuccess(true);
    setLoadingSend(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(improved || rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const textToSend = improved || rawText;
  const canSend    = !!textToSend.trim() && !!phone.trim() && !!savedInstance;

  return (
    <div className="space-y-4">
      {/* Step 1 — write promo */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">1</span>
          <h3 className="text-sm font-semibold text-foreground">Escreva sua promoção</h3>
        </div>

        {clients.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Cliente (opcional — personaliza o tom)</Label>
            <select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Sem cliente específico</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Texto da promoção</Label>
          <Textarea
            placeholder="Ex: Promoção de inverno! Casacos com 40% de desconto só hoje. Aproveite enquanto durar o estoque!"
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            className="min-h-[120px] resize-none bg-muted border-border text-sm focus-visible:ring-primary"
          />
        </div>

        <Button
          onClick={handleImprove}
          disabled={loadingAI || !rawText.trim()}
          className="w-full bg-primary text-primary-foreground font-semibold shadow-sm transition-all duration-200 hover:brightness-105"
        >
          {loadingAI
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Melhorando com IA…</>
            : <><Sparkles className="mr-2 h-4 w-4" /> Melhorar com IA</>}
        </Button>
      </div>

      {/* Step 2 — review improved text */}
      {(improved || loadingAI) && (
        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">2</span>
              <h3 className="text-sm font-semibold text-foreground">Texto melhorado pela IA</h3>
            </div>
            {improved && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            )}
          </div>

          {loadingAI && !improved
            ? <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Aguardando resposta da IA…
              </div>
            : <Textarea
                value={improved}
                onChange={e => setImproved(e.target.value)}
                className="min-h-[140px] resize-none bg-card border-primary/25 text-sm focus-visible:ring-primary"
              />
          }
        </div>
      )}

      {/* Step 3 — send */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">3</span>
          <h3 className="text-sm font-semibold text-foreground">Postar no Status</h3>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Número de destino</Label>
          <Input
            placeholder="5511999999999 (com DDI e DDD, sem + ou espaços)"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
            className="bg-muted border-border focus-visible:ring-primary text-sm font-mono"
          />
        </div>

        {/* Preview */}
        {textToSend && (
          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Conteúdo do status</p>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{textToSend}</p>
          </div>
        )}

        {!savedInstance && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-600 dark:text-amber-400">
            Configure a instância UaiZap no card acima antes de enviar.
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-primary/25 bg-primary/10 px-3 py-2.5 text-sm text-primary flex items-center gap-2">
            <Check className="h-4 w-4" />
            Postado no status com sucesso!
          </div>
        )}

        <Button
          onClick={handleSend}
          disabled={loadingSend || !canSend}
          className="w-full bg-primary text-primary-foreground font-semibold shadow-sm transition-all duration-200 hover:brightness-105 disabled:opacity-40"
        >
          {loadingSend
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando…</>
            : <><MessageSquare className="mr-2 h-4 w-4" /> Postar no Status</>}
        </Button>
      </div>
    </div>
  );
}
