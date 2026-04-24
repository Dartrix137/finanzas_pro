'use client';

import { useState, useTransition } from 'react';
import ProjectsView from '@/components/finanzaspro/ProjectsView';
import { Project, Area, DB_Usuario_Rol } from '@/lib/types';
import { createProyectoAction, deleteProyectoAction, updateProyectoAction } from '@/app/actions/proyecto.actions';
import { createAbonoAction } from '@/app/actions/abono.actions';

export default function ProjectsClient({ 
  initialProjects, userRole, areas 
}: { 
  initialProjects: Project[], userRole: DB_Usuario_Rol, areas: Area[] 
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedArea, setSelectedArea] = useState<string>('ALL');

  const handleAddProject = (newProject: any) => {
    startTransition(async () => {
      try {
        await createProyectoAction({
          name: newProject.name, client: newProject.client, amount: newProject.amount,
          fecha_inicio: newProject.fecha_inicio, fecha_fin: newProject.fecha_fin, area_id: newProject.area_id
        });
      } catch (error: any) { alert('Error creando proyecto: ' + error.message); }
    });
  };

  const handleEditProject = (id: string, data: { name: string, client: string, amount: number, fecha_inicio: string, fecha_fin: string }) => {
    startTransition(async () => {
      try {
        await updateProyectoAction(id, data);
      } catch (error: any) { alert('Error actualizando proyecto: ' + error.message); }
    });
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('¿Eliminar este proyecto y todos sus abonos? Esta acción no se puede deshacer.')) {
      startTransition(async () => {
        try {
          await deleteProyectoAction(id);
        } catch (error: any) { alert('Error eliminando: ' + error.message); }
      });
    }
  };

  const handleUpdatePaid = (id: string, amount: number, notas: string) => {
    startTransition(async () => {
      try {
        await createAbonoAction(id, amount, notas);
      } catch (error: any) { alert('Error: ' + error.message); }
    });
  };

  return (
    <div className={isPending ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
      <ProjectsView
        projects={initialProjects}
        onAddProject={handleAddProject}
        onUpdatePaid={handleUpdatePaid}
        onDeleteProject={handleDeleteProject}
        onEditProject={handleEditProject}
        userRole={userRole}
        areas={areas}
        selectedArea={selectedArea}
        onAreaChange={setSelectedArea}
      />
    </div>
  );
}
