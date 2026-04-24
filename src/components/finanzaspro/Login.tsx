'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Credenciales inválidas. Por favor intenta de nuevo.');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-lg flex flex-col items-center animate-fadeInScale">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/30">
            <span className="material-icons-round text-primary-foreground text-3xl">payments</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight mb-2">
            Bienvenido a <span className="text-primary">FinanzasPro</span>
          </h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
            Dashboard Financiero
          </p>
        </div>

        {/* User Login Form */}
        <div className="w-full max-w-sm bg-card rounded-2xl p-8 shadow-xl border border-border">
          <h2 className="text-lg font-bold text-card-foreground mb-6 text-center">
            Inicia Sesión
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                title="Correo Electrónico"
                placeholder="tu@correo.com"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                title="Contraseña"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {error && (
              <p className="text-xs font-bold text-destructive text-center mt-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl transition-all disabled:opacity-50 mt-6 shadow-lg shadow-primary/20"
            >
              {loading ? 'Entrando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-loose max-w-[280px] mx-auto">
              Ingresa tus credenciales autorizadas por administración.
            </p>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/50 mt-8 font-medium">
          Powered by La Filial — Estudio Digital
        </p>
      </div>
    </div>
  );
}
