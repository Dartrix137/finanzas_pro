'use client';

import React, { useState } from 'react';
import { CURRENCY_FORMATTER, STATUS_CONFIG } from '@/lib/constants';
import { Project } from '@/lib/types';

interface PortfolioViewProps {
  projects: Project[];
  onUpdatePaid: (id: string, amount: number) => void;
  onDeleteProject: (id: string) => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ projects, onUpdatePaid, onDeleteProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentModal, setPaymentModal] = useState<{ id: string; name: string; remaining: number } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const filteredProjects = projects.filter(
    (p) =>
      p.amount > p.paid &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalCartera = projects.reduce((acc, p) => acc + (p.amount - p.paid), 0);
  const projectsWithDebt = projects.filter((p) => p.amount > p.paid).length;

  const handlePayment = () => {
    if (paymentModal && paymentAmount > 0) {
      onUpdatePaid(paymentModal.id, paymentAmount);
      setPaymentModal(null);
      setPaymentAmount(0);
    }
  };

  const stats = [
    { label: 'Total Cartera', value: CURRENCY_FORMATTER.format(totalCartera), icon: 'payments', color: 'primary' },
    { label: 'Con Deuda', value: String(projectsWithDebt), icon: 'warning', color: 'amber' },
    { label: 'Proyección Q4', value: CURRENCY_FORMATTER.format(totalCartera * 0.8), icon: 'schedule', color: 'blue' },
    { label: 'Eficiencia', value: '72%', icon: 'trending_up', color: 'emerald' },
  ];

  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    amber: 'bg-amber-50 text-amber-500 dark:bg-amber-900/20',
    blue: 'bg-blue-50 text-blue-500 dark:bg-blue-900/20',
    emerald: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Cartera Pendiente</h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">
            Seguimiento detallado de cobros y facturas por recaudar.
          </p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[stat.color]}`}>
                <span className="material-icons-round text-lg">{stat.icon}</span>
              </div>
            </div>
            <div className="text-lg font-extrabold text-foreground">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <div className="relative w-full lg:max-w-sm">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">search</span>
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border-none text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="Buscar proyecto o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest border-b border-border">
                <th className="px-5 py-3">Proyecto / Cliente</th>
                <th className="px-5 py-3 text-right">Valor Pendiente</th>
                <th className="px-5 py-3 hidden sm:table-cell">Vencimiento</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-foreground text-sm leading-tight">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground font-medium mt-0.5 uppercase tracking-wider">{p.client}</div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-bold text-destructive">
                        {CURRENCY_FORMATTER.format(p.amount - p.paid)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-medium text-sm hidden sm:table-cell">{p.date}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${STATUS_CONFIG[p.status]?.className}`}>
                        {STATUS_CONFIG[p.status]?.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => onDeleteProject(p.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-destructive/20 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all"
                          title="Eliminar"
                        >
                          <span className="material-icons-round text-[18px]">delete_outline</span>
                        </button>
                        <button
                          onClick={() =>
                            setPaymentModal({
                              id: p.id,
                              name: p.name,
                              remaining: p.amount - p.paid,
                            })
                          }
                          className="bg-primary hover:opacity-90 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                        >
                          Abonar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground font-medium italic text-sm">
                    No hay facturas pendientes que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl p-8 shadow-2xl border border-border animate-fadeInScale">
            <h3 className="text-2xl font-bold mb-1 text-foreground">Registrar Abono</h3>
            <p className="text-muted-foreground text-sm mb-6 font-medium">
              Proyecto: <span className="text-primary font-semibold">{paymentModal.name}</span>
            </p>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Monto del Pago (COP)
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Pendiente: {CURRENCY_FORMATTER.format(paymentModal.remaining)}
                </p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl font-bold">$</span>
                  <input
                    autoFocus
                    type="number"
                    min="0"
                    max={paymentModal.remaining}
                    className="w-full bg-secondary border-none rounded-xl pl-10 pr-4 py-4 text-2xl font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
                    value={paymentAmount || ''}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setPaymentModal(null);
                    setPaymentAmount(0);
                  }}
                  className="flex-1 py-3 font-bold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all uppercase tracking-widest text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePayment}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/25 uppercase tracking-widest text-xs"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioView;
