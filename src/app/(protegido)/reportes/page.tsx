import { fetchReportesData, fetchCurrentUser } from '@/app/actions/queries';
import { redirect } from 'next/navigation';
import ReportesClient from './ReportesClient';

export default async function ReportesPage() {
  const currentUser = await fetchCurrentUser();
  
  if (currentUser?.rol !== 'superadmin' && currentUser?.rol !== 'director') {
    redirect('/dashboard');
  }

  const { areas, metas, abonos } = await fetchReportesData();

  // We serialize and clean the DB records slightly
  const serializedMetas = metas.map((m: any) => ({
    id: m.id,
    area_id: m.area_id,
    area_nombre: m.areas?.nombre,
    tipo: m.tipo,
    periodo: m.periodo,
    valor: Number(m.meta_valor),
  }));

  const serializedAbonos = abonos.map((a: any) => ({
    area_id: a.proyectos?.area_id,
    monto: Number(a.monto),
    fecha: a.fecha_abono,
  }));

  const serializedAreas = areas.map((a: any) => ({
    id: a.id,
    nombre: a.nombre,
  }));

  return (
    <ReportesClient 
      areas={serializedAreas} 
      metas={serializedMetas} 
      abonos={serializedAbonos} 
      userRole={currentUser.rol as any}
      userAreaId={currentUser.area_id || undefined}
    />
  );
}
