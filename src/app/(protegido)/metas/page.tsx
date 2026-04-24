import GoalsClient from './GoalsClient';
import { fetchReportesData, fetchCurrentUser } from '@/app/actions/queries';

export default async function MetasPage() {
  const currentUser = await fetchCurrentUser();
  const { metas, areas } = await fetchReportesData();

  return <GoalsClient 
    initialRawMetas={metas} 
    areas={areas} 
    userRole={currentUser?.rol as any}
    userAreaId={currentUser?.area_id || undefined}
  />;
}
