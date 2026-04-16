import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { CURRENCY_FORMATTER } from '../constants';
import { ViewState, Project, MonthlyGoal } from '../types';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
  projects: Project[];
  goals: MonthlyGoal[];
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, projects, goals }) => {
  const chartData = goals.slice(0, 10).map(goal => ({
    name: goal.month,
    meta: goal.target,
    actual: goal.actual,
  }));

  const totalFacturado = projects.reduce((acc, p) => acc + p.paid, 0);
  const totalCartera = projects.reduce((acc, p) => acc + (p.amount - p.paid), 0);
  const annualGoal = goals.reduce((acc, g) => acc + g.target, 0);
  const goalPercent = annualGoal > 0 ? Math.round((totalFacturado / annualGoal) * 100) : 0;

  const pieData = [
    { name: 'Alcanzado', value: goalPercent },
    { name: 'Restante', value: Math.max(0, 100 - goalPercent) },
  ];

  const handleExport = () => {
    window.print();
  };

  const activeProjectsCount = projects.filter(p => p.amount > p.paid).length;

  // Formatter for Y-axis to avoid overlapping large numbers
  const yAxisFormatter = (value: number) => {
    if (value === 0) return '0';
    return `${(value / 1000000).toFixed(0)}M`;
  };

  return (
    <div className="space-y-8 animate-fadeIn printable-area">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .printable-area { padding: 0 !important; margin: 0 !important; }
          .recharts-responsive-container { width: 100% !important; height: 300px !important; }
        }
      `}</style>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Dashboard Principal</h1>
          <p className="text-slate-400 font-bold text-sm mt-1">Resumen financiero consolidado al {new Date().toLocaleDateString('es-CO')}</p>
        </div>
        <div className="flex gap-4 no-print">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm"
          >
            <span className="material-icons-round text-lg">file_download</span>
            Exportar
          </button>
          <button 
            onClick={() => onNavigate('proyectos')}
            className="flex items-center gap-2 bg-primary text-slate-900 px-6 py-3 rounded-xl font-black hover:brightness-105 transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-icons-round text-lg">add</span>
            Nuevo Proyecto
          </button>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'TOTAL RECAUDADO', 
            value: CURRENCY_FORMATTER.format(totalFacturado), 
            change: '+5.2%', 
            icon: 'description', 
            iconColor: 'text-emerald-500', 
            bgColor: 'bg-emerald-50', 
            badgeColor: 'text-emerald-600 bg-emerald-100/50' 
          },
          { 
            label: 'CARTERA PENDIENTE', 
            value: CURRENCY_FORMATTER.format(totalCartera), 
            change: `${activeProjectsCount} ACTIVOS`, 
            icon: 'pending_actions', 
            iconColor: 'text-amber-500', 
            bgColor: 'bg-amber-50', 
            badgeColor: 'text-slate-400 bg-slate-100' 
          },
          { 
            label: '% DE META ANUAL', 
            value: `${goalPercent}%`, 
            change: 'ON TRACK', 
            icon: 'track_changes', 
            iconColor: 'text-emerald-500', 
            bgColor: 'bg-emerald-50', 
            badgeColor: 'text-slate-400 bg-slate-100' 
          },
          { 
            label: 'PROYECCIÓN Q4', 
            value: CURRENCY_FORMATTER.format(totalFacturado * 1.2), 
            change: '+8.1%', 
            icon: 'insights', 
            iconColor: 'text-slate-500', 
            bgColor: 'bg-slate-100', 
            badgeColor: 'text-emerald-600 bg-emerald-100/50' 
          },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-8">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bgColor} dark:bg-slate-800`}>
                <span className={`material-icons-round text-2xl ${kpi.iconColor}`}>{kpi.icon}</span>
              </div>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${kpi.badgeColor} dark:bg-slate-800`}>
                {kpi.change}
              </span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-2">{kpi.label}</p>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {kpi.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Progreso vs. Meta Mensual</h2>
              <p className="text-sm text-slate-400 font-bold mt-1">Rendimiento de facturación por mes</p>
            </div>
            <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-full"></span> META
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-primary rounded-full"></span> ACTUAL
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  width={40}
                  tickFormatter={yAxisFormatter}
                  tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ 
                    borderRadius: '1rem', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                    padding: '12px 16px',
                    backgroundColor: '#fff'
                  }}
                  itemStyle={{
                    fontSize: '12px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                  labelStyle={{
                    fontSize: '10px',
                    fontWeight: 900,
                    color: '#94a3b8',
                    marginBottom: '4px',
                    textTransform: 'uppercase'
                  }}
                  formatter={(value: number, name: string) => [
                    CURRENCY_FORMATTER.format(value), 
                    name === 'meta' ? 'META MENSUAL' : 'RECAUDADO'
                  ]}
                />
                <Bar dataKey="meta" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="actual" fill="#13ec5b" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-10">Meta Anual 2023</h3>
          <div className="relative w-56 h-56 mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  <Cell fill="#13ec5b" />
                  <Cell fill="#f1f5f9" stroke="none" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-slate-900 dark:text-white leading-none">{goalPercent}%</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">ALCANZADO</span>
            </div>
          </div>
          <div className="w-full space-y-6 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm font-bold">Meta Total</span>
              <span className="text-slate-900 dark:text-white font-black text-base">{CURRENCY_FORMATTER.format(annualGoal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm font-bold">Recaudado</span>
              <span className="text-primary font-black text-base">{CURRENCY_FORMATTER.format(totalFacturado)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-800 dark:text-white">Proyectos Recientes</h3>
          <button 
            onClick={() => onNavigate('proyectos')}
            className="text-primary font-black text-xs uppercase tracking-widest hover:underline"
          >
            Ver todos
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-50 dark:border-slate-800">
                <th className="px-8 py-6">Proyecto</th>
                <th className="px-8 py-6">Cliente</th>
                <th className="px-8 py-6">Monto</th>
                <th className="px-8 py-6">Estado</th>
                <th className="px-8 py-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {projects.slice(0, 5).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-700 dark:text-slate-200">{p.name}</td>
                  <td className="px-8 py-6 text-slate-500 text-sm font-medium">{p.client}</td>
                  <td className="px-8 py-6 font-black text-slate-900 dark:text-white">{CURRENCY_FORMATTER.format(p.amount)}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      p.paid >= p.amount 
                        ? 'bg-emerald-50 text-emerald-500' 
                        : 'bg-amber-50 text-amber-500'
                    }`}>
                      {p.paid >= p.amount ? 'FACTURADO' : 'PENDIENTE'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="material-icons-round text-slate-300 hover:text-primary transition-colors">more_horiz</button>
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
