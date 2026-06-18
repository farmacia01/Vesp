import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CircleDot } from 'lucide-react';

export default async function PortalTimelinePage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient();
  const { slug } = await params;
  const clientId = slug;

  // Fetch timeline events
  const { data: events, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pt-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Histórico de Eventos</h2>
        <p className="text-muted-foreground mt-1">Acompanhe todas as atualizações importantes e entregas do seu projeto em tempo real.</p>
      </div>

      <div className="relative border-l-2 ml-4 pl-8 space-y-8 mt-12 pb-8">
        {events && events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="relative">
              <div className="absolute -left-[42px] top-1 bg-background p-1 rounded-full">
                <CircleDot className="h-5 w-5 text-primary" />
              </div>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                    <h3 className="font-bold text-lg leading-tight text-foreground/90">{event.title}</h3>
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-md">
                      {format(new Date(event.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg -ml-[2rem]">
            <p>Nenhum evento registrado ainda.</p>
            <p className="text-xs mt-2">As ações realizadas pela equipe aparecerão automaticamente aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
}
