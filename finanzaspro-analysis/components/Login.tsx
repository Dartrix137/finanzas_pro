
import React from 'react';
import { User } from '../types';
import { USERS } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="fixed inset-0 bg-[#f8fafc] flex flex-col items-center justify-center p-6 font-display overflow-y-auto">
      <div className="w-full max-w-lg flex flex-col items-center animate-fadeInScale">
        {/* Logo and Greeting */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
            <span className="material-icons-round text-background-dark text-3xl font-black">payments</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight mb-2">Bienvenido a FinanzasPro</h1>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Dashboard Financiero</p>
        </div>

        {/* Profile Selector Card */}
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] border border-slate-100">
          <h2 className="text-lg font-black text-slate-800 mb-8 text-center tracking-tight">Selecciona tu perfil</h2>
          
          <div className="space-y-4">
            {USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => onLogin(user)}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border border-slate-50 hover:border-primary/30 hover:bg-slate-50/50 transition-all group text-left"
              >
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-black text-slate-900 leading-tight">{user.name}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{user.role}</p>
                </div>
                <span className="material-icons-round text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all">
                  chevron_right
                </span>
              </button>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-50">
            <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest leading-loose max-w-[280px] mx-auto">
              Usa tus credenciales para acceder al sistema de gestión.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
