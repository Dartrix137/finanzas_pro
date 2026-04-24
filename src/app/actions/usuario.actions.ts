'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { DB_Usuario_Rol } from '@/lib/types'

export async function createUsuarioAction(name: string, email: string, password: string, rol: DB_Usuario_Rol, area_id?: string) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('No autorizado');

  const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
  if (!profile || profile.rol !== 'superadmin') {
    throw new Error('Solo el superadmin puede crear cuentas');
  }

  // Define area
  const finalAreaId = rol === 'superadmin' ? null : (area_id || null);
  if (rol !== 'superadmin' && !finalAreaId) {
    throw new Error('Debes seleccionar un área para directores o usuarios');
  }

  const adminClient = createAdminClient()

  // 1. Create Auth User
  const { data: authData, error: createAuthError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createAuthError || !authData.user) {
    throw new Error(createAuthError?.message || 'Error creando usuario de Auth');
  }

  // 2. We don't usually need to wait for Auth hooks. We can directly insert the User into 'usuarios'.
  // We use the admin client since our RLS blocks inserts by default except for superadmin via logged in users,
  // but using the admin client makes it guaranteed to work.
  const { error: dbError } = await adminClient.from('usuarios').insert({
    id: authData.user.id,
    nombre: name,
    email: email,
    rol: rol,
    area_id: finalAreaId,
    activo: true
  })

  if (dbError) {
    // Optionally clean up the auth user if DB insert fails
    await adminClient.auth.admin.deleteUser(authData.user.id)
    throw new Error(dbError.message)
  }

  revalidatePath('/usuarios')
}


export async function updateUsuarioAction(id: string, rol: DB_Usuario_Rol, area_id?: string) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('No autorizado');

  const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
  if (!profile || profile.rol !== 'superadmin') {
    throw new Error('Solo el superadmin puede modificar roles');
  }

  const finalAreaId = rol === 'superadmin' ? null : (area_id || null);

  const { error: dbError } = await supabase.from('usuarios').update({
    rol,
    area_id: finalAreaId
  }).eq('id', id)

  if (dbError) {
    throw new Error(dbError.message)
  }

  revalidatePath('/usuarios')
}

export async function deleteUsuarioAction(id: string) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('No autorizado');

  const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
  if (!profile || profile.rol !== 'superadmin') {
    throw new Error('Solo el superadmin puede eliminar cuentas');
  }
  
  if (user.id === id) {
    throw new Error('No puedes eliminarte a ti mismo');
  }

  const adminClient = createAdminClient()

  // The 'usuarios' row is configured with ON DELETE CASCADE to auth.users, 
  // but standard Supabase practice is to delete the auth user directly and let Postgres cascade it.
  const { error } = await adminClient.auth.admin.deleteUser(id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/usuarios')
}
