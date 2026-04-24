'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Project, AbonoUI } from '@/lib/types';
import { CURRENCY_FORMATTER } from '@/lib/constants';
import { createAbonoAction, updateAbonoAction, deleteAbonoAction } from '@/app/actions/abono.actions';

export default function AbonosClient({ proyecto, initialAbonos, userRole }: {
  proyecto: Project;
  initialAbonos: AbonoUI[];
  userRole: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [abonoModal, setAbonoModal] = useState(false);
  const [newMonto, setNewMonto] = useState(0);
  const [newNotas, setNewNotas] = useState('');
  const [editModal, setEditModal] = useState<AbonoUI | null>(null);
  const [editData, setEditData] = useState({ monto: 0, fecha_abono: '', notas: '' });

  const pendiente = proyecto.amount - proyecto.paid;
  const progress = proyecto.amount > 0 ? Math.round((proyecto.paid / proyecto.amount) * 100) : 0;

  const handleAddAbono = () => {
    if (newMonto <= 0) return;
    if (newMonto > pendiente) { alert(`El abono no puede superar la deuda pendiente (${CURRENCY_FORMATTER.format(pendiente)})`); return; }
    startTransition(async () => {
      try {
        await createAbonoAction(proyecto.id, newMonto, newNotas);
        setAbonoModal(false);
        setNewMonto(0);
        setNewNotas('');
        router.refresh();
      } catch (e: any) { alert('Error: ' + e.message); }
    });
  };

  const openEdit = (a: AbonoUI) => {
    setEditModal(a);
    setEditData({ monto: a.monto, fecha_abono: a.fecha_abono, notas: a.notas || '' });
  };

  const handleEditAbono = () => {
    if (!editModal) return;
    startTransition(async () => {
      try {
        await updateAbonoAction(editModal.id, editData.monto, editData.fecha_abono, editData.notas);
        setEditModal(null);
        router.refresh();
      } catch (e: any) { alert('Error: ' + e.message); }
    });
  };

  const handleDeleteAbono = (id: string) => {
    if (!window.confirm('¿Eliminar este abono? Esta acción no se puede deshacer.')) return;
    startTransition(async () => {
      try {
        await deleteAbonoAction(id);
        router.refresh();
      } catch (e: any) { alert('Error: ' + e.message); }
    });
  };

  return (
    <>
      <div className={`space-y-6 animate-fadeIn ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Back button */}
        <button onClick={() => router.push('/proyectos')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
          <span className="material-icons-round text-lg">arrow_back</span>
          Volver a Proyectos
        </button>

        {/* Project header card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <span className="material-icons-round text-primary text-3xl">business_center</span>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground">{proyecto.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <span className="material-icons-round text-xs">person</span>{proyecto.client}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <span className="material-icons-round text-xs">apartment</span>{proyecto.area_nombre}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <span className="material-icons-round text-xs">calendar_today</span>Inicio: {proyecto.date}
                  </span>
                  {proyecto.fecha_fin && (
                    <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      <span className="material-icons-round text-xs">event</span>Fin: {proyecto.fecha_fin}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-extrabold text-foreground">{CURRENCY_FORMATTER.format(proyecto.amount)}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Valor Total</div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <span>Progreso de cobro ({progress}%)</span>
              <span>Pendiente: <span className="text-destructive">{CURRENCY_FORMATTER.format(pendiente)}</span></span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Abonado: <strong className="text-primary">{CURRENCY_FORMATTER.format(proyecto.paid)}</strong></span>
              <strong className="text-foreground">{CURRENCY_FORMATTER.format(proyecto.amount)}</strong>
            </div>
          </div>
        </div>

        {/* Abonos table */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-foreground">Historial de Abonos</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{initialAbonos.length === 0 ? 'Sin abonos registrados' : `${initialAbonos.length} abono(s) registrado(s)`}</p>
            </div>
            {pendiente > 0 && userRole !== 'usuario' && (
              <button
                onClick={() => setAbonoModal(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/25 text-sm"
              >
                <span className="material-icons-round text-lg">add</span>
                Nuevo Abono
              </button>
            )}
          </div>

          {initialAbonos.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <span className="material-icons-round text-5xl mb-3 block opacity-20">receipt_long</span>
              <p className="font-medium text-sm">No hay abonos registrados para este proyecto</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.15em] border-b border-border">
                    <th className="px-5 py-3">#</th>
                    <th className="px-5 py-3">Fecha</th>
                    <th className="px-5 py-3 text-right">Monto</th>
                    <th className="px-5 py-3">Notas</th>
                    {userRole !== 'usuario' && <th className="px-5 py-3 text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {initialAbonos.map((a, idx) => (
                    <tr key={a.id} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-5 py-4 text-muted-foreground text-sm font-medium">#{initialAbonos.length - idx}</td>
                      <td className="px-5 py-4 text-foreground text-sm font-medium">{a.fecha_abono}</td>
                      <td className="px-5 py-4 text-right font-bold text-primary text-sm">{CURRENCY_FORMATTER.format(a.monto)}</td>
                      <td className="px-5 py-4 text-muted-foreground text-sm">{a.notas || '—'}</td>
                      {userRole !== 'usuario' && (
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => openEdit(a)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                              <span className="material-icons-round text-[18px]">edit</span>
                            </button>
                            <button onClick={() => handleDeleteAbono(a.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-destructive/20 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all">
                              <span className="material-icons-round text-[18px]">delete_outline</span>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-secondary/30">
                    <td colSpan={2} className="px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">TOTAL ABONADO</td>
                    <td className="px-5 py-3 text-right font-extrabold text-foreground">{CURRENCY_FORMATTER.format(proyecto.paid)}</td>
                    <td colSpan={userRole !== 'usuario' ? 2 : 1} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Abono Modal */}
      {abonoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => { setAbonoModal(false); setNewMonto(0); setNewNotas(''); }}>
          <div className="bg-card w-full max-w-md rounded-2xl p-8 shadow-2xl border border-border relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => { setAbonoModal(false); setNewMonto(0); setNewNotas(''); }} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-all">
              <span className="material-icons-round">close</span>
            </button>
            <h3 className="text-xl font-bold mb-1 text-foreground">Registrar Abono</h3>
            <p className="text-muted-foreground text-sm mb-6">Pendiente: <span className="font-bold text-destructive">{CURRENCY_FORMATTER.format(pendiente)}</span></p>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Monto (COP) — Máx: {CURRENCY_FORMATTER.format(pendiente)}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl font-bold">$</span>
                  <input autoFocus type="number" min="1" max={pendiente}
                    className="w-full bg-secondary border-none rounded-xl pl-10 pr-4 py-4 text-2xl font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
                    value={newMonto || ''} onChange={(e) => setNewMonto(Math.min(Number(e.target.value), pendiente))} placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Notas (opcional)</label>
                <input type="text" value={newNotas} onChange={(e) => setNewNotas(e.target.value)}
                  placeholder="Ej: Pago de anticipo"
                  className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setAbonoModal(false); setNewMonto(0); setNewNotas(''); }} className="flex-1 py-3 font-bold text-muted-foreground hover:bg-secondary rounded-xl transition-all">Cancelar</button>
                <button onClick={handleAddAbono} disabled={newMonto <= 0 || newMonto > pendiente}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/25 disabled:opacity-40">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Abono Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setEditModal(null)}>
          <div className="bg-card w-full max-w-md rounded-2xl p-8 shadow-2xl border border-border relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setEditModal(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-all">
              <span className="material-icons-round">close</span>
            </button>
            <h3 className="text-xl font-bold mb-6 text-foreground">Editar Abono</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Monto (COP)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">$</span>
                  <input type="number" min="1" value={editData.monto || ''}
                    onChange={e => setEditData({ ...editData, monto: Number(e.target.value) })}
                    className="w-full bg-secondary border-none rounded-xl pl-8 pr-4 py-3 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Fecha</label>
                <input type="date" value={editData.fecha_abono}
                  onChange={e => setEditData({ ...editData, fecha_abono: e.target.value })}
                  className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Notas (opcional)</label>
                <input type="text" value={editData.notas}
                  onChange={e => setEditData({ ...editData, notas: e.target.value })}
                  placeholder="Ej: Pago parcial cuota 1"
                  className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setEditModal(null)} className="flex-1 py-3 font-bold text-muted-foreground hover:bg-secondary rounded-xl transition-all">Cancelar</button>
                <button onClick={handleEditAbono} className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/25">
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
