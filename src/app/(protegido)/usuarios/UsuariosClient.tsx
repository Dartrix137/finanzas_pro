'use client';

import React, { useState, useTransition } from 'react';
import { createUsuarioAction, updateUsuarioAction, deleteUsuarioAction } from '@/app/actions/usuario.actions';

export default function UsuariosClient({ usuarios, areas, currentUserId }: any) {
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rol: 'usuario',
    area_id: '',
  });

  const openModal = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.nombre,
        email: user.email,
        password: '', // Leave blank when editing
        rol: user.rol,
        area_id: user.area_id || '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        rol: 'usuario',
        area_id: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rol !== 'superadmin' && !formData.area_id) {
      alert('Debes seleccionar un área para directores y usuarios regulares');
      return;
    }

    startTransition(async () => {
      try {
        if (editingUser) {
          await updateUsuarioAction(editingUser.id, formData.rol as any, formData.area_id);
        } else {
          if (!formData.password || formData.password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
          }
          await createUsuarioAction(formData.name, formData.email, formData.password, formData.rol as any, formData.area_id);
        }
        setModalOpen(false);
      } catch (error: any) {
        alert("Error gestionando usuario: " + error.message);
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás completamente seguro que deseas ELIMINAR el acceso de ${name}? Esta acción no se puede deshacer.`)) {
      startTransition(async () => {
        try {
          await deleteUsuarioAction(id);
        } catch (error: any) {
          alert("Error eliminando usuario: " + error.message);
        }
      });
    }
  };

  return (
    <>
    <div className={`space-y-6 animate-fadeIn ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Gestión de Usuarios</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Administra los accesos y roles de la plataforma FinanzasPro
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/25 text-sm"
        >
          <span className="material-icons-round text-lg">person_add</span>
          Nuevo Usuario
        </button>
      </header>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.15em] border-b border-border">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Área Asignada</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usuarios.map((u: any) => (
                <tr key={u.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-foreground text-sm">{u.nombre}</p>
                    <p className="text-muted-foreground text-xs font-medium">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                      u.rol === 'superadmin' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
                      u.rol === 'director' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                      'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground text-sm">
                    {u.area_nombre}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button
                         onClick={() => openModal(u)}
                         className="p-2 bg-secondary text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-all"
                         title="Editar Permisos"
                       >
                         <span className="material-icons-round text-lg">edit</span>
                       </button>
                       {u.id !== currentUserId && (
                         <button
                           onClick={() => handleDelete(u.id, u.nombre)}
                           className="p-2 bg-secondary text-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all"
                           title="Revocar Acceso"
                         >
                           <span className="material-icons-round text-lg">person_remove</span>
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {modalOpen && (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={() => !isPending && setModalOpen(false)}
      >
        <div 
          className={`bg-card w-full max-w-lg rounded-2xl p-8 shadow-2xl border border-border animate-fadeInScale relative ${isPending ? 'opacity-70 pointer-events-none' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => setModalOpen(false)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2"
          >
            <span className="material-icons-round">close</span>
          </button>

          <h3 className="text-2xl font-bold mb-1 text-foreground">
            {editingUser ? 'Actualizar Permisos' : 'Crear Nuevo Usuario'}
          </h3>
          <p className="text-muted-foreground text-sm mb-6 font-medium">
            {editingUser ? `Modificando acceso para ${editingUser.nombre}` : 'Registra un compañero de equipo enviándole acceso automático'}
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            {!editingUser && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Nombre Completo</label>
                  <input
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Correo Electrónico</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Contraseña Inicial</label>
                  <input
                    required={!editingUser}
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Poder de Acceso (Rol)</label>
              <select
                value={formData.rol}
                onChange={e => setFormData({ ...formData, rol: e.target.value, area_id: e.target.value === 'superadmin' ? '' : formData.area_id })}
                className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="usuario">Usuario Estándar (Sólo gestiona sus proyectos)</option>
                <option value="director">Director de Área (Gestiona todo bajo un área)</option>
                <option value="superadmin">SuperAdministrador (Acceso total)</option>
              </select>
            </div>

            {formData.rol !== 'superadmin' && (
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Área Asignada</label>
                <select
                  required
                  value={formData.area_id}
                  onChange={e => setFormData({ ...formData, area_id: e.target.value })}
                  className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccionar Área de Negocio</option>
                  {areas.map((a: any) => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3 font-bold text-muted-foreground hover:bg-secondary rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/25 hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
