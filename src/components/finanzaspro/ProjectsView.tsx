'use client';

import React, { useState } from 'react';
import { CURRENCY_FORMATTER, CATEGORIES, CATEGORY_ICONS, STATUS_CONFIG, MONTHS } from '@/lib/constants';
import { Project } from '@/lib/types';

interface ProjectsViewProps {
  projects: Project[];
  onAddProject: (p: Omit<Project, 'id' | 'paid' | 'status'>) => void;
  onUpdatePaid: (id: string, amount: number) => void;
  onDeleteProject: (id: string) => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, onAddProject, onUpdatePaid, onDeleteProject }) => {
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    category: 'Desarrollo' as Project['category'],
    amount: 0,
    date: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
  });

  const [paymentModal, setPaymentModal] = useState<{ id: string; name: string; remaining: number } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const totalProyectado = projects.reduce((acc, p) => acc + p.amount, 0);
  const totalRecaudado = projects.reduce((acc, p) => acc + p.paid, 0);
  const totalPendiente = totalProyectado - totalRecaudado;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.client || formData.amount <= 0) return;
    onAddProject(formData);
    setFormData({
      name: '',
      client: '',
      category: 'Desarrollo',
      amount: 0,
      date: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
    });
  };

  const handlePayment = () => {
    if (paymentModal && paymentAmount > 0) {
      onUpdatePaid(paymentModal.id, paymentAmount);
      setPaymentModal(null);
      setPaymentAmount(0);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Proyectado</p>
            <h2 className="text-xl font-extrabold text-foreground">{CURRENCY_FORMATTER.format(totalProyectado)}</h2>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">{projects.length} proyectos</p>
          </div>
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="material-icons-round text-primary">analytics</span>
          </div>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Recaudado</p>
              <h2 className="text-xl font-extrabold text-foreground">{CURRENCY_FORMATTER.format(totalRecaudado)}</h2>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="material-icons-round text-primary">payments</span>
            </div>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-700 rounded-full"
              style={{ width: `${(totalRecaudado / totalProyectado) * 100 || 0}%` }}
            />
          </div>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Pendiente de Cobro</p>
            <h2 className="text-xl font-extrabold text-destructive">{CURRENCY_FORMATTER.format(totalPendiente)}</h2>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">
              {projects.filter((p) => p.paid < p.amount).length} facturas activas
            </p>
          </div>
          <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
            <span className="material-icons-round text-destructive">error_outline</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Project List */}
        <div className="flex-1 space-y-4">
          <h2 className="text-lg font-bold text-foreground px-1">Listado de Proyectos</h2>
          <div className="space-y-4">
            {projects.map((project) => {
              const progress = project.amount > 0 ? Math.round((project.paid / project.amount) * 100) : 0;
              return (
                <div
                  key={project.id}
                  className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <span className="material-icons-round text-2xl">
                          {CATEGORY_ICONS[project.category] || 'business_center'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground leading-tight">{project.name}</h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest rounded-md">
                            {project.category}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <span className="material-icons-round text-xs">calendar_today</span>
                            {project.date}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest ${STATUS_CONFIG[project.status]?.className}`}>
                            {STATUS_CONFIG[project.status]?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-foreground leading-none">
                        {CURRENCY_FORMATTER.format(project.amount)}
                      </div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        Total Proyecto
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <span>Progreso de abonos ({progress}%)</span>
                      <span className="text-primary font-bold">
                        {CURRENCY_FORMATTER.format(project.paid)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-700"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          onClick={() => onDeleteProject(project.id)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 transition-all"
                          title="Eliminar Proyecto"
                        >
                          <span className="material-icons-round text-xl">delete_outline</span>
                        </button>
                        {project.paid < project.amount ? (
                          <button
                            onClick={() =>
                              setPaymentModal({
                                id: project.id,
                                name: project.name,
                                remaining: project.amount - project.paid,
                              })
                            }
                            className="px-5 py-2.5 bg-primary hover:opacity-90 text-primary-foreground font-bold text-sm rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/25"
                          >
                            <span className="material-icons-round text-lg">payments</span>
                            Abonar
                          </button>
                        ) : (
                          <div className="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm rounded-xl flex items-center gap-2">
                            <span className="material-icons-round text-lg">check_circle</span>
                            Pagado
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Registration Form */}
        <div className="lg:w-80 shrink-0">
          <div className="sticky top-6 bg-card border border-border rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground mb-6">Nuevo Proyecto</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nombre</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                  placeholder="Ej: App Móvil"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cliente</label>
                <input
                  required
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                  placeholder="Nombre Cliente"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Project['category'] })}
                  className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Valor (COP)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">$</span>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full bg-secondary border-none rounded-xl pl-8 pr-4 py-3 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fecha</label>
                <input
                  type="date"
                  value={(() => {
                    // Try to convert stored date back to YYYY-MM-DD for the date picker
                    return new Date().toISOString().split('T')[0];
                  })()}
                  onChange={(e) => {
                    const d = new Date(e.target.value + 'T12:00:00');
                    const formatted = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
                    setFormData({ ...formData, date: formatted });
                  }}
                  className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/25 text-sm"
              >
                Registrar Proyecto
              </button>
            </form>
          </div>
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

export default ProjectsView;
