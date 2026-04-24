import PortfolioClient from './PortfolioClient';
import { fetchProyectosUI, fetchCurrentUser, fetchAreas } from '@/app/actions/queries';

export const dynamic = 'force-dynamic';

export default async function CarteraPage() {
  const projects = await fetchProyectosUI();
  const user = await fetchCurrentUser();
  const areas = await fetchAreas();

  return (
    <PortfolioClient
      initialProjects={projects}
      userRole={user?.rol || 'usuario'}
      areas={areas}
    />
  );
}
