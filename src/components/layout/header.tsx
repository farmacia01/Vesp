'use client';

import { Bell, Menu, Plus, Search } from 'lucide-react';
import { useMobileSidebar } from './mobile-sidebar-provider';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export function Header() {
  const { toggle } = useMobileSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Mobile menu */}
      <button
        onClick={toggle}
        aria-label="Abrir menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Global search — expands on desktop */}
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Buscar clientes, tarefas, mensagens…"
          className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
      </div>

      {/* Mobile search icon */}
      <button
        aria-label="Buscar"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
      >
        <Search className="h-[18px] w-[18px]" />
      </button>

      <div className="flex flex-1 items-center justify-end gap-1.5 md:flex-none">
        {/* Primary action — the most important action in the system */}
        <button className="mr-1 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-105 active:translate-y-px">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Cliente</span>
        </button>

        <ThemeToggle />

        {/* Notifications */}
        <button
          aria-label="Notificações"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        </button>

        {/* Avatar */}
        <button
          aria-label="Conta"
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary ring-1 ring-border transition-shadow hover:ring-primary/40"
        >
          EV
        </button>
      </div>
    </header>
  );
}
