'use client';

import { useState, useMemo } from 'react';
import Dashboard from '@/components/finanzaspro/Dashboard';
import { useRouter } from 'next/navigation';
import { Project, MonthlyGoal, ViewState } from '@/lib/types';
import { MONTHS, CURRENT_YEAR_STR } from '@/lib/constants';

export default function DashboardClient({ projects, areas, rawMetas, rawAbonos, userRole, userAreaId }: {
  projects: Project[],
  areas: any[],
  rawMetas: any[],
  rawAbonos: any[],
  userRole: string,
  userAreaId?: string
}) {
  const router = useRouter();
  const [selectedArea, setSelectedArea] = useState<string>(
    userRole === 'director' ? (userAreaId || '') : 'ALL'
  );

  const handleNavigate = (view: ViewState) => {
    router.push(`/${view}`);
  };

  // Filter projects by selected area
  const filteredProjects = useMemo(() => {
    if (selectedArea === 'ALL' || userRole !== 'superadmin') return projects;
    return projects.filter(p => p.area_id === selectedArea);
  }, [selectedArea, projects, userRole]);

  // Build monthly goals from rawMetas & rawAbonos filtered by area
  const { goals, annualGoal } = useMemo(() => {
    const monthly: MonthlyGoal[] = MONTHS.map((monthStr, idx) => {
      const monthNum = (idx + 1).toString().padStart(2, '0');
      const periodStr = `${CURRENT_YEAR_STR}-${monthNum}`;

      // 1. Get metas for this month
      let monthMetas = rawMetas.filter((m: any) => m.tipo === 'mensual' && m.periodo === periodStr);
      if (selectedArea !== 'ALL') {
        monthMetas = monthMetas.filter((m: any) => m.area_id === selectedArea);
      }
      const target = monthMetas.reduce((acc: number, m: any) => acc + Number(m.meta_valor), 0);

      // 2. Get abonos for this month
      let monthAbonos = rawAbonos.filter((a: any) => a.fecha_abono?.startsWith(periodStr));
      if (selectedArea !== 'ALL') {
        monthAbonos = monthAbonos.filter((a: any) => {
          // Supabase joins can return an object or an array of 1 element
          const project = Array.isArray(a.proyectos) ? a.proyectos[0] : a.proyectos;
          return project?.area_id === selectedArea;
        });
      }
      const actual = monthAbonos.reduce((acc: number, a: any) => acc + Number(a.monto), 0);

      return { month: monthStr, target, actual };
    });

    // Annual goal calculation
    let annualMetas = rawMetas.filter((m: any) => m.tipo === 'anual' && m.periodo === CURRENT_YEAR_STR);
    if (selectedArea !== 'ALL') {
      annualMetas = annualMetas.filter((m: any) => m.area_id === selectedArea);
    }
    const annualGoal = annualMetas.reduce((acc: number, m: any) => acc + Number(m.meta_valor), 0)
      || monthly.reduce((acc, m) => acc + m.target, 0);

    return { goals: monthly, annualGoal };
  }, [rawMetas, rawAbonos, selectedArea]);

  return (
    <Dashboard
      onNavigate={handleNavigate}
      projects={filteredProjects}
      goals={goals}
      annualGoal={annualGoal}
      userRole={userRole}
      areas={areas}
      selectedArea={selectedArea}
      onAreaChange={setSelectedArea}
    />
  );
}
