'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Send, Sparkles, User as UserIcon, Bot, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';

export function VespAiClient({ clients }: { clients: any[] }) {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      data: {
        clientId: selectedClient,
      }
    }
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClient) {
      alert("Por favor, selecione um cliente primeiro para que a IA possa adaptar o contexto.");
      return;
    }
    handleSubmit(e);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-160px)] min-h-[500px]">
      {/* Header & Settings */}
      <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Vesp Studio AI</h3>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select 
            className="flex h-10 w-full sm:w-[250px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            <option value="" disabled>Selecione o Cliente Alvo...</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name} ({client.company})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60">
            <Sparkles className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground max-w-sm">
              Selecione um cliente acima e descreva o que você precisa. Ex: "Crie um prompt para um flyer de dia das mães" ou "Faça uma copy de WhatsApp para cobrar inadimplentes".
            </p>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              
              <div className={`relative group max-w-[85%] rounded-2xl p-4 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 border'}`}>
                {m.role === 'assistant' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                    onClick={() => copyToClipboard(m.content, m.id)}
                  >
                    {copiedId === m.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                )}
                <div className={`prose prose-sm dark:prose-invert max-w-none ${m.role === 'user' ? 'text-primary-foreground' : ''}`}>
                  {m.role === 'user' ? m.content : <ReactMarkdown>{m.content}</ReactMarkdown>}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-4 w-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-muted/50 border rounded-2xl p-4 flex items-center gap-1">
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-75" />
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Digite o briefing da campanha ou da copy..."
            className="flex h-12 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || !selectedClient}
          />
          <Button type="submit" size="icon" className="h-12 w-12" disabled={isLoading || !selectedClient || !input.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
