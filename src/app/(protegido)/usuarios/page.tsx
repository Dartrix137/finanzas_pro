import { redirect } from 'next/navigation';
import { fetchCurrentUser, fetchUsuariosUI, fetchAreas } from '@/app/actions/queries';
import UsuariosClient from './UsuariosClient';

export default async function UsuariosPage() {
  const currentUser = await fetchCurrentUser();
  
  if (currentUser?.rol !== 'superadmin') {
    redirect('/dashboard');
  }

  const usuarios = await fetchUsuariosUI();
  const areas = await fetchAreas();

  // Clean data structure to safely pass to client
  const serializedUsuarios = usuarios.map((u: any) => ({
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    rol: u.rol,
    area_id: u.area_id,
    area_nombre: u.areas?.nombre || 'General (Todas las áreas)',
    activo: u.activo,
    created_at: u.created_at,
  }));

  const serializedAreas = areas.map((a: any) => ({
    id: a.id,
    nombre: a.nombre,
  }));

  return <UsuariosClient usuarios={serializedUsuarios} areas={serializedAreas} currentUserId={currentUser.id} />;
}
