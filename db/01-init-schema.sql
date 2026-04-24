-- ==============================================================================
-- 1. EXTENSIONES Y ENUMS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLAS BASE
-- ==============================================================================

-- Áreas de negocio
CREATE TABLE areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usuarios (extiende auth.users de Supabase)
-- NOTA: auth.users debe crearse antes creando cuentas desde el Dashboard de Auth.
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  rol TEXT CHECK (rol IN ('superadmin', 'director', 'usuario')) DEFAULT 'usuario',
  area_id UUID REFERENCES areas(id), -- NULL solo permitido para el 'superadmin'
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proyectos
CREATE TABLE proyectos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  valor_total NUMERIC(12, 2) NOT NULL,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'cancelado')),
  cliente TEXT NOT NULL,
  creado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Abonos / Pagos
CREATE TABLE abonos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  monto NUMERIC(12, 2) NOT NULL,
  fecha_abono DATE NOT NULL,
  notas TEXT,
  registrado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metas Financieras
CREATE TABLE metas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('anual', 'mensual')),
  periodo TEXT NOT NULL, -- Ej: '2025' para anual, o '2025-04' para mensual
  meta_valor NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (area_id, tipo, periodo)
);

-- ==============================================================================
-- 3. SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE abonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Políticas para `areas`
-- ------------------------------------------------------------------------------
-- 1. Todo usuario autenticado puede leer la info de las áreas
CREATE POLICY "Areas visibles para usuarios auth" 
  ON areas FOR SELECT 
  TO authenticated USING (true);

-- ------------------------------------------------------------------------------
-- Políticas para `usuarios`
-- ------------------------------------------------------------------------------
-- 1. Todo el mundo puede ver los usuarios (necesario para selects de creadores y listados)
CREATE POLICY "Todos los auth ven usuarios" 
  ON usuarios FOR SELECT 
  TO authenticated USING (true);

-- 2. Solo los superadmins pueden crear/actualizar datos maestros de roles de usuario
CREATE POLICY "Solo superadmin inserta usuarios" 
  ON usuarios FOR INSERT 
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'superadmin')
  );

CREATE POLICY "Solo superadmin actualiza usuarios" 
  ON usuarios FOR UPDATE 
  TO authenticated USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'superadmin')
  );

CREATE POLICY "Solo superadmin elimina usuarios" 
  ON usuarios FOR DELETE 
  TO authenticated USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'superadmin')
  );

-- ------------------------------------------------------------------------------
-- Políticas para `proyectos`
-- ------------------------------------------------------------------------------
-- 1. Usuarios leen proyectos de su área; Superadmins leen todos.
CREATE POLICY "Leer proyectos propios o todos si es superadmin" 
  ON proyectos FOR SELECT 
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id = auth.uid() AND (u.rol = 'superadmin' OR u.area_id = proyectos.area_id)
    )
  );

-- 2. Directores y usuarios regulares insertan/actualizan proyectos en su EN SU área.
CREATE POLICY "Crear/Editar proyectos por área" 
  ON proyectos FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id = auth.uid() AND (u.rol = 'superadmin' OR u.area_id = proyectos.area_id)
    )
  );

CREATE POLICY "Superadmin y directores editan proyectos" 
  ON proyectos FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id = auth.uid() AND (u.rol = 'superadmin' OR (u.rol = 'director' AND u.area_id = proyectos.area_id))
    )
  );

-- ------------------------------------------------------------------------------
-- Políticas para `abonos`
-- ------------------------------------------------------------------------------
-- 1. Lectura: Ver abonos según los permisos de acceso al proyecto vinculado
CREATE POLICY "Leer abonos dependiendo del area" 
  ON abonos FOR SELECT 
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM proyectos p 
      JOIN usuarios u ON u.id = auth.uid() 
      WHERE p.id = abonos.proyecto_id 
      AND (u.rol = 'superadmin' OR u.area_id = p.area_id)
    )
  );

-- 2. Registro: SOLO Superadmin y Director (no usuario regular) pueden registrar pagos.
CREATE POLICY "Solo Directores y SA insertan abonos" 
  ON abonos FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proyectos p 
      JOIN usuarios u ON u.id = auth.uid() 
      WHERE p.id = abonos.proyecto_id 
      AND (u.rol = 'superadmin' OR (u.rol = 'director' AND u.area_id = p.area_id))
    )
  );

-- ------------------------------------------------------------------------------
-- Políticas para `metas`
-- ------------------------------------------------------------------------------
CREATE POLICY "Metas lectura general para su area o SA" 
  ON metas FOR SELECT 
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id = auth.uid() AND (u.rol = 'superadmin' OR u.area_id = metas.area_id)
    )
  );

CREATE POLICY "Solo Directores y SA editan metas" 
  ON metas FOR ALL 
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id = auth.uid() AND (u.rol = 'superadmin' OR (u.rol = 'director' AND u.area_id = metas.area_id))
    )
  );


-- ==============================================================================
-- 4. DATOS INICIALES (SEED DATA)
-- ==============================================================================

-- UUIDs fijos introducidos en variables (para que posteriormente al poblar
-- usuarios, puedas copiarlos y asociarlos directamente a area_id)
INSERT INTO areas (nombre, descripcion) VALUES
  ('Desarrollo y Automatizaciones', 'Área tecnológica e ingeniería de software'),
  ('Multimedia', 'Área de producción audiovisual y creativa'),
  ('Trafficker', 'Área de pauta publicitaria y marketing');
