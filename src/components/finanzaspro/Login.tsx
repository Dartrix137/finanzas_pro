'use client';

import React from 'react';
import { User } from '@/lib/types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
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

        {/* User Selector Card */}
        <div className="w-full max-w-md bg-card rounded-2xl p-8 shadow-xl border border-border">
          <h2 className="text-lg font-bold text-card-foreground mb-6 text-center">
            Selecciona tu perfil
          </h2>

          <div className="space-y-3">
            {([
              { id: '1', name: 'Desarrollo y Automatizaciones', role: 'ADMIN', avatar: 'https://picsum.photos/seed/dev-automation/100/100' },
              { id: '2', name: 'Multimedia', role: 'ADMIN', avatar: 'https://picsum.photos/seed/multimedia-admin/100/100' },
              { id: '3', name: 'Trafficker', role: 'ADMIN', avatar: 'https://picsum.photos/seed/trafficker-admin/100/100' },
            ] as User[]).map((user) => (
              <button
                key={user.id}
                onClick={() => onLogin(user)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/50 transition-all group text-left"
              >
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-card-foreground leading-tight truncate">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                    {user.role}
                  </p>
                </div>
                <span className="material-icons-round text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all text-xl">
                  chevron_right
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-loose max-w-[280px] mx-auto">
              Selecciona un perfil para acceder al sistema de gestión financiera.
            </p>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/50 mt-8 font-medium">
          Powered by La Filial — Estudio Digital
        </p>
      </div>
    </div>
  );
};

export default Login;
