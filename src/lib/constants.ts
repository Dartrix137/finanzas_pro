import { Project, MonthlyGoal, User } from './types';

const CURRENT_YEAR = new Date().getFullYear();

export const CURRENT_YEAR_STR = String(CURRENT_YEAR);

export const USERS: User[] = [
  {
    id: '1',
    name: 'Desarrollo y Automatizaciones',
    role: 'ADMIN',
    avatar: 'https://picsum.photos/seed/dev-automation/100/100',
  },
  {
    id: '2',
    name: 'Multimedia',
    role: 'ADMIN',
    avatar: 'https://picsum.photos/seed/multimedia-admin/100/100',
  },
  {
    id: '3',
    name: 'Trafficker',
    role: 'ADMIN',
    avatar: 'https://picsum.photos/seed/trafficker-admin/100/100',
  },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Renovación Sede Norte',
    client: 'Inmobiliaria Andes',
    amount: 45000000,
    paid: 45000000,
    status: 'pagado',
    category: 'Consultoría',
    date: '15 Oct 2024',
  },
  {
    id: '2',
    name: 'Plataforma E-commerce VIP',
    client: 'Tiendas Global',
    amount: 12500000,
    paid: 9375000,
    status: 'facturado',
    category: 'Desarrollo',
    date: '15 Nov 2024',
  },
  {
    id: '3',
    name: 'Rediseño Marca Corporativa',
    client: 'Nexus SA',
    amount: 4800000,
    paid: 0,
    status: 'en_espera',
    category: 'Diseño',
    date: '05 Dic 2024',
  },
  {
    id: '4',
    name: 'Consultoría Logística',
    client: 'Transportes del Sur',
    amount: 12800000,
    paid: 0,
    status: 'pendiente',
    category: 'Consultoría',
    date: '20 Ene 2025',
  },
  {
    id: '5',
    name: 'Infraestructura IT',
    client: 'Tech Solutions Co',
    amount: 89200000,
    paid: 35680000,
    status: 'facturado',
    category: 'Desarrollo',
    date: '22 Feb 2025',
  },
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

export const CATEGORIES = ['Desarrollo', 'Diseño', 'Automatización', 'Consultoría'] as const;

export const MONTHS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
] as const;

/** Unified currency formatter for COP */
export const CURRENCY_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** Short number formatter (e.g., 35M) */
export const shortNumber = (value: number): string => {
  if (value === 0) return '0';
  return `${(value / 1000000).toFixed(0)}M`;
};

/** Status badge config */
export const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pagado: {
    label: 'PAGADO',
    className: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  },
  facturado: {
    label: 'FACTURADO',
    className: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  },
  pendiente: {
    label: 'PENDIENTE',
    className: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  },
  en_espera: {
    label: 'EN ESPERA',
    className: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  },
};

/** Category icon map */
export const CATEGORY_ICONS: Record<string, string> = {
  Desarrollo: 'terminal',
  Diseño: 'palette',
  Automatización: 'smart_toy',
  'Consultoría': 'settings_suggest',
};

/** Safe localStorage helper */
export function safeGetItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function safeSetItem(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked
  }
}

export function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
}
