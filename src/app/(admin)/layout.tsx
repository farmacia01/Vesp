import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { BottomTabBar } from '@/components/layout/bottom-tab-bar';
import { MobileSidebarProvider } from '@/components/layout/mobile-sidebar-provider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileSidebarProvider>
      <div className="flex min-h-screen min-h-dvh relative text-foreground">
        <div className="app-backdrop" aria-hidden="true" />
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0 relative z-10">
          <Header />
          <main className="flex-1 overflow-auto px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8">
            {children}
          </main>
        </div>
        <BottomTabBar />
      </div>
    </MobileSidebarProvider>
  );
}
