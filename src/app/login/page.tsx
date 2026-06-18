'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { login, signup } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';

type Tab = 'entrar' | 'cadastrar';

function LampTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors',
        active ? 'text-primary' : 'text-foreground/60 hover:text-foreground',
      ].join(' ')}
    >
      <span className="relative z-10">{label}</span>
      {active && (
        <motion.div
          layoutId="login-lamp"
          className="absolute inset-0 bg-primary/8 rounded-full -z-10"
          initial={false}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        >
          {/* lamp beam */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
            <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
            <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
            <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
          </div>
        </motion.div>
      )}
    </button>
  );
}

export default function LoginPage() {
  const [tab, setTab]       = useState<Tab>('entrar');
  const [error, setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);

    if (tab === 'entrar') {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } else {
      const result = await signup(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.success);
      }
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-dvh items-center justify-center bg-background p-4"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 65% 40%, rgba(217,119,6,0.12) 0%, transparent 70%),' +
            'radial-gradient(ellipse 45% 40% at 20% 80%, rgba(251,191,36,0.07) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[360px] space-y-7">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-sm">
            <Sparkles className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">EvoSm</h1>
            <p className="mt-1 text-sm text-muted-foreground">Gestão inteligente para Social Media</p>
          </div>
        </div>

        {/* Card */}
        <div className="surface rounded-2xl shadow-[var(--shadow-lg)] overflow-hidden">
          {/* Tab switcher */}
          <div className="flex items-center justify-center gap-1 border-b border-border bg-muted/30 px-1 py-1.5">
            <LampTab label="Entrar" active={tab === 'entrar'} onClick={() => { setTab('entrar'); setError(null); setSuccess(null); }} />
            <LampTab label="Criar conta" active={tab === 'cadastrar'} onClick={() => { setTab('cadastrar'); setError(null); setSuccess(null); }} />
          </div>

          {/* Form */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.form
                key={tab}
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    className="bg-muted border-border focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    {tab === 'entrar' && (
                      <a href="#" className="text-xs text-primary hover:underline">Esqueceu a senha?</a>
                    )}
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={tab === 'cadastrar' ? 'Mínimo 6 caracteres' : ''}
                    required
                    className="bg-muted border-border focus-visible:ring-primary"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-xl border border-primary/25 bg-primary/10 px-3 py-2.5 text-sm text-primary">
                    {success}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground font-semibold shadow-sm transition-all duration-200 hover:brightness-105"
                  disabled={loading}
                >
                  {loading
                    ? tab === 'entrar' ? 'Entrando…' : 'Criando conta…'
                    : tab === 'entrar' ? 'Entrar' : 'Criar conta'}
                </Button>
              </motion.form>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
