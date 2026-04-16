import React from 'react';
import { MonthlyGoal } from '../types';

interface GoalsViewProps {
  goals: MonthlyGoal[];
  setGoals: (goals: MonthlyGoal[]) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const GoalsView: React.FC<GoalsViewProps> = ({ goals, setGoals, isDarkMode, toggleDarkMode }) => {
  const handleUpdateTarget = (month: string, target: string) => {
    // Basic sanitization to handle empty input or non-numeric values
    const value = target === '' ? 0 : Number(target.replace(/[^0-9]/g, ''));
    setGoals(goals.map(g => g.month === month ? { ...g, target: value } : g));
  };

  const totalAnual = goals.reduce((acc, g) => acc + g.target, 0);

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Header matching screenshot */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-primary rounded-2xl text-slate-900 flex items-center justify-center shadow-2xl shadow-primary/40">
            <span className="material-icons-round text-3xl font-black">wallet</span>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Metas Anuales</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.15em] mt-2">PLANIFICACIÓN FINANCIERA 2023</p>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">META TOTAL ANUAL</span>
            <div className="text-4xl font-black text-primary leading-none">
              $ {new Intl.NumberFormat('es-CO').format(totalAnual)}
            </div>
          </div>
          <button className="bg-primary hover:brightness-105 active:scale-95 text-slate-900 font-black px-10 py-4.5 rounded-[1.25rem] flex items-center gap-3 transition-all shadow-2xl shadow-primary/30 text-sm">
            <span className="material-icons-round text-xl">save</span>
            Guardar Cambios
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Months Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {goals.map((goal) => (
              <div key={goal.month} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[15px] font-black text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">{goal.month}</span>
                  <span className="material-icons-round text-slate-300 dark:text-slate-700 text-xl">calendar_today</span>
                </div>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 font-black text-2xl">$</span>
                  <input 
                    className="w-full bg-transparent border-none p-0 text-center font-black text-4xl text-slate-800 dark:text-white outline-none focus:ring-0 transition-all placeholder:text-slate-200" 
                    value={goal.target || ''}
                    onChange={e => handleUpdateTarget(goal.month, e.target.value)}
                    type="number" 
                    placeholder="0"
                  />
                </div>
                <p className="text-[10px] mt-8 text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-black text-center">META SUGERIDA</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-50 dark:border-slate-800 shadow-sm">
            <h2 className="text-base font-black mb-10 flex items-center gap-4 text-slate-900 dark:text-white">
              <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-icons-round text-primary text-xl">settings</span>
              </span>
              Preferencias
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-5 bg-[#f8fafc] dark:bg-slate-800 rounded-2xl border border-slate-50 dark:border-slate-700 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="material-icons-round text-xl text-slate-400">dark_mode</span>
                  <span className="text-[13px] font-black text-slate-600 dark:text-slate-300">Modo Oscuro</span>
                </div>
                <button 
                  onClick={toggleDarkMode}
                  className={`w-12 h-6 rounded-full relative transition-all duration-500 ease-in-out ${isDarkMode ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-sm ${isDarkMode ? 'right-1' : 'left-1'}`}></span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-50 dark:border-slate-800 shadow-sm">
            <h2 className="text-base font-black mb-10 flex items-center gap-4 text-slate-900 dark:text-white">
              <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-icons-round text-primary text-xl">cloud_download</span>
              </span>
              Datos
            </h2>
            <button 
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ goals }));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", `finanzas_pro_metas_${Date.now()}.json`);
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
              }}
              className="w-full py-5 px-6 bg-[#f8fafc] dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl text-[10px] font-black flex items-center justify-center gap-4 transition-all group uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 border border-slate-50 dark:border-slate-700"
            >
              <span className="material-icons-round text-xl text-slate-400 group-hover:text-primary transition-colors">file_download</span>
              EXPORTAR JSON
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default GoalsView;
