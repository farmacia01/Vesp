'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, CalendarDays, Wallet, MessageCircle,
  Sparkles, Settings, Search, X, ChevronsUpDown, FileImage,
  FileText, BarChart3,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Logo } from './logo';
import { useMobileSidebar } from './mobile-sidebar-provider';

type NavItem = { name: string; href: string; icon: LucideIcon; badge?: string };

const primaryNav: NavItem[] = [
  { name: 'Dashboard',  href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes',   href: '/clients',   icon: Users },
  { name: 'Conteúdos',  href: '/contents',  icon: FileImage },
  { name: 'Calendário', href: '/calendar',  icon: CalendarDays },
  { name: 'Financeiro', href: '/finance',   icon: Wallet },
  { name: 'Contratos',  href: '/contracts', icon: FileText },
];

const workspaceNav: NavItem[] = [
  { name: 'WhatsApp', href: '/whatsapp', icon: MessageCircle },
  { name: 'Vesp AI',  href: '/vesp-ai',  icon: Sparkles },
];

const secondaryNav: NavItem[] = [
  { name: 'Relatórios',    href: '/reports',  icon: BarChart3 },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

function NavLink({ item, onClick }: { item: NavItem; onClick: () => void }) {
  const pathname = usePathname();
  const active = isActivePath(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={[
        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
        active
          ? 'bg-amber-50 dark:bg-amber-500/10 text-gray-800 dark:text-gray-100'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200',
      ].join(' ')}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
      <Icon
        className={[
          'h-[17px] w-[17px] shrink-0 transition-colors duration-150',
          active ? 'text-primary' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300',
        ].join(' ')}
      />
      <span className="flex-1 truncate">{item.name}</span>
      {item.badge && (
        <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-primary">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function SidebarBody({
  userEmail,
  onNavigate,
}: {
  userEmail: string | null;
  onNavigate: () => void;
}) {
  const name = userEmail ? userEmail.split('@')[0] : 'Conta';
  const initials = (userEmail ?? 'EV').slice(0, 2).toUpperCase();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center px-4 border-b border-gray-200 dark:border-gray-700/60">
        <Logo />
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-[13px] text-gray-400 dark:text-gray-500 transition-colors hover:border-primary/20 hover:text-gray-600"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left">Buscar…</span>
          <kbd className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-1.5 py-0.5 text-[10px] font-medium opacity-60">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 scrollbar-none space-y-5">
        <div className="space-y-0.5">
          {primaryNav.map((item) => (
            <NavLink key={item.href} item={item} onClick={onNavigate} />
          ))}
        </div>

        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Workspace
          </p>
          <div className="space-y-0.5">
            {workspaceNav.map((item) => (
              <NavLink key={item.href} item={item} onClick={onNavigate} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Análise
          </p>
          <div className="space-y-0.5">
            {secondaryNav.map((item) => (
              <NavLink key={item.href} item={item} onClick={onNavigate} />
            ))}
          </div>
        </div>
      </nav>

      {/* User profile */}
      <div className="border-t border-gray-200 dark:border-gray-700/60 p-3">
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/15 text-[10px] font-bold text-primary ring-1 ring-primary/20">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-gray-800 dark:text-gray-100">{name}</span>
            <span className="block truncate text-[11px] text-gray-400 dark:text-gray-500">
              {userEmail ?? 'Não autenticado'}
            </span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
        </button>
      </div>
    </div>
  );
}

export function SidebarClient({ userEmail }: { userEmail: string | null }) {
  const { isOpen, close } = useMobileSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800 lg:flex lg:flex-col">
        <SidebarBody userEmail={userEmail} onNavigate={() => {}} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[min(82vw,16rem)] flex-col border-r border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800 lg:hidden"
              style={{
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
              }}
            >
              <button
                onClick={close}
                aria-label="Fechar menu"
                className="absolute right-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarBody userEmail={userEmail} onNavigate={close} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
