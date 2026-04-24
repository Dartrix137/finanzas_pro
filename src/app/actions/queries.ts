import { createClient } from '@/lib/supabase/server'
import { Project, AbonoUI, Area, Usuario } from '@/lib/types'
import { unstable_noStore as noStore } from 'next/cache'

export async function fetchCurrentUser(): Promise<Usuario | null> {
  noStore();
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
  return profile
}

export async function fetchAreas(): Promise<Area[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('areas').select('*').order('nombre')
  if (error || !data) return []
  return data
}

export async function fetchUsuariosUI() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('usuarios')
    .select('*, areas(nombre)')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data
}

export async function fetchProyectosUI(): Promise<Project[]> {
  noStore();
  const supabase = await createClient()

  const { data: proyectos, error } = await supabase
    .from('proyectos')
    .select(`
      *,
      abonos ( monto ),
      areas ( nombre )
    `)
    .order('created_at', { ascending: false })

  if (error || !proyectos) return []

  return proyectos.map((p: any) => {
    const totalAbonado = p.abonos?.reduce((sum: number, a: any) => sum + Number(a.monto), 0) || 0;

    let uiStatus: Project['status'] = 'pendiente';
    if (p.estado === 'completado' || totalAbonado >= p.valor_total) {
      uiStatus = 'pagado'
    } else if (totalAbonado > 0) {
      uiStatus = 'facturado'
    }

    let displayDate = p.fecha_inicio;
    try {
      const d = new Date(p.fecha_inicio + 'T12:00:00');
      displayDate = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch(e) {}

    return {
      id: p.id,
      name: p.nombre,
      client: p.cliente,
      amount: Number(p.valor_total),
      paid: totalAbonado,
      status: uiStatus,
      date: displayDate,
      fecha_inicio: p.fecha_inicio,
      fecha_fin: p.fecha_fin,
      area_id: p.area_id,
      area_nombre: p.areas?.nombre || '—',
    }
  })
}

export async function fetchAbonosForProyecto(proyecto_id: string): Promise<AbonoUI[]> {
  noStore();
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('abonos')
    .select('*')
    .eq('proyecto_id', proyecto_id)
    .order('fecha_abono', { ascending: false })
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map((a: any) => ({
    id: a.id,
    proyecto_id: a.proyecto_id,
    monto: Number(a.monto),
    fecha_abono: a.fecha_abono,
    notas: a.notas,
  }))
}

export async function fetchProyectoById(id: string): Promise<Project | null> {
  noStore();
  const supabase = await createClient()
  const { data: p, error } = await supabase
    .from('proyectos')
    .select(`*, abonos(monto), areas(nombre)`)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching proyecto:', error);
    return null;
  }
  if (!p) return null;

  const totalAbonado = p.abonos?.reduce((sum: number, a: any) => sum + Number(a.monto), 0) || 0;
  let uiStatus: Project['status'] = 'pendiente';
  if (p.estado === 'completado' || totalAbonado >= p.valor_total) uiStatus = 'pagado'
  else if (totalAbonado > 0) uiStatus = 'facturado'

  let displayDate = p.fecha_inicio;
  try {
    const d = new Date(p.fecha_inicio + 'T12:00:00');
    displayDate = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch(e) {}

  return {
    id: p.id, name: p.nombre, client: p.cliente,
    amount: Number(p.valor_total), paid: totalAbonado,
    status: uiStatus, date: displayDate,
    fecha_inicio: p.fecha_inicio,
    fecha_fin: p.fecha_fin, area_id: p.area_id, area_nombre: p.areas?.nombre || '—',
  }
}

export async function fetchMetasUI(): Promise<{ monthly: import('@/lib/types').MonthlyGoal[], annualGoal: number }> {
  const supabase = await createClient()
  const currentYear = new Date().getFullYear().toString()

  const { data: metas } = await supabase.from('metas').select('*').like('periodo', `${currentYear}%`)
  const { data: abonos } = await supabase.from('abonos').select('monto, fecha_abono').like('fecha_abono', `${currentYear}-%`)

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  const monthly: import('@/lib/types').MonthlyGoal[] = months.map((monthStr, index) => {
    const monthNum = (index + 1).toString().padStart(2, '0')
    const periodStr = `${currentYear}-${monthNum}`
    const metaObj = metas?.find(m => m.periodo === periodStr && m.tipo === 'mensual')
    const actualSum = abonos?.filter(a => a.fecha_abono.startsWith(periodStr)).reduce((acc, curr) => acc + Number(curr.monto), 0) || 0
    return { month: monthStr, target: metaObj ? Number(metaObj.meta_valor) : 0, actual: actualSum }
  })

  const annualMeta = metas?.find(m => m.periodo === currentYear && m.tipo === 'anual')
  const annualGoal = annualMeta ? Number(annualMeta.meta_valor) : 0

  return { monthly, annualGoal }
}

export async function fetchReportesData() {
  noStore();
  const supabase = await createClient()
  const currentYear = new Date().getFullYear().toString()

  const { data: areasList } = await supabase.from('areas').select('*').order('nombre')
  const { data: metas } = await supabase.from('metas').select('*, areas(nombre)').like('periodo', `${currentYear}%`)
  
  const startOfYear = `${currentYear}-01-01`
  const endOfYear = `${currentYear}-12-31`

  const { data: abonosRaw, error: abonosError } = await supabase
    .from('abonos')
    .select('monto, fecha_abono, proyectos(area_id)')
    .gte('fecha_abono', startOfYear)
    .lte('fecha_abono', endOfYear)

  if (abonosError) {
    console.error('Error fetching abonos for reports:', abonosError);
  }

  return { areas: areasList || [], metas: metas || [], abonos: abonosRaw || [] }
}
