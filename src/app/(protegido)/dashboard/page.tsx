import DashboardClient from './DashboardClient';
import { fetchProyectosUI, fetchReportesData, fetchCurrentUser } from '@/app/actions/queries';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const currentUser = await fetchCurrentUser();
  const projects = await fetchProyectosUI();
  const { areas, metas, abonos } = await fetchReportesData();

  return (
    <DashboardClient
      projects={projects}
      areas={areas}
      rawMetas={metas}
      rawAbonos={abonos}
      userRole={currentUser?.rol as any}
      userAreaId={currentUser?.area_id || undefined}
    />
  );
}
