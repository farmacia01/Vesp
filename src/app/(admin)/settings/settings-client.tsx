'use client';

import { useTransition, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { updateWhatsappConfig } from './actions';

interface WhatsappConfig {
  instance: string | null;
  api_url: string | null;
  token: string | null;
}

export function SettingsClient({ initialConfig }: { initialConfig: WhatsappConfig | null }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await updateWhatsappConfig(formData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Configurações do WhatsApp salvas com sucesso!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro desconhecido.' });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integração com WhatsApp</CardTitle>
        <CardDescription>
          Configure as credenciais da API do WhatsApp para permitir que a Evo automaze mensagens e cobranças.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="api_url" className="text-sm font-medium leading-none">URL da API</label>
            <input
              id="api_url"
              name="api_url"
              type="url"
              defaultValue={initialConfig?.api_url || 'https://free.uazapi.com'}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="instance" className="text-sm font-medium leading-none">Nome da Instância (Instance ID)</label>
            <input
              id="instance"
              name="instance"
              type="text"
              defaultValue={initialConfig?.instance || ''}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="ex: vesp-agency-01"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="token" className="text-sm font-medium leading-none">Token Global / Apikey</label>
            <input
              id="token"
              name="token"
              type="password"
              defaultValue={initialConfig?.token || ''}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Insira o seu token de segurança"
              required
            />
          </div>
          
          {message && (
            <div className={`p-3 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-success/20 text-success-foreground' : 'bg-destructive/20 text-destructive-foreground'}`}>
              {message.text}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Configurações
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
