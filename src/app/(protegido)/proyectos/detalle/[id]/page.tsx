import { fetchProyectoById, fetchAbonosForProyecto, fetchCurrentUser } from '@/app/actions/queries';
import { notFound } from 'next/navigation';
import AbonosClient from './AbonosClient';

export const dynamic = 'force-dynamic';

export default async function ProyectoDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const [proyecto, abonos, currentUser] = await Promise.all([
    fetchProyectoById(id),
    fetchAbonosForProyecto(id),
    fetchCurrentUser(),
  ]);

  if (!proyecto) {
    notFound();
  }

  return (
    <AbonosClient
      proyecto={proyecto}
      initialAbonos={abonos}
      userRole={currentUser?.rol || 'usuario'}
    />
  );
}
