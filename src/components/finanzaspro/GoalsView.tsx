'use client';

import React from 'react';
import { CURRENCY_FORMATTER, CURRENT_YEAR_STR } from '@/lib/constants';
import { MonthlyGoal, Area } from '@/lib/types';

interface GoalsViewProps {
  userRole: string;
  areas: Area[];
  selectedArea: string;
  onAreaChange: (areaId: string) => void;
  goals: MonthlyGoal[];
  onUpdateTarget: (month: string, target: string) => void;
  onSaveChanges: () => void;
  hasChanges: boolean;
}

const GoalsView: React.FC<GoalsViewProps> = ({ 
  userRole, areas, selectedArea, onAreaChange, goals, onUpdateTarget, onSaveChanges, hasChanges 
}) => {
  const totalAnual = goals.reduce((acc, g) => acc + g.target, 0);

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
              Gestión de Metas
            </h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.15em] mt-1.5">
              PLANIFICACIÓN FINANCIERA {CURRENT_YEAR_STR}
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground block mb-1">
              META TOTAL ANUAL
            </span>
            <div className="text-2xl font-extrabold text-primary leading-none">
              {CURRENCY_FORMATTER.format(totalAnual)}
            </div>
          </div>
          {hasChanges && (
            <button
              onClick={onSaveChanges}
              className="px-5 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
            >
              <span className="material-icons-round text-lg">save</span>
              Guardar Cambios
            </button>
          )}
        </div>
      </header>

      {/* Area Selector (Superadmin only) */}
      {userRole === 'superadmin' && (
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row items-center gap-4">
          <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest shrink-0">
            Área de Negocio
          </label>
          <select
            value={selectedArea}
            onChange={(e) => onAreaChange(e.target.value)}
            className="w-full sm:w-72 bg-secondary border-none rounded-xl px-4 py-2.5 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="" disabled>Seleccione un área...</option>
            {areas.map((a: any) => (
               <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        </div>
      )}

      {/* Months Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                className="w-full bg-transparent border-none p-0 text-center font-bold text-xl text-foreground outline-none focus:ring-0 transition-all placeholder:text-muted-foreground/30"
                value={goal.target || ''}
                onChange={(e) => onUpdateTarget(goal.month, e.target.value)}
                type="text"
                placeholder="0"
              />
            </div>
            <p className="text-[9px] mt-5 text-muted-foreground uppercase tracking-[0.2em] font-bold text-center">
              META DEL MES
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalsView;
