'use client';

import React from 'react';
import { ViewState, Usuario } from '@/lib/types';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
  user: Usuario;
  onLogout: () => void;
}

// Menu items will be generated inside the component


const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isOpen, onClose, user, onLogout }) => {
  const menuItems: { id: ViewState; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'proyectos', label: 'Proyectos', icon: 'business_center' },
    { id: 'cartera', label: 'Cartera', icon: 'account_balance_wallet' },
  ];

  if (user.rol === 'superadmin' || user.rol === 'director') {
    menuItems.push({ id: 'reportes', label: 'Reportes', icon: 'analytics' });
    menuItems.push({ id: 'metas', label: 'Gestión Metas', icon: 'flag' });
  }

  if (user.rol === 'superadmin') {
    menuItems.push({ id: 'usuarios', label: 'Usuarios', icon: 'group' });
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-icons-round text-primary-foreground text-lg">payments</span>
          </div>
          <span className="text-lg font-extrabold tracking-tight text-card-foreground">
            Finanzas<span className="text-primary">Pro</span>
          </span>
        </div>
        <button onClick={onClose} className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <span className="material-icons-round text-xl">close</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${currentView === item.id
                ? 'bg-primary/10 text-primary font-bold shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground font-medium'
              }`}
          >
            <span className="material-icons-round text-xl">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer / Settings */}
      <div className="p-4 border-t border-border space-y-4">
        <button
          onClick={() => onNavigate('configuracion')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all font-medium ${
            currentView === 'configuracion'
              ? 'bg-primary/10 text-primary font-bold'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          }`}
        >
          <span className="material-icons-round text-xl">settings</span>
          <span className="text-sm">Configuración</span>
        </button>

        {/* User Profile */}
        <div className="p-3 bg-secondary/50 rounded-xl flex flex-col gap-3 border border-border">
          <div className="flex items-center gap-2.5">
            {(user as any).avatar ? (
              <img
                src={(user as any).avatar}
                alt={user.nombre}
                className="w-9 h-9 rounded-full border-2 border-background shadow-sm object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background shadow-sm overflow-hidden">
                <span className="material-icons-round text-primary text-xl">account_circle</span>
              </div>
            )}
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-bold text-card-foreground truncate">{user.nombre}</p>
              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest leading-none mt-0.5">
                {user.rol}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-card text-destructive hover:bg-destructive/10 transition-all border border-destructive/20"
          >
            <span className="material-icons-round text-sm">logout</span>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
