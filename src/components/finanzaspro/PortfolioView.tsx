'use client';

import React, { useState } from 'react';
import { CURRENCY_FORMATTER, STATUS_CONFIG } from '@/lib/constants';
import { Project, Area } from '@/lib/types';

interface PortfolioViewProps {
  projects: Project[];
  onUpdatePaid: (id: string, amount: number, notas: string) => void;
  onDeleteProject: (id: string) => void;
  userRole: string;
  areas: Area[];
  selectedArea: string;
  onAreaChange: (area: string) => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ projects, onUpdatePaid, onDeleteProject, userRole, areas, selectedArea, onAreaChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentModal, setPaymentModal] = useState<{ id: string; name: string; remaining: number } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNotes, setPaymentNotes] = useState('');

  const filteredProjects = projects.filter(
    (p) => p.amount > p.paid &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.client.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalCartera = filteredProjects.reduce((acc, p) => acc + (p.amount - p.paid), 0);
  const projectsWithDebt = filteredProjects.length;

  const handlePayment = () => {
    if (paymentModal && paymentAmount > 0) {
      onUpdatePaid(paymentModal.id, paymentAmount, paymentNotes);
      setPaymentModal(null);
      setPaymentAmount(0);
      setPaymentNotes('');
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Cartera Pendiente</h1>
            <p className="text-muted-foreground font-medium text-sm mt-1">Seguimiento de cobros y facturas por recaudar.</p>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Cartera</p>
              <h2 className="text-2xl font-extrabold text-destructive">{CURRENCY_FORMATTER.format(totalCartera)}</h2>
            </div>
            <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
              <span className="material-icons-round text-destructive text-2xl">payments</span>
            </div>
          </div>
          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Proyectos con Deuda</p>
              <h2 className="text-2xl font-extrabold text-foreground">{projectsWithDebt}</h2>
            </div>
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
              <span className="material-icons-round text-amber-500 text-2xl">warning</span>
            </div>
          </div>
        </div>

        {/* Table with filters */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="relative w-full sm:max-w-xs">
              <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">search</span>
              <input
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border-none text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Buscar proyecto o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {userRole === 'superadmin' && (
              <select
                value={selectedArea}
                onChange={(e) => onAreaChange(e.target.value)}
                className="w-full sm:w-auto bg-secondary border-none rounded-xl px-4 py-2.5 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">Todas las Áreas</option>
                {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest border-b border-border">
                  <th className="px-5 py-3">Proyecto / Cliente</th>
                  <th className="px-5 py-3 text-right">Valor Pendiente</th>
                  <th className="px-5 py-3 hidden sm:table-cell">Vencimiento</th>
                  <th className="px-5 py-3">Estado</th>
                  {userRole !== 'usuario' && <th className="px-5 py-3 text-right">Acciones</th>}
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
                        <span className="text-sm font-bold text-destructive">{CURRENCY_FORMATTER.format(p.amount - p.paid)}</span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground font-medium text-sm hidden sm:table-cell">{p.date}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${STATUS_CONFIG[p.status]?.className}`}>
                          {STATUS_CONFIG[p.status]?.label}
                        </span>
                      </td>
                      {userRole !== 'usuario' && (
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
                              onClick={() => setPaymentModal({ id: p.id, name: p.name, remaining: p.amount - p.paid })}
                              className="bg-primary hover:opacity-90 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                            >
                              Abonar
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground font-medium italic text-sm">
                      No hay facturas pendientes que coincidan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Modal — outside main div to avoid stacking context */}
      {paymentModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => { setPaymentModal(null); setPaymentAmount(0); setPaymentNotes(''); }}
        >
          <div
            className="bg-card w-full max-w-md rounded-2xl p-8 shadow-2xl border border-border relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setPaymentModal(null); setPaymentAmount(0); setPaymentNotes(''); }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-all"
            >
              <span className="material-icons-round">close</span>
            </button>
            <h3 className="text-xl font-bold mb-1 text-foreground">Registrar Abono</h3>
            <p className="text-muted-foreground text-sm mb-6 font-medium">
              <span className="font-bold text-foreground">{paymentModal.name}</span>
              <span className="ml-2 text-[10px] font-bold text-destructive uppercase tracking-widest">
                Pendiente: {CURRENCY_FORMATTER.format(paymentModal.remaining)}
              </span>
            </p>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Monto del Abono (COP)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl font-bold">$</span>
                  <input
                    autoFocus type="number" min="0" max={paymentModal.remaining}
                    className="w-full bg-secondary border-none rounded-xl pl-10 pr-4 py-4 text-2xl font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
                    value={paymentAmount || ''} onChange={(e) => setPaymentAmount(Number(e.target.value))} placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Notas (opcional)</label>
                <input type="text" value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Ej: Pago de anticipo"
                  className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setPaymentModal(null); setPaymentAmount(0); setPaymentNotes(''); }}
                  className="flex-1 py-3 font-bold text-muted-foreground hover:bg-secondary rounded-xl transition-all">
                  Cancelar
                </button>
                <button onClick={handlePayment}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/25">
                  Confirmar Abono
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PortfolioView;
