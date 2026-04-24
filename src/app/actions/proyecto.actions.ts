'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProyectoAction(data: { 
  name: string, client: string, amount: number, 
  fecha_inicio: string, fecha_fin: string, area_id?: string 
}) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('No autorizado');

  const { data: profile } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
  if (!profile) throw new Error('Perfil no encontrado');

  const { name, client, amount, fecha_inicio, fecha_fin, area_id } = data;
  if (!name || amount <= 0) throw new Error('Datos inválidos');
  if (!fecha_inicio || !fecha_fin) throw new Error('Las fechas son obligatorias');
  if (fecha_fin < fecha_inicio) throw new Error('La fecha de fin no puede ser anterior a la de inicio');

  let finalAreaId = profile.rol === 'superadmin' && area_id ? area_id : profile.area_id;
  if (!finalAreaId && profile.rol === 'superadmin') {
    const { data: fallbackArea } = await supabase.from('areas').select('id').limit(1).single();
    finalAreaId = fallbackArea?.id;
  }
  if (!finalAreaId) throw new Error('No se definió área para el proyecto.');

  const { error } = await supabase.from('proyectos').insert({
    nombre: name, cliente: client, valor_total: amount,
    fecha_inicio, fecha_fin, creado_por: user.id, area_id: finalAreaId
  })

  if (error) throw new Error(error.message);

  revalidatePath('/proyectos')
  revalidatePath('/dashboard')
  revalidatePath('/cartera')
}

export async function updateProyectoAction(id: string, data: { 
  name: string, client: string, amount: number, 
  fecha_inicio: string, fecha_fin: string 
}) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('No autorizado');

  const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
  if (!profile) throw new Error('Perfil no encontrado');
  // Rol 'usuario' CAN edit projects now


  if (data.fecha_fin < data.fecha_inicio) throw new Error('La fecha de fin no puede ser anterior a la de inicio');

  const { data: resultData, error } = await supabase
    .from('proyectos')
    .update({
      nombre: data.name, cliente: data.client, valor_total: data.amount,
      fecha_inicio: data.fecha_inicio, fecha_fin: data.fecha_fin,
    })
    .eq('id', id)
    .select()

  console.log(`Update project result: error=${error?.message}, updated_rows=${resultData?.length}`);
  if (error) throw new Error(error.message);
  if (!resultData || resultData.length === 0) throw new Error('No se pudo actualizar el proyecto. Verifique los permisos RLS en Supabase.');

  revalidatePath('/proyectos')
  revalidatePath('/dashboard')
  revalidatePath('/cartera')
}

export async function deleteProyectoAction(id: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('No autorizado');

  const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
  if (!profile || profile.rol === 'usuario') throw new Error('Sin permisos para eliminar proyectos');

  // Delete abonos first (foreign key constraint)
  const { data: deletedAbonos, error: abonosError } = await supabase.from('abonos').delete().eq('proyecto_id', id).select()
  console.log(`Delete abonos result: error=${abonosError?.message}, deleted_rows=${deletedAbonos?.length}`);

  const { data: deletedProy, error: proyError } = await supabase.from('proyectos').delete().eq('id', id).select()
  console.log(`Delete project result: error=${proyError?.message}, deleted_rows=${deletedProy?.length}`);

  if (proyError) throw new Error(proyError.message);
  if (!deletedProy || deletedProy.length === 0) throw new Error('No se pudo eliminar el proyecto. Verifique los permisos RLS en Supabase (DELETE).');

  revalidatePath('/proyectos')
  revalidatePath('/dashboard')
  revalidatePath('/cartera')
}
