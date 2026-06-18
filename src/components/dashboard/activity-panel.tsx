import { Bell, CheckCircle2, Clock, MessageSquare, TrendingUp, User } from 'lucide-react';

const notifications = [
  { id: 1, name: 'Lucas Mendes', action: 'aprovou o layout do cliente', time: '2m', avatar: 'LM', color: 'bg-[#199349]/20 text-[#199349]' },
  { id: 2, name: 'Ana Beatriz', action: 'adicionou nova tarefa urgente', time: '14m', avatar: 'AB', color: 'bg-[#b02e76]/20 text-[#b02e76]' },
  { id: 3, name: 'Rodrigo Silva', action: 'publicou post no Instagram', time: '1h', avatar: 'RS', color: 'bg-[#b98ffe]/20 text-[#b98ffe]' },
  { id: 4, name: 'Carla Nunes', action: 'faturou R$ 2.400 hoje', time: '2h', avatar: 'CN', color: 'bg-[#f08702]/20 text-[#f08702]' },
];

const activities = [
  { id: 1, icon: CheckCircle2, text: 'Relatório mensal gerado', time: 'Hoje 09:30', color: 'text-[#199349]' },
  { id: 2, icon: MessageSquare, text: 'Revisão de conteúdo pendente', time: 'Hoje 11:15', color: 'text-[#b98ffe]' },
  { id: 3, icon: TrendingUp, text: 'Campanha atingiu 10k alcance', time: 'Ontem', color: 'text-[#b02e76]' },
  { id: 4, icon: Clock, text: 'Reunião de briefing agendada', time: 'Ontem', color: 'text-[#f08702]' },
];

const contacts = [
  { id: 1, name: 'Mariana Costa', role: 'Gerente de Conta', avatar: 'MC', online: true },
  { id: 2, name: 'Felipe Torres', role: 'Designer Líder', avatar: 'FT', online: true },
  { id: 3, name: 'Juliana Ramos', role: 'Social Media', avatar: 'JR', online: false },
];

export function ActivityPanel() {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Notifications */}
      <div className="rounded-2xl border border-border bg-card p-4 flex-1 min-h-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Bell className="h-3.5 w-3.5 text-primary" />
            Notificações
          </h3>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/20 px-1.5 text-[10px] font-semibold text-primary">
            {notifications.length}
          </span>
        </div>
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-2.5">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${n.color}`}>
                {n.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-foreground leading-snug">
                  <span className="font-semibold">{n.name}</span>{' '}
                  <span className="text-muted-foreground">{n.action}</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{n.time} atrás</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activities */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Atividades</h3>
        <div className="space-y-2.5">
          {activities.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.id} className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className={`h-3 w-3 ${a.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">{a.text}</p>
                  <p className="text-[10px] text-muted-foreground">{a.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contacts */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Contatos da equipe</h3>
        <div className="space-y-2.5">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center gap-2.5">
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
                  {c.avatar}
                </div>
                {c.online && (
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#199349] ring-2 ring-card shadow-[0_0_4px_rgba(25,147,73,0.8)]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground">{c.name}</p>
                <p className="text-[10px] text-muted-foreground">{c.role}</p>
              </div>
              <div className={`text-[10px] font-medium ${c.online ? 'text-[#199349]' : 'text-muted-foreground'}`}>
                {c.online ? 'online' : 'offline'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
