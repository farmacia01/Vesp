'use client';

import { Bell, Menu, Plus, Search } from 'lucide-react';
import { useMobileSidebar } from './mobile-sidebar-provider';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export function Header() {
  const { toggle } = useMobileSidebar();

  return (
    <header className="sticky top-0 z-30 hidden md:flex h-16 items-center gap-3 border-b border-gray-200 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Mobile hamburger */}
      <button
        onClick={toggle}
        aria-label="Abrir menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Global search */}
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="search"
          placeholder="Buscar clientes, tarefas…"
          className="h-9 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-9 pr-3 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
        />
      </div>

      {/* Mobile search icon */}
      <button
        aria-label="Buscar"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
      >
        <Search className="h-[18px] w-[18px]" />
      </button>

      <div className="flex flex-1 items-center justify-end gap-1.5 md:flex-none">
        {/* Primary CTA */}
        <button className="mr-1 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-105 active:translate-y-px">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Cliente</span>
        </button>

        <ThemeToggle />

        {/* Notifications */}
        <button
          aria-label="Notificações"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-white dark:ring-gray-900" />
        </button>

        {/* Divider */}
        <span className="mx-0.5 h-6 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Avatar */}
        <button
          aria-label="Conta"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/15 text-[11px] font-semibold text-primary ring-1 ring-primary/20 transition-shadow hover:ring-primary/40"
        >
          EV
        </button>
      </div>
    </header>
  );
}
