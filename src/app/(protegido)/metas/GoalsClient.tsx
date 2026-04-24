'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import GoalsView from '@/components/finanzaspro/GoalsView';
import { MonthlyGoal, Area } from '@/lib/types';
import { upsertMetaAction } from '@/app/actions/meta.actions';
import { MONTHS, CURRENT_YEAR_STR } from '@/lib/constants';

export default function GoalsClient({ initialRawMetas, areas, userRole, userAreaId }: any) {
  const [selectedArea, setSelectedArea] = useState<string>(userRole === 'director' ? userAreaId : (areas[0]?.id || ''));
  const [isPending, startTransition] = useTransition();

  // Load the initial goals for the selected area
  const currentAreaGoals = useMemo(() => {
    return MONTHS.map((monthStr, idx) => {
      const monthNum = (idx + 1).toString().padStart(2, '0');
      const periodStr = `${CURRENT_YEAR_STR}-${monthNum}`;
      const found = initialRawMetas.find((m: any) => m.area_id === selectedArea && m.periodo === periodStr && m.tipo === 'mensual');
      return {
        month: monthStr,
        target: found ? Number(found.meta_valor) : 0,
        actual: 0 // In this view we don't show actuals
      };
    });
  }, [initialRawMetas, selectedArea]);

  const [goals, setGoals] = useState<MonthlyGoal[]>(currentAreaGoals);
  
  // Also track dirty state manually, but it's easier to just save all or compare against `currentAreaGoals`
  const hasChanges = useMemo(() => {
    return goals.some((g, i) => g.target !== currentAreaGoals[i].target);
  }, [goals, currentAreaGoals]);

  useEffect(() => {
    setGoals(currentAreaGoals);
  }, [currentAreaGoals]);

  const handleUpdateTarget = (month: string, target: string) => {
    const value = target === '' ? 0 : Math.max(0, Number(target.replace(/[^0-9]/g, '')));
    setGoals(goals.map((g) => (g.month === month ? { ...g, target: value } : g)));
  };

  const handleSaveChanges = () => {
    if (!selectedArea) {
      alert("Debes seleccionar un área válida.");
      return;
    }

    startTransition(async () => {
      let errors = 0;
      for (let i = 0; i < goals.length; i++) {
        const goal = goals[i];
        if (goal.target !== currentAreaGoals[i].target) {
          const monthNum = (i + 1).toString().padStart(2, '0');
          const periodo = `${CURRENT_YEAR_STR}-${monthNum}`;
          try {
            await upsertMetaAction('mensual', periodo, goal.target, selectedArea);
          } catch (e) {
            errors++;
            console.error(e);
          }
        }
      }

      if (errors > 0) {
        alert("Ocurrieron algunos errores al guardar. Verifica consola.");
      } else {
        alert("Metas guardadas con éxito.");
      }
    });
  };

  return (
    <div className={isPending ? "opacity-70 pointer-events-none transition-opacity" : "transition-opacity"}>
      <GoalsView
        userRole={userRole}
        areas={areas}
        selectedArea={selectedArea}
        onAreaChange={setSelectedArea}
        goals={goals}
        onUpdateTarget={handleUpdateTarget}
        onSaveChanges={handleSaveChanges}
        hasChanges={hasChanges}
      />
    </div>
  );
}
