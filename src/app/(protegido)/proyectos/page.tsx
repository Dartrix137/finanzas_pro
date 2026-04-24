import ProjectsClient from './ProjectsClient';
import { fetchProyectosUI, fetchCurrentUser, fetchAreas } from '@/app/actions/queries';

export const dynamic = 'force-dynamic';

export default async function ProyectosPage() {
  const projects = await fetchProyectosUI();
  const user = await fetchCurrentUser();
  const areas = await fetchAreas();

  return (
    <ProjectsClient
      initialProjects={projects}
      userRole={user?.rol || 'usuario'}
      areas={areas}
    />
  );
}
