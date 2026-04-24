'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAbonoAction(proyecto_id: string, monto: number, notas?: string) {
  try {
    const supabase = await createClient()

    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session?.user) throw new Error('No autorizado');
    const user = session.user;

    const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
    if (!profile || profile.rol === 'usuario') throw new Error('Sin permisos para registrar abonos');

    if (!proyecto_id || monto <= 0) throw new Error('Datos inválidos');

    // Validate abono doesn't exceed remaining debt
    const { data: proyecto } = await supabase.from('proyectos').select('valor_total').eq('id', proyecto_id).single()
    const { data: abonosExistentes } = await supabase.from('abonos').select('monto').eq('proyecto_id', proyecto_id)
    
    if (proyecto) {
      const totalAbonado = abonosExistentes?.reduce((sum, a) => sum + Number(a.monto), 0) || 0;
      const pendiente = Number(proyecto.valor_total) - totalAbonado;
      if (monto > pendiente) {
        throw new Error(`El abono ($${monto.toLocaleString()}) supera la deuda pendiente ($${pendiente.toLocaleString()})`);
      }
    }

    const { error } = await supabase.from('abonos').insert({
      proyecto_id,
      monto,
      notas: notas || null,
      fecha_abono: new Date().toISOString().split('T')[0],
      registrado_por: user.id
    })

    if (error) throw new Error(error.message);

    // Update project status if fully paid
    const { data: abonosAll } = await supabase.from('abonos').select('monto').eq('proyecto_id', proyecto_id)
    if (proyecto && abonosAll) {
      const totalFinal = abonosAll.reduce((sum, a) => sum + Number(a.monto), 0)
      if (totalFinal >= Number(proyecto.valor_total)) {
        await supabase.from('proyectos').update({ estado: 'completado' }).eq('id', proyecto_id)
      }
    }

    revalidatePath(`/proyectos/detalle/${proyecto_id}`)
    revalidatePath('/proyectos')
    revalidatePath('/dashboard')
    revalidatePath('/cartera')
  } catch (err: any) {
    console.error('Error in createAbonoAction:', err);
    throw err;
  }
}

export async function updateAbonoAction(id: string, monto: number, fecha_abono: string, notas: string) {
  try {
    const supabase = await createClient()

    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session?.user) throw new Error('No autorizado');
    const user = session.user;

    const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
    if (!profile || profile.rol === 'usuario') throw new Error('Sin permisos');

    // Validate new monto doesn't exceed remaining debt (excluding this abono)
    const { data: abono } = await supabase.from('abonos').select('proyecto_id, monto').eq('id', id).single()
    if (!abono) throw new Error('Abono no encontrado');

    const { data: proyecto } = await supabase.from('proyectos').select('valor_total').eq('id', abono.proyecto_id).single()
    const { data: otrosAbonos } = await supabase.from('abonos').select('monto').eq('proyecto_id', abono.proyecto_id).neq('id', id)
    
    if (proyecto) {
      const totalOtros = otrosAbonos?.reduce((sum, a) => sum + Number(a.monto), 0) || 0;
      const pendiente = Number(proyecto.valor_total) - totalOtros;
      if (monto > pendiente) {
        throw new Error(`El monto ($${monto.toLocaleString()}) supera la deuda pendiente ($${pendiente.toLocaleString()})`);
      }
    }

    const { data, error } = await supabase.from('abonos').update({ monto, fecha_abono, notas }).eq('id', id).select()
    console.log(`Update abono result: error=${error?.message}, updated_rows=${data?.length}`);
    
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error('No se pudo actualizar el abono. Verifique sus permisos (RLS).');

    revalidatePath(`/proyectos/detalle/${abono.proyecto_id}`)
    revalidatePath('/proyectos')
    revalidatePath('/dashboard')
    revalidatePath('/cartera')
  } catch (err: any) {
    console.error('Error in updateAbonoAction:', err);
    throw err;
  }
}

export async function deleteAbonoAction(id: string) {
  try {
    const supabase = await createClient()

    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session?.user) throw new Error('No autorizado');
    const user = session.user;

    const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
    if (!profile || profile.rol === 'usuario') throw new Error('Sin permisos para eliminar abonos');

    // Get proyecto_id before deleting
    const { data: abono } = await supabase.from('abonos').select('proyecto_id').eq('id', id).single()
    if (!abono) throw new Error('Abono no encontrado');
    
    const { data, error } = await supabase.from('abonos').delete().eq('id', id).select()
    console.log(`Delete abono result: error=${error?.message}, deleted_rows=${data?.length}`);
    
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error('No se pudo eliminar el abono. Verifique sus permisos (RLS).');

    // Re-check project status
    const { data: proyecto } = await supabase.from('proyectos').select('valor_total, estado').eq('id', abono.proyecto_id).single()
    const { data: abonosRestantes } = await supabase.from('abonos').select('monto').eq('proyecto_id', abono.proyecto_id)
    if (proyecto && proyecto.estado === 'completado') {
      const totalRestante = abonosRestantes?.reduce((sum, a) => sum + Number(a.monto), 0) || 0;
      if (totalRestante < Number(proyecto.valor_total)) {
        await supabase.from('proyectos').update({ estado: 'activo' }).eq('id', abono.proyecto_id)
      }
    }

    revalidatePath(`/proyectos/detalle/${abono.proyecto_id}`)
    revalidatePath('/proyectos')
    revalidatePath('/dashboard')
    revalidatePath('/cartera')
  } catch (err: any) {
    console.error('Error in deleteAbonoAction:', err);
    throw err;
  }
}
