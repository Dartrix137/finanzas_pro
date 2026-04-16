
export type ViewState = 'dashboard' | 'proyectos' | 'cartera' | 'metas';

export interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  amount: number;
  paid: number;
  status: 'facturado' | 'pendiente' | 'en_espera' | 'pagado';
  category: 'Desarrollo' | 'Diseño' | 'Automatización' | 'Consultoría';
  date: string;
}

export interface MonthlyGoal {
  month: string;
  target: number;
  actual: number;
}
