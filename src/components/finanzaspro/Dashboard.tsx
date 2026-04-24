'use client';

import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie,
} from 'recharts';
import { CURRENCY_FORMATTER, shortNumber, STATUS_CONFIG, CURRENT_YEAR_STR } from '@/lib/constants';
import { ViewState, Project, MonthlyGoal } from '@/lib/types';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
  projects: Project[];
  goals: MonthlyGoal[];
  annualGoal: number;
  userRole: string;
  areas: any[];
  selectedArea: string;
  onAreaChange: (area: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  onNavigate, projects, goals, annualGoal, userRole, areas, selectedArea, onAreaChange
}) => {
  const chartData = goals.map((goal) => ({
    name: goal.month,
    meta: goal.target,
    actual: goal.actual,
  }));

  // Core KPI values — use projects for reliable totals
  const totalFacturado = projects.reduce((acc, p) => acc + p.paid, 0);
  const totalCartera = projects.reduce((acc, p) => acc + Math.max(0, p.amount - p.paid), 0);
  const activeProjectsCount = projects.filter((p) => p.paid < p.amount).length;
  const goalPercent = annualGoal > 0 ? Math.min(Math.round((totalFacturado / annualGoal) * 100), 100) : 0;

  // Proyección: promedio mensual * 12
  const currentMonth = new Date().getMonth(); // 0-indexed
  const monthsElapsed = Math.max(1, currentMonth);
  const avgMonthly = totalFacturado / monthsElapsed;
  const proyeccionAnual = Math.round(avgMonthly * 12);

  const pieData = [
    { name: 'Alcanzado', value: goalPercent },
    { name: 'Restante', value: Math.max(0, 100 - goalPercent) },
  ];

  const kpis = [
    {
      label: 'TOTAL RECAUDADO',
      value: CURRENCY_FORMATTER.format(totalFacturado),
      change: `${activeProjectsCount} ACTIVOS`,
      icon: 'description',
      iconBg: 'bg-primary/10 dark:bg-primary/20',
      iconColor: 'text-primary',
      badgeColor: 'text-muted-foreground bg-secondary',
    },
    {
      label: 'CARTERA PENDIENTE',
      value: CURRENCY_FORMATTER.format(totalCartera),
      change: `${projects.filter(p => p.paid < p.amount).length} FACTURAS`,
      icon: 'pending_actions',
      iconBg: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-500',
      badgeColor: 'text-muted-foreground bg-secondary',
    },
    {
      label: '% DE META ANUAL',
      value: `${goalPercent}%`,
      change: goalPercent >= 80 ? 'ON TRACK' : goalPercent >= 50 ? 'EN PROGRESO' : 'ATRASADO',
      icon: 'track_changes',
      iconBg: goalPercent >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: goalPercent >= 80 ? 'text-emerald-500' : 'text-amber-500',
      badgeColor: goalPercent >= 80 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
    },
    {
      label: 'PROYECCIÓN ANUAL',
      value: CURRENCY_FORMATTER.format(proyeccionAnual),
      change: `Prom. ${CURRENCY_FORMATTER.format(Math.round(avgMonthly))}/mes`,
      icon: 'insights',
      iconBg: 'bg-secondary',
      iconColor: 'text-muted-foreground',
      badgeColor: 'text-primary bg-primary/10 dark:bg-primary/20',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Dashboard Principal</h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">
            Resumen financiero consolidado al {new Date().toLocaleDateString('es-CO')}
          </p>
        </div>

        {/* Area Filter for superadmin */}
        {userRole === 'superadmin' && (
          <div className="flex items-center gap-3">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
              Vista de Área
            </label>
            <select
              value={selectedArea}
              onChange={(e) => onAreaChange(e.target.value)}
              className="bg-card border border-border rounded-xl px-3 py-2 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary shadow-sm"
            >
              <option value="ALL">Todas las Áreas</option>
              {areas.map((a: any) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>
        )}
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-card p-5 rounded-2xl border border-border shadow-sm">
            <div className="flex justify-between items-start mb-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.iconBg}`}>
                <span className={`material-icons-round text-xl ${kpi.iconColor}`}>{kpi.icon}</span>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest ${kpi.badgeColor}`}>
                {kpi.change}
              </span>
            </div>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5">
              {kpi.label}
            </p>
            <h2 className="text-xl font-extrabold text-foreground leading-tight">{kpi.value}</h2>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">Progreso vs. Meta Mensual</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {selectedArea === 'ALL' ? 'Consolidado de todas las áreas' : areas.find(a => a.id === selectedArea)?.nombre}
              </p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-border rounded-full" />
                META
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-primary rounded-full" />
                ACTUAL
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--color-muted-foreground)' }} />
                <YAxis axisLine={false} tickLine={false} width={55} tickFormatter={shortNumber} tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--color-muted-foreground)' }} />
                <Tooltip
                  cursor={{ fill: 'var(--color-accent)' }}
                  contentStyle={{ borderRadius: '0.75rem', border: '1px solid var(--color-border)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '10px 14px', backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)', fontSize: '12px' }}
                  formatter={(value: number, name: string) => [CURRENCY_FORMATTER.format(value), name === 'meta' ? 'META MENSUAL' : 'RECAUDADO']}
                />
                <Bar dataKey="meta" fill="var(--color-border)" radius={[5, 5, 0, 0]} barSize={20} />
                <Bar dataKey="actual" fill="var(--color-primary)" radius={[5, 5, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center">
          <h3 className="text-base font-bold text-foreground mb-1">Meta Anual {CURRENT_YEAR_STR}</h3>
          <p className="text-xs text-muted-foreground mb-5">
            {selectedArea === 'ALL' ? 'Global' : areas.find(a => a.id === selectedArea)?.nombre}
          </p>
          <div className="relative w-48 h-48 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={0} dataKey="value" startAngle={90} endAngle={450}>
                  <Cell fill="var(--color-primary)" />
                  <Cell fill="var(--color-border)" stroke="none" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-foreground leading-none">{goalPercent}%</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">ALCANZADO</span>
            </div>
          </div>
          <div className="w-full space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm font-medium">Meta Total</span>
              <span className="text-foreground font-bold text-sm">{CURRENCY_FORMATTER.format(annualGoal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm font-medium">Recaudado</span>
              <span className="text-primary font-bold text-sm">{CURRENCY_FORMATTER.format(totalFacturado)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm font-medium">Proyección</span>
              <span className="text-foreground font-bold text-sm">{CURRENCY_FORMATTER.format(proyeccionAnual)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects — last 5 */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-foreground">Proyectos Recientes</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Últimos 5 proyectos registrados</p>
          </div>
          <button onClick={() => onNavigate('proyectos')} className="text-primary font-bold text-xs uppercase tracking-widest hover:underline">
            Ver todos
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.15em] border-b border-border">
                <th className="px-5 py-3">Proyecto</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Monto</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.slice(0, 5).map((p) => (
                <tr key={p.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-foreground text-sm">{p.name}</td>
                  <td className="px-5 py-4 text-muted-foreground text-sm">{p.client}</td>
                  <td className="px-5 py-4 font-bold text-foreground text-sm">{CURRENCY_FORMATTER.format(p.amount)}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${STATUS_CONFIG[p.status]?.className || STATUS_CONFIG.pendiente.className}`}>
                      {STATUS_CONFIG[p.status]?.label || p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
