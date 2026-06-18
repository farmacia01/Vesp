'use client';

import { Logo } from './logo';
import { Menu } from 'lucide-react';
import { useMobileSidebar } from './mobile-sidebar-provider';

export function MobileHeader() {
  const { toggle } = useMobileSidebar();

  return (
    <header className="sticky top-0 z-30 flex md:hidden h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 px-4 backdrop-blur-md">
      <button
        onClick={toggle}
        aria-label="Abrir menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="absolute left-1/2 -translate-x-1/2 scale-90">
        <Logo />
      </div>

      {/* Placeholder to balance flex-between */}
      <div className="w-9 h-9" />
    </header>
  );
}
