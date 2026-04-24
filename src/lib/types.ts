export type DB_Usuario_Rol = 'superadmin' | 'director' | 'usuario';
export type DB_Proyecto_Estado = 'activo' | 'completado' | 'cancelado';

export interface Area {
  id: string;
  nombre: string;
  descripcion: string | null;
  created_at: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: DB_Usuario_Rol;
  area_id: string | null;
  activo: boolean;
  created_at: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string | null;
  area_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_total: number;
  estado: DB_Proyecto_Estado;
  cliente: string;
  creado_por: string | null;
  created_at: string;
}

export interface Abono {
  id: string;
  proyecto_id: string;
  monto: number;
  fecha_abono: string;
  notas: string | null;
  registrado_por: string | null;
  created_at: string;
}

export interface Meta {
  id: string;
  area_id: string;
  tipo: 'anual' | 'mensual';
  periodo: string;
  meta_valor: number;
  created_at: string;
}

export type ViewState = 'dashboard' | 'proyectos' | 'cartera' | 'metas' | 'usuarios' | 'reportes' | 'configuracion';

export interface Project {
  id: string;
  name: string;
  client: string;
  amount: number;
  paid: number;
  status: 'pendiente' | 'facturado' | 'pagado' | 'en_espera' | 'completado' | 'cancelado';
  date: string;       // fecha_inicio display
  fecha_inicio: string;
  fecha_fin: string;  // raw ISO fecha_fin
  area_id: string;
  area_nombre: string;
}

export interface AbonoUI {
  id: string;
  proyecto_id: string;
  monto: number;
  fecha_abono: string;
  notas: string | null;
}

export interface MonthlyGoal {
  month: string;
  target: number;
  actual: number;
}

