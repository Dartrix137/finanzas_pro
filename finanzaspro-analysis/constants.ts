
import { Project, MonthlyGoal, User } from './types';

export const USERS: User[] = [
  { 
    id: '1', 
    name: 'Desarrollo y Automatizaciones', 
    role: 'ADMIN', 
    avatar: 'https://picsum.photos/seed/dev-automation/100/100' 
  },
  { 
    id: '2', 
    name: 'Multimedia', 
    role: 'ADMIN', 
    avatar: 'https://picsum.photos/seed/multimedia-admin/100/100' 
  },
  { 
    id: '3', 
    name: 'trafficker', 
    role: 'ADMIN', 
    avatar: 'https://picsum.photos/seed/trafficker-admin/100/100' 
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Renovación Sede Norte',
    client: 'Inmobiliaria Andes',
    amount: 45000000,
    paid: 45000000,
    status: 'facturado',
    category: 'Consultoría',
    date: '15 Oct 2023'
  },
  {
    id: '2',
    name: 'Plataforma E-commerce VIP',
    client: 'Tiendas Global',
    amount: 12500000,
    paid: 9375000,
    status: 'pendiente',
    category: 'Desarrollo',
    date: '15 Oct 2023'
  },
  {
    id: '3',
    name: 'Rediseño Marca Corporativa',
    client: 'Nexus SA',
    amount: 4800000,
    paid: 0,
    status: 'en_espera',
    category: 'Diseño',
    date: '05 Oct 2023'
  },
  {
    id: '4',
    name: 'Consultoría Logística',
    client: 'Transportes del Sur',
    amount: 12800000,
    paid: 0,
    status: 'pendiente',
    category: 'Consultoría',
    date: '20 Oct 2023'
  },
  {
    id: '5',
    name: 'Infraestructura IT',
    client: 'Tech Solutions Co',
    amount: 89200000,
    paid: 0,
    status: 'en_espera',
    category: 'Desarrollo',
    date: '22 Oct 2023'
  }
];

export const MOCK_GOALS: MonthlyGoal[] = [
  { month: 'Ene', target: 35000000, actual: 42000000 },
  { month: 'Feb', target: 35000000, actual: 31000000 },
  { month: 'Mar', target: 35000000, actual: 36000000 },
  { month: 'Abr', target: 35000000, actual: 18000000 },
  { month: 'May', target: 35000000, actual: 38000000 },
  { month: 'Jun', target: 35000000, actual: 40000000 },
  { month: 'Jul', target: 35000000, actual: 37000000 },
  { month: 'Ago', target: 35000000, actual: 33000000 },
  { month: 'Sep', target: 35000000, actual: 0 },
  { month: 'Oct', target: 35000000, actual: 0 },
  { month: 'Nov', target: 35000000, actual: 0 },
  { month: 'Dic', target: 35000000, actual: 0 },
];

export const CURRENCY_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});
