
import React, { useState } from 'react';
import { CURRENCY_FORMATTER } from '../constants';
import { Project } from '../types';

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
    category: 'Desarrollo' as any,
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const [paymentModal, setPaymentModal] = useState<{id: string, name: string} | null>(null);
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
      date: new Date().toISOString().split('T')[0]
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
    <div className="space-y-8 animate-fadeIn">
      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Proyectado</p>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">$ {new Intl.NumberFormat('es-CO').format(totalProyectado)}</h2>
            <p className="text-[10px] text-slate-400 font-bold mt-1">{projects.length} proyectos registrados</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
            <span className="material-icons-round text-primary">analytics</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Recaudado</p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">$ {new Intl.NumberFormat('es-CO').format(totalRecaudado)}</h2>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="material-icons-round text-primary">payments</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-700" style={{ width: `${(totalRecaudado / totalProyectado) * 100 || 0}%` }}></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pendiente de Cobro</p>
            <h2 className="text-2xl font-black text-red-500">$ {new Intl.NumberFormat('es-CO').format(totalPendiente)}</h2>
            <p className="text-[10px] text-slate-400 font-bold mt-1">{projects.filter(p => p.paid < p.amount).length} facturas activas</p>
          </div>
          <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
            <span className="material-icons-round text-red-500">error_outline</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 space-y-6">
          <h2 className="text-xl font-black text-slate-800 dark:text-white px-2">Listado de Proyectos</h2>
          
          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-500">
                      <span className="material-icons-round text-3xl font-black">
                        {project.category === 'Desarrollo' ? 'terminal' : 
                         project.category === 'Diseño' ? 'palette' : 
                         project.category === 'Consultoría' ? 'settings_suggest' : 'business_center'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">{project.name}</h3>
                      <div className="flex items-center gap-4 mt-2.5">
                        <span className="px-3 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg">
                          {project.category}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span className="material-icons-round text-sm">calendar_today</span>
                          {project.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right w-full md:w-auto">
                    <div className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                      $ {new Intl.NumberFormat('es-CO').format(project.amount)}
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Total Proyecto</div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Progreso de abonos ({Math.round((project.paid / project.amount) * 100)}%)</span>
                    <span className="text-primary font-black">
                      $ {new Intl.NumberFormat('es-CO').format(project.paid)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex-1 h-3 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(19,236,91,0.3)]" 
                        style={{ width: `${(project.paid / project.amount) * 100 || 0}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Functional delete button matching screenshot */}
                      <button 
                        onClick={() => onDeleteProject(project.id)}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl border-2 border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all active:scale-90"
                        title="Eliminar Proyecto"
                      >
                        <span className="material-icons-round text-2xl">delete_outline</span>
                      </button>

                      {project.paid < project.amount ? (
                        <button 
                          onClick={() => setPaymentModal({id: project.id, name: project.name})}
                          className="px-10 py-4 bg-primary hover:brightness-105 active:scale-95 text-slate-900 font-black text-sm rounded-2xl flex items-center gap-3 transition-all shadow-xl shadow-primary/20"
                        >
                          <span className="material-icons-round text-xl">payments</span>
                          Abonar
                        </button>
                      ) : (
                        <div className="px-10 py-4 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-black text-sm rounded-2xl flex items-center gap-3">
                          <span className="material-icons-round text-xl">check_circle</span>
                          Pagado
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Registration Form */}
        <div className="lg:w-96 shrink-0">
          <div className="sticky top-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-12 shadow-2xl shadow-slate-200/40 dark:shadow-none">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-10">Nuevo Proyecto</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#f8fafc] dark:bg-slate-800 border-none rounded-2xl px-6 py-5 text-base font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-slate-300" 
                  placeholder="Ej: App Móvil" 
                />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</label>
                <input 
                  required
                  value={formData.client}
                  onChange={e => setFormData({...formData, client: e.target.value})}
                  className="w-full bg-[#f8fafc] dark:bg-slate-800 border-none rounded-2xl px-6 py-5 text-base font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-slate-300" 
                  placeholder="Nombre Cliente" 
                />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor (COP)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">$</span>
                  <input 
                    required
                    type="number"
                    value={formData.amount || ''}
                    onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                    className="w-full bg-[#f8fafc] dark:bg-slate-800 border-none rounded-2xl pl-10 pr-6 py-5 text-base font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-slate-300" 
                    placeholder="0" 
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-primary text-slate-900 font-black py-5 rounded-2xl hover:brightness-105 active:scale-[0.98] transition-all shadow-2xl shadow-primary/30 mt-6 text-lg"
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
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-12 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fadeInScale">
            <h3 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">Registrar Abono</h3>
            <p className="text-slate-400 text-sm mb-10 font-bold">Proyecto: <span className="text-primary">{paymentModal.name}</span></p>
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Monto del Pago (COP)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 text-2xl font-black">$</span>
                  <input 
                    autoFocus
                    type="number" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl pl-12 pr-6 py-6 text-4xl font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                    value={paymentAmount || ''}
                    onChange={e => setPaymentAmount(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex gap-5 pt-4">
                <button 
                  onClick={() => setPaymentModal(null)} 
                  className="flex-1 py-5 font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all uppercase tracking-widest text-xs"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handlePayment} 
                  className="flex-1 py-5 bg-primary text-slate-900 font-black rounded-2xl hover:brightness-105 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest text-xs"
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
