import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SidebarWrapper from '@/components/finanzaspro/SidebarWrapper'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // We should query the user role and area from the 'usuarios' table
  const { data: profile, error } = await supabase
    .from('usuarios')
    .select('*, areas(nombre)')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="bg-card p-8 rounded-2xl shadow-xl border border-border text-center max-w-md w-full">
          <span className="material-icons-round text-destructive text-5xl mb-4">error_outline</span>
          <h1 className="text-xl font-bold text-foreground mb-2">Perfil No Asignado</h1>
          <p className="text-sm text-muted-foreground mb-4">Tu usuario ({user.email}) no tiene acceso administrativo ni está asociado a ninguna área en la plataforma.</p>
          {error && (
            <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-lg text-left overflow-auto mb-6">
              <strong>Debug Error:</strong> {error.message} <br/>
              <strong>Code:</strong> {error.code} <br/>
              <strong>Details:</strong> {error.details}
            </div>
          )}
          <a href="/login" className="inline-flex bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all text-sm">
            Volver al inicio
          </a>
        </div>
      </div>
    )
  }

  // Construct UI user proxy object
  const uiUser = {
    id: profile.id,
    nombre: profile.nombre,
    rol: profile.rol,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nombre)}&background=random`
  } as any

  return (
    <SidebarWrapper user={uiUser}>
      {children}
    </SidebarWrapper>
  )
}
