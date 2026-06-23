import { createClient } from '@/lib/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VespAiClient } from './vesp-ai-client';
import { VespAIGenerator } from './client-component';
import { ImageGenerator } from './image-generator';
import { MessageSquare, FileText, ImageIcon } from 'lucide-react';

export default async function VespAiPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, company')
    .order('name');

  const clientList = clients || [];

  return (
    <div className="flex-1 flex flex-col space-y-4 max-w-6xl mx-auto w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Vesp AI</h2>
        <p className="text-muted-foreground">
          Assistente inteligente de Marketing, Design e Copywriting.
        </p>
      </div>

      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chat IA</span>
            <span className="sm:hidden">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="prompt" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Gerador de Prompt</span>
            <span className="sm:hidden">Prompt</span>
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Gerar Imagem</span>
            <span className="sm:hidden">Imagem</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 mt-4">
          <VespAiClient clients={clientList} />
        </TabsContent>

        <TabsContent value="prompt" className="mt-4">
          <VespAIGenerator clients={clientList} />
        </TabsContent>

        <TabsContent value="image" className="mt-4">
          <ImageGenerator clients={clientList} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
