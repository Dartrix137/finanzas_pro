'use client';

import { useEffect, useState } from 'react';

export default function ConfiguracionPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load persisted settings on mount
  useEffect(() => {
    const dark = document.cookie.includes('dark_mode=true') || localStorage.getItem('dark_mode') === 'true';
    setIsDarkMode(dark);
    if (dark) document.documentElement.classList.add('dark');
  }, []);

  const applyDarkMode = (enabled: boolean) => {
    setIsDarkMode(enabled);
    localStorage.setItem('dark_mode', String(enabled));
    // Also set a cookie so SSR can read it on next load
    document.cookie = `dark_mode=${enabled}; path=/; max-age=31536000`;
    if (enabled) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl">
      <header>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-primary rounded-2xl text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/30">
            <span className="material-icons-round text-2xl">settings</span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Configuración</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Preferencias de la interfaz y visualización</p>
          </div>
        </div>
      </header>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground">Apariencia</h2>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-6 py-5 hover:bg-secondary/40 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-icons-round text-primary text-xl">dark_mode</span>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Modo Oscuro</p>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">Cambia el tema de la interfaz a colores oscuros para reducir la fatiga visual.</p>
              </div>
            </div>
            <button
              onClick={() => applyDarkMode(!isDarkMode)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ml-4 ${
                isDarkMode ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${
                  isDarkMode ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground">Acerca de</h2>
        </div>
        <div className="px-6 py-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Versión</span>
            <span className="text-sm font-bold text-foreground">1.0.0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Plataforma</span>
            <span className="text-sm font-bold text-foreground">FinanzasPro SaaS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
