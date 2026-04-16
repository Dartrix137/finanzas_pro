'use client';

import React from 'react';
import { MonthlyGoal } from '@/lib/types';
import { CURRENCY_FORMATTER, CURRENT_YEAR_STR } from '@/lib/constants';

interface GoalsViewProps {
  goals: MonthlyGoal[];
  setGoals: (goals: MonthlyGoal[]) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const GoalsView: React.FC<GoalsViewProps> = ({ goals, setGoals, isDarkMode, toggleDarkMode }) => {
  const handleUpdateTarget = (month: string, target: string) => {
    const value = target === '' ? 0 : Math.max(0, Number(target.replace(/[^0-9]/g, '')));
    setGoals(goals.map((g) => (g.month === month ? { ...g, target: value } : g)));
  };

  const totalAnual = goals.reduce((acc, g) => acc + g.target, 0);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ goals }));
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', `finanzas_pro_metas_${Date.now()}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/30">
            <span className="material-icons-round text-2xl">wallet</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-none">
              Metas Anuales
            </h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.15em] mt-1.5">
              PLANIFICACIÓN FINANCIERA {CURRENT_YEAR_STR}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground block mb-1">
              META TOTAL ANUAL
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-primary leading-none">
              {CURRENCY_FORMATTER.format(totalAnual)}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Months Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {goals.map((goal) => (
              <div
                key={goal.month}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">
                    {goal.month}
                  </span>
                  <span className="material-icons-round text-muted-foreground/30 text-lg">calendar_today</span>
                </div>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg">$</span>
                  <input
                    className="w-full bg-transparent border-none p-0 text-center font-bold text-2xl text-foreground outline-none focus:ring-0 transition-all placeholder:text-muted-foreground/30"
                    value={goal.target || ''}
                    onChange={(e) => handleUpdateTarget(goal.month, e.target.value)}
                    type="number"
                    min="0"
                    placeholder="0"
                  />
                </div>
                <p className="text-[9px] mt-5 text-muted-foreground uppercase tracking-[0.2em] font-bold text-center">
                  META SUGERIDA
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Dark Mode Toggle */}
          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
            <h2 className="text-sm font-bold mb-5 flex items-center gap-3 text-foreground">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-icons-round text-primary text-base">settings</span>
              </span>
              Preferencias
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-icons-round text-lg text-muted-foreground">dark_mode</span>
                  <span className="text-xs font-bold text-foreground">Modo Oscuro</span>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`w-11 h-5.5 rounded-full relative transition-all duration-500 ease-in-out ${
                    isDarkMode ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-border'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-sm ${
                      isDarkMode ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
            <h2 className="text-sm font-bold mb-5 flex items-center gap-3 text-foreground">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-icons-round text-primary text-base">cloud_download</span>
              </span>
              Datos
            </h2>
            <button
              onClick={handleExportJSON}
              className="w-full py-3 px-4 bg-secondary hover:bg-muted rounded-xl text-[10px] font-bold flex items-center justify-center gap-3 transition-all group uppercase tracking-[0.2em] text-muted-foreground border border-border"
            >
              <span className="material-icons-round text-base text-muted-foreground group-hover:text-primary transition-colors">
                file_download
              </span>
              EXPORTAR JSON
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default GoalsView;
