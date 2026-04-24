'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertMetaAction(tipo: 'anual' | 'mensual', periodo: string, valor: number, area_id?: string) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('No autorizado');

  const { data: profile } = await supabase.from('usuarios').select('area_id, rol').eq('id', user.id).single()
  if (!profile) throw new Error('Perfil no encontrado');
  
  if (profile.rol === 'usuario') {
    throw new Error('No tienes permisos suficientes');
  }

  const targetArea = area_id || profile.area_id; 
  if (!targetArea) throw new Error('Se requiere especificar un área para guardar metas.');

  if (valor < 0) throw new Error('Valor inválido');


  const { error } = await supabase
    .from('metas')
    .upsert({
      area_id: targetArea,
      tipo,
      periodo,
      meta_valor: valor
    }, { onConflict: 'area_id, tipo, periodo' })

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/metas')
  revalidatePath('/dashboard')
}
