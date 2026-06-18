import { createClient } from '@/lib/supabase/server';
import { SidebarClient } from './sidebar-client';

export async function Sidebar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <SidebarClient userEmail={user?.email || null} />;
}
