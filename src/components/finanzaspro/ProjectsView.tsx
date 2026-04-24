'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CURRENCY_FORMATTER, STATUS_CONFIG } from '@/lib/constants';
import { Project, Area, DB_Usuario_Rol } from '@/lib/types';

interface ProjectsViewProps {
  projects: Project[];
  onAddProject: (p: any) => void;
  onUpdatePaid: (id: string, amount: number, notas: string) => void;
  onDeleteProject: (id: string) => void;
  onEditProject: (id: string, data: { name: string, client: string, amount: number, fecha_inicio: string, fecha_fin: string }) => void;
  userRole: DB_Usuario_Rol;
  areas: Area[];
  selectedArea: string;
  onAreaChange: (area: string) => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects, onAddProject, onUpdatePaid, onDeleteProject, onEditProject, userRole, areas, selectedArea, onAreaChange
}) => {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({ name: '', client: '', amount: 0, fecha_inicio: today, fecha_fin: today, area_id: '' });
  const [showForm, setShowForm] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{ id: string; name: string; remaining: number } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [editModal, setEditModal] = useState<Project | null>(null);
  const [editData, setEditData] = useState({ name: '', client: '', amount: 0, fecha_inicio: today, fecha_fin: today });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  const MONTHS = [
    { id: '01', name: 'Enero' }, { id: '02', name: 'Febrero' }, { id: '03', name: 'Marzo' },
    { id: '04', name: 'Abril' }, { id: '05', name: 'Mayo' }, { id: '06', name: 'Junio' },
    { id: '07', name: 'Julio' }, { id: '08', name: 'Agosto' }, { id: '09', name: 'Septiembre' },
    { id: '10', name: 'Octubre' }, { id: '11', name: 'Noviembre' }, { id: '12', name: 'Diciembre' }
  ];

  // Client-side filtering and sorting
  const processedProjects = React.useMemo(() => {
    let filtered = projects;

    // Area filter
    if (userRole === 'superadmin' && selectedArea !== 'ALL') {
      filtered = filtered.filter(p => p.area_id === selectedArea);
    }

    // Search filter
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(lowSearch) || 
        p.client.toLowerCase().includes(lowSearch)
      );
    }

    // Month filter (using fecha_inicio)
    if (selectedMonth !== 'ALL') {
      filtered = filtered.filter(p => p.fecha_inicio && p.fecha_inicio.split('-')[1] === selectedMonth);
    }

    // Sorting: Paid projects at the bottom, then by date descending
    return [...filtered].sort((a, b) => {
      const aPaid = a.paid >= a.amount;
      const bPaid = b.paid >= b.amount;
      if (aPaid && !bPaid) return 1;
      if (!aPaid && bPaid) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [projects, selectedArea, userRole, searchTerm, selectedMonth]);

  const totalProyectado = processedProjects.reduce((acc, p) => acc + p.amount, 0);
  const totalRecaudado = processedProjects.reduce((acc, p) => acc + p.paid, 0);
  const totalPendiente = totalProyectado - totalRecaudado;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.client || formData.amount <= 0) return;
    if (userRole === 'superadmin' && !formData.area_id) { alert('Selecciona un área'); return; }
    if (formData.fecha_fin < formData.fecha_inicio) { alert('La fecha de fin no puede ser anterior a la de inicio'); return; }
    onAddProject(formData);
    setFormData({ name: '', client: '', amount: 0, fecha_inicio: today, fecha_fin: today, area_id: '' });
    setShowForm(false);
  };

  const handlePayment = () => {
    if (paymentModal && paymentAmount > 0) {
      if (paymentAmount > paymentModal.remaining) { alert(`No puede abonar más de ${CURRENCY_FORMATTER.format(paymentModal.remaining)}`); return; }
      onUpdatePaid(paymentModal.id, paymentAmount, paymentNotes);
      setPaymentModal(null);
      setPaymentAmount(0);
      setPaymentNotes('');
    }
  };

  const openEdit = (project: Project) => {
    setEditModal(project);
    setEditData({ name: project.name, client: project.client, amount: project.amount, fecha_inicio: today, fecha_fin: project.fecha_fin || today });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editModal) {
      if (editData.fecha_fin < editData.fecha_inicio) { alert('La fecha de fin no puede ser anterior a la de inicio'); return; }
      onEditProject(editModal.id, editData);
      setEditModal(null);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Proyectado</p>
              <h2 className="text-xl font-extrabold text-foreground">{CURRENCY_FORMATTER.format(totalProyectado)}</h2>
              <p className="text-[10px] text-muted-foreground font-medium mt-1">{processedProjects.length} proyectos</p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center"><span className="material-icons-round text-primary">analytics</span></div>
          </div>
          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Recaudado</p>
                <h2 className="text-xl font-extrabold text-foreground">{CURRENCY_FORMATTER.format(totalRecaudado)}</h2>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center"><span className="material-icons-round text-primary">payments</span></div>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full transition-all duration-700 rounded-full" style={{ width: `${(totalRecaudado / totalProyectado) * 100 || 0}%` }} />
            </div>
          </div>
          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Pendiente de Cobro</p>
              <h2 className="text-xl font-extrabold text-destructive">{CURRENCY_FORMATTER.format(totalPendiente)}</h2>
              <p className="text-[10px] text-muted-foreground font-medium mt-1">{processedProjects.filter(p => p.paid < p.amount).length} activos</p>
            </div>
            <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center"><span className="material-icons-round text-destructive">error_outline</span></div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-bold text-foreground">Listado de Proyectos</h2>
              {userRole === 'superadmin' && (
                <select value={selectedArea} onChange={(e) => onAreaChange(e.target.value)}
                  className="bg-card border border-border rounded-xl px-3 py-2 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary shadow-sm">
                  <option value="ALL">Todas las Áreas</option>
                  {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              )}
            </div>
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/25 text-sm">
              <span className="material-icons-round text-lg">{showForm ? 'close' : 'add'}</span>
              {showForm ? 'Cancelar' : 'Nuevo Proyecto'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">search</span>
              <input 
                type="text" 
                placeholder="Buscar por nombre o cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
            </div>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-card border border-border rounded-xl px-3 py-2.5 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary shadow-sm"
            >
              <option value="ALL">Todos los Meses</option>
              {MONTHS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-2 px-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <span className="material-icons-round text-sm">sort</span>
              Orden: Pagados al final
            </div>
          </div>
        </div>

        {/* Collapsible form */}
        {showForm && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-5">Registrar Nuevo Proyecto</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nombre del Proyecto</label>
                <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary" placeholder="Ej: App Móvil" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cliente</label>
                <input required value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary" placeholder="Nombre Cliente" />
              </div>
              {userRole === 'superadmin' && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Área Destino</label>
                  <select required value={formData.area_id} onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}
                    className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Seleccionar Área</option>
                    {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Valor Total (COP)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">$</span>
                  <input required type="number" min="1" value={formData.amount || ''} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full bg-secondary border-none rounded-xl pl-8 pr-4 py-3 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary" placeholder="0" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fecha de Inicio</label>
                <input type="date" required value={formData.fecha_inicio} onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fecha de Fin</label>
                <input type="date" required value={formData.fecha_fin} min={formData.fecha_inicio} onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex items-end sm:col-span-2 lg:col-span-3">
                <button type="submit" className="w-full sm:w-auto bg-primary text-primary-foreground font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/25 text-sm">
                  Registrar Proyecto
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects list */}
        <div className="space-y-4">
          {processedProjects.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <span className="material-icons-round text-5xl text-muted-foreground/20 mb-3 block">inbox</span>
              <p className="text-muted-foreground font-medium">No se encontraron proyectos</p>
            </div>
          ) : processedProjects.map((project) => {
            const progress = project.amount > 0 ? Math.round((project.paid / project.amount) * 100) : 0;
            const remaining = project.amount - project.paid;
            return (
              <div key={project.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <span className="material-icons-round text-2xl">business_center</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground leading-tight">{project.name}</h3>
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <span className="material-icons-round text-xs">person</span>{project.client}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <span className="material-icons-round text-xs">apartment</span>{project.area_nombre}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <span className="material-icons-round text-xs">calendar_today</span>{project.date}
                          {project.fecha_fin && <> → {project.fecha_fin}</>}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest ${STATUS_CONFIG[project.status]?.className}`}>
                          {STATUS_CONFIG[project.status]?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-foreground leading-none">{CURRENCY_FORMATTER.format(project.amount)}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Total Proyecto</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Abonado ({progress}%) — {CURRENCY_FORMATTER.format(project.paid)}</span>
                    <span className="text-destructive">Pendiente: {CURRENCY_FORMATTER.format(remaining)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => router.push(`/proyectos/detalle/${project.id}`)}
                        className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-muted-foreground border border-border rounded-xl hover:bg-secondary hover:text-foreground transition-all"
                        title="Ver abonos"
                      >
                        <span className="material-icons-round text-sm">receipt_long</span>
                        Abonos
                      </button>
                      <button onClick={() => openEdit(project)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all">
                        <span className="material-icons-round text-lg">edit</span>
                      </button>
                      {userRole !== 'usuario' && (
                        <button onClick={() => onDeleteProject(project.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 transition-all">
                          <span className="material-icons-round text-lg">delete_outline</span>
                        </button>
                      )}
                      {userRole !== 'usuario' && (
                        remaining > 0 ? (
                          <button onClick={() => setPaymentModal({ id: project.id, name: project.name, remaining })}
                            className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-bold text-sm rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-primary/25">
                            <span className="material-icons-round text-base">payments</span>Abonar
                          </button>
                        ) : (
                          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm rounded-xl flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800/30">
                            <span className="material-icons-round text-base">check_circle</span>Pagado
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => { setPaymentModal(null); setPaymentAmount(0); setPaymentNotes(''); }}>
          <div className="bg-card w-full max-w-md rounded-2xl p-8 shadow-2xl border border-border relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => { setPaymentModal(null); setPaymentAmount(0); setPaymentNotes(''); }} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-all">

              <span className="material-icons-round">close</span>
            </button>
            <h3 className="text-xl font-bold mb-1 text-foreground">Registrar Abono</h3>
            <p className="text-muted-foreground text-sm mb-6"><span className="font-bold text-foreground">{paymentModal.name}</span> — Pendiente: <span className="text-destructive font-bold">{CURRENCY_FORMATTER.format(paymentModal.remaining)}</span></p>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Monto (COP) — Máx: {CURRENCY_FORMATTER.format(paymentModal.remaining)}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl font-bold">$</span>
                  <input autoFocus type="number" min="1" max={paymentModal.remaining}
                    className="w-full bg-secondary border-none rounded-xl pl-10 pr-4 py-4 text-2xl font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
                    value={paymentAmount || ''} onChange={(e) => setPaymentAmount(Math.min(Number(e.target.value), paymentModal.remaining))} placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Notas (opcional)</label>
                <input type="text" value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Ej: Pago de anticipo"
                  className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setPaymentModal(null); setPaymentAmount(0); setPaymentNotes(''); }} className="flex-1 py-3 font-bold text-muted-foreground hover:bg-secondary rounded-xl transition-all">Cancelar</button>
                <button onClick={handlePayment} disabled={paymentAmount <= 0}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/25 disabled:opacity-40">Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setEditModal(null)}>
          <div className="bg-card w-full max-w-lg rounded-2xl p-8 shadow-2xl border border-border relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setEditModal(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-all">
              <span className="material-icons-round">close</span>
            </button>
            <h3 className="text-xl font-bold mb-6 text-foreground">Editar Proyecto</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Nombre</label>
                  <input required value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })}
                    className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Cliente</label>
                  <input required value={editData.client} onChange={e => setEditData({ ...editData, client: e.target.value })}
                    className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Valor Total (COP)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">$</span>
                    <input required type="number" min="1" value={editData.amount || ''} onChange={e => setEditData({ ...editData, amount: Number(e.target.value) })}
                      className="w-full bg-secondary border-none rounded-xl pl-8 pr-4 py-3 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Fecha de Inicio</label>
                  <input type="date" required value={editData.fecha_inicio} onChange={e => setEditData({ ...editData, fecha_inicio: e.target.value })}
                    className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Fecha de Fin</label>
                  <input type="date" required value={editData.fecha_fin} min={editData.fecha_inicio} onChange={e => setEditData({ ...editData, fecha_fin: e.target.value })}
                    className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setEditModal(null)} className="flex-1 py-3 font-bold text-muted-foreground hover:bg-secondary rounded-xl transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/25 hover:opacity-90 transition-all">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectsView;
