
import React from 'react';
import { ViewState, User } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isOpen, onClose, user, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'proyectos', label: 'Proyectos', icon: 'business_center' },
    { id: 'cartera', label: 'Cartera', icon: 'account_balance_wallet' },
    { id: 'metas', label: 'Reportes / Metas', icon: 'bar_chart' },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col z-50 transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-icons-round text-background-dark text-lg font-black">payments</span>
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Finanzas<span className="text-primary">Pro</span>
          </span>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-slate-400">
          <span className="material-icons-round">close</span>
        </button>
      </div>

      <nav className="flex-1 px-5 space-y-1.5 mt-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as ViewState)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 ${
              currentView === item.id
                ? 'bg-primary/10 text-primary font-black shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold'
            }`}
          >
            <span className="material-icons-round text-[22px]">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-5">
        <button
          onClick={() => onNavigate('metas')}
          className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold"
        >
          <span className="material-icons-round text-[22px]">settings</span>
          Configuración
        </button>
        
        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl flex flex-col gap-4 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <img
              alt={user.name}
              className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
              src={user.avatar}
            />
            <div className="overflow-hidden">
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mt-0.5">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-red-100 dark:border-red-900/40 shadow-sm"
          >
            <span className="material-icons-round text-base">logout</span>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
