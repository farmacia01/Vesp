'use client'

import { useState } from 'react';
import { login } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
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
            'radial-gradient(ellipse 70% 55% at 65% 40%, rgba(25,147,73,0.10) 0%, transparent 70%),' +
            'radial-gradient(ellipse 45% 40% at 20% 80%, rgba(176,46,118,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[360px] space-y-7">
        {/* Logo block */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-sm">
            <Sparkles className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">EvoSm</h1>
            <p className="mt-1 text-sm text-muted-foreground">Entre para acessar o painel</p>
          </div>
        </div>

        {/* Form */}
        <div className="surface rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <a href="#" className="text-xs text-primary hover:underline">Esqueceu a senha?</a>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-muted border-border focus-visible:ring-primary"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-semibold shadow-sm transition-all duration-200 hover:brightness-105"
              disabled={loading}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
