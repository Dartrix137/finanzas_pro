
import React, { useState } from 'react';
import { CURRENCY_FORMATTER } from '../constants';
import { Project } from '../types';

interface PortfolioViewProps {
  projects: Project[];
  onUpdatePaid: (id: string, amount: number) => void;
  onDeleteProject: (id: string) => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ projects, onUpdatePaid, onDeleteProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredProjects = projects.filter(p => 
    p.amount > p.paid && 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.client.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalCartera = projects.reduce((acc, p) => acc + (p.amount - p.paid), 0);
  const projectsWithDebt = projects.filter(p => p.amount > p.paid).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Cartera Pendiente</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Seguimiento detallado de cobros y facturas por recaudar.</p>
        </div>
      </header>

      {/* Summary Stats - Refined to match screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Cartera', value: CURRENCY_FORMATTER.format(totalCartera), icon: 'payments', trend: 'GLOBAL', color: 'primary' },
          { label: 'Proyectos con Deuda', value: projectsWithDebt, icon: 'warning', trend: 'PENDIENTES', color: 'amber' },
          { label: 'Recaudo Esperado Q4', value: CURRENCY_FORMATTER.format(totalCartera * 0.8), icon: 'schedule', trend: 'PROYECCIÓN', color: 'blue' },
          { label: 'Eficiencia Cobro', value: '72%', icon: 'trending_up', trend: '+4% ESTE MES', color: 'emerald' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{stat.label}</span>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                stat.color === 'primary' ? 'bg-primary/10 text-primary' :
                stat.color === 'red' ? 'bg-red-50 text-red-500' :
                stat.color === 'amber' ? 'bg-amber-50 text-amber-500' : 
                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'
              }`}>
                <span className="material-icons-round text-xl">{stat.icon}</span>
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-[10px] text-slate-400 mt-2 font-bold tracking-widest">
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex flex-col lg:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900">
          <div className="relative w-full lg:max-w-md">
            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary outline-none transition-all" 
              placeholder="Buscar proyecto o cliente..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50 dark:border-slate-800">
                <th className="px-8 py-5">Proyecto / Cliente</th>
                <th className="px-8 py-5 text-right">Valor Pendiente</th>
                <th className="px-8 py-5">Vencimiento</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredProjects.length > 0 ? filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-extrabold text-slate-800 dark:text-white text-base leading-tight">{p.name}</div>
                    <div className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{p.client}</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-lg font-black text-red-500">
                      $ {new Intl.NumberFormat('es-CO').format(p.amount - p.paid)}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-slate-500 font-bold text-sm">{p.date}</td>
                  <td className="px-8 py-6">
                    <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-500 text-[9px] font-black uppercase tracking-widest">
                      Pendiente
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 justify-end">
                      {/* Red square trash icon button - functional */}
                      <button 
                        onClick={() => onDeleteProject(p.id)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-red-50 dark:border-red-900/20 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                        title="Eliminar Proyecto"
                      >
                        <span className="material-icons-round text-[20px]">delete_outline</span>
                      </button>
                      
                      {/* Green action button */}
                      <button 
                        onClick={() => onUpdatePaid(p.id, p.amount - p.paid)}
                        className="bg-primary hover:brightness-105 active:scale-95 text-slate-900 text-xs font-black px-5 py-2.5 rounded-lg transition-all shadow-sm"
                      >
                        Saldar Todo
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic text-sm">
                    No hay facturas pendientes que coincidan con los criterios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;
