import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { LayoutDashboard, CheckSquare, History } from 'lucide-react';

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from('clients')
    .select('name, company')
    .eq('id', slug)
    .single();

  if (!client) {
    notFound();
  }

  return (
    <div className="min-h-screen min-h-dvh bg-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black text-primary tracking-tighter uppercase">Vesp</h1>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <Link href={`/portal/${slug}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                <LayoutDashboard className="h-4 w-4" /> Resumo
              </Link>
              <Link href={`/portal/${slug}/tasks`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                <CheckSquare className="h-4 w-4" /> Tarefas
              </Link>
              <Link href={`/portal/${slug}/timeline`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                <History className="h-4 w-4" /> Timeline
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">{client.name}</p>
              <p className="text-xs text-muted-foreground">{client.company || 'Cliente'}</p>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 lg:px-6 py-6 lg:py-8 pb-20 md:pb-8">
        {children}
      </main>
      {/* Mobile bottom navigation for portal */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-md md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around h-14">
          <Link href={`/portal/${slug}`} className="flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] px-2 py-1 text-muted-foreground hover:text-foreground transition-colors">
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px] leading-tight font-medium">Resumo</span>
          </Link>
          <Link href={`/portal/${slug}/tasks`} className="flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] px-2 py-1 text-muted-foreground hover:text-foreground transition-colors">
            <CheckSquare className="h-5 w-5" />
            <span className="text-[10px] leading-tight font-medium">Tarefas</span>
          </Link>
          <Link href={`/portal/${slug}/timeline`} className="flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] px-2 py-1 text-muted-foreground hover:text-foreground transition-colors">
            <History className="h-5 w-5" />
            <span className="text-[10px] leading-tight font-medium">Timeline</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
