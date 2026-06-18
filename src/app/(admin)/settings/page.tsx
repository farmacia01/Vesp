import { createClient } from '@/lib/supabase/server';
import { SettingsClient } from './settings-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

export default async function SettingsPage() {
  const supabase = await createClient();

  // Load User Profile
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data;
  }

  // Load WhatsApp Config
  const { data: whatsappConfig } = await supabase
    .from('whatsapp_config')
    .select('*')
    .eq('id', 'default')
    .single();

  return (
    <div className="flex-1 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Configurações</h2>
      </div>

      <div className="grid gap-6">
        {/* Profile Card (Read Only for now) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Sua Conta
            </CardTitle>
            <CardDescription>
              Informações vinculadas ao seu usuário do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Nome</p>
                <p className="text-base">{profile?.name || user?.user_metadata?.name || 'Administrador'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">E-mail</p>
                <p className="text-base">{user?.email || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Função (Role)</p>
                <p className="text-base capitalize">{profile?.role || 'admin'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Integration Form */}
        <SettingsClient initialConfig={whatsappConfig} />
      </div>
    </div>
  );
}
