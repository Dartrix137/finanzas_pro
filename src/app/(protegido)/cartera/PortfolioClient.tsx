'use client';

import { useState, useTransition } from 'react';
import PortfolioView from '@/components/finanzaspro/PortfolioView';
import { Project, Area } from '@/lib/types';
import { deleteProyectoAction } from '@/app/actions/proyecto.actions';
import { createAbonoAction } from '@/app/actions/abono.actions';

export default function PortfolioClient({ 
  initialProjects, userRole, areas 
}: { 
  initialProjects: Project[], userRole: string, areas: Area[] 
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedArea, setSelectedArea] = useState('ALL');

  const handleUpdatePaid = (id: string, amount: number, notas: string) => {
    startTransition(async () => {
      try {
        await createAbonoAction(id, amount, notas);
      } catch (error: any) {
        alert('Error registrando abono: ' + error.message);
      }
    });
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('¿Eliminar este proyecto y todos sus abonos? Esta acción no se puede deshacer.')) {
      startTransition(async () => {
        try {
          await deleteProyectoAction(id);
        } catch (error: any) {
          alert('Error eliminando: ' + error.message);
        }
      });
    }
  };

  return (
    <div className={isPending ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
      <PortfolioView
        projects={initialProjects}
        onUpdatePaid={handleUpdatePaid}
        onDeleteProject={handleDeleteProject}
        userRole={userRole}
        areas={areas}
        selectedArea={selectedArea}
        onAreaChange={setSelectedArea}
      />
    </div>
  );
}
