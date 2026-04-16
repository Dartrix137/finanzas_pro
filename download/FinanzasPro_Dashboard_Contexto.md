# FinanzPro Dashboard — Documentacion Completa del Contexto

> Dashboard financiero para gestionar proyectos, cartera y metas anuales.
> Desarrollado con Next.js 16 + React 19 + Tailwind CSS 4 + shadcn/ui.
> Branding: **La Filial — Estudio Digital** (`lafilial.digital`).

---

## Tabla de Contenidos

1. [Resumen del Proyecto](#1-resumen-del-proyecto)
2. [Stack Tecnologico](#2-stack-tecnologico)
3. [Estructura de Archivos](#3-estructura-de-archivos)
4. [Modelos de Datos (Types)](#4-modelos-de-datos-types)
5. [Constantes y Configuracion](#5-constantes-y-configuracion)
6. [Arquitectura de Estado](#6-arquitectura-de-estado)
7. [Componentes de la Aplicacion](#7-componentes-de-la-aplicacion)
8. [Sistema de Diseño y Branding](#8-sistema-de-diseno-y-branding)
9. [Funcionalidades Principales](#9-funcionalidades-principales)
10. [Errores Originales Encontrados y Corregidos](#10-errores-originales-encontrados-y-corregidos)
11. [Mejoras Implementadas](#11-mejoras-implementadas)
12. [Persistencia de Datos](#12-persistencia-de-datos)
13. [Navegacion](#13-navegacion)
14. [Infraestructura y Despliegue](#14-infraestructura-y-despliegue)
15. [Dependencias Disponibles pero No Utilizadas](#15-dependencias-disponibles-pero-no-utilizadas)
16. [Sugerencias Futuras](#16-sugerencias-futuras)

---

## 1. Resumen del Proyecto

**Nombre:** FinanzasPro — Dashboard Financiero
**Version:** 0.2.0
**Moneda:** COP (Pesos Colombianos), locale `es-CO`
**Idioma:** Español
**Autor/Marca:** La Filial — Estudio Digital
**URL de marca:** https://lafilial.digital/

FinanzasPro es una aplicacion web de gestion financiera disenada para que distintos departamentos de un estudio digital (Desarrollo, Multimedia, Trafficker) lleven el control de sus proyectos, pagos recibidos, cartera pendiente y metas financieras mensuales/anuales. La app funciona como un SPA (Single Page Application) dentro de Next.js App Router, con toda la logica de estado en el cliente y persistencia via `localStorage`.

La aplicacion fue reconstruida completamente desde una version original (Vite + React + TypeScript) que contenia 17 errores identificados. Se migró a Next.js 16 con shadcn/ui y se aplico la identidad visual de La Filial (azul `#004fff`, negro `#0a0a0a`, fuente Poppins).

---

## 2. Stack Tecnologico

| Categoria | Tecnologia | Version |
|---|---|---|
| **Framework** | Next.js (App Router) | 16.1.1 |
| **UI Library** | React | 19.0.0 |
| **Lenguaje** | TypeScript | 5.x |
| **Estilos** | Tailwind CSS | 4.x |
| **Componentes UI** | shadcn/ui (new-york style) | 35+ componentes |
| **Graficos** | Recharts | 3.8.1 |
| **Iconos** | Material Icons (Round) | Google Fonts CDN |
| **Font** | Poppins (Google Fonts) | 300-900 |
| **Toasts** | Sonner | 2.0.6 |
| **ORM** | Prisma (SQLite) | 6.11.1 |
| **Runtime** | Bun | — |
| **Servidor Web** | Caddy (reverse proxy, puerto 81) | — |
| **Animaciones** | CSS custom (`fadeIn`, `fadeInScale`, `slideInLeft`) | — |
| **Build Output** | Next.js standalone | — |

---

## 3. Estructura de Archivos

```
/home/z/my-project/
├── package.json                          # Dependencias y scripts
├── tsconfig.json                         # Configuracion TypeScript
├── next.config.ts                        # Configuracion Next.js (standalone output)
├── tailwind.config.ts                    # HSL CSS var-based theme, dark mode: class
├── postcss.config.mjs                    # @tailwindcss/postcss plugin
├── eslint.config.mjs                     # Reglas ESLint (relajadas)
├── components.json                       # shadcn/ui config (new-york, lucide)
├── Caddyfile                             # Reverse proxy en :81
├── bun.lock                              # Lockfile de Bun
├── worklog.md                            # Historial de trabajo del agente
├── lafilial_theme.css                    # Tema La Filial (CSS standalone)
├── lafilial_raw.html                     # HTML scrapeado de lafilial.digital
├── lafilial_page.json                    # Metadata de la pagina La Filial
│
├── prisma/
│   └── schema.prisma                     # Schema Prisma (User + Post, scaffold)
│
├── db/
│   └── custom.db                         # Base de datos SQLite
│
├── public/
│   ├── logo.svg                          # Logo de la app
│   └── robots.txt                        # Robots estandar allow-all
│
├── upload/
│   ├── pasted_image_*.png                # Capturas de pantalla del usuario
│   └── finanzaspro-dashboard.zip         # ZIP original de la app analizada
│
├── finanzaspro-analysis/                 # APP ORIGINAL (pre-rebuild, referencia)
│   ├── package.json                      # Vite + React 19 + Recharts
│   ├── vite.config.ts                    # Config Vite con env vars Gemini
│   ├── index.html                        # Tailwind CDN, importmap (roto)
│   ├── tsconfig.json
│   ├── README.md                         # README original (AI Studio)
│   ├── metadata.json                     # Metadata de la app
│   ├── types.ts                          # Tipos originales
│   ├── constants.ts                      # Constantes originales
│   ├── index.tsx                         # Entry point original
│   ├── App.tsx                           # App component original
│   └── components/
│       ├── Dashboard.tsx
│       ├── Login.tsx
│       ├── Sidebar.tsx
│       ├── ProjectsView.tsx
│       ├── PortfolioView.tsx
│       └── GoalsView.tsx
│
└── src/                                  # CODIGO FUENTE PRINCIPAL
    ├── app/
    │   ├── layout.tsx                    # Root layout (Poppins, Sonner, lang="es")
    │   ├── page.tsx                      # Pagina principal (toda la logica de estado)
    │   ├── globals.css                   # CSS completo: Tailwind 4, tema La Filial, animaciones
    │   └── api/
    │       └── route.ts                  # API stub: GET /api
    │
    ├── lib/
    │   ├── utils.ts                      # Helper cn() (clsx + tailwind-merge)
    │   ├── types.ts                      # Tipos: ViewState, User, Project, MonthlyGoal
    │   ├── constants.ts                  # Usuarios, mock data, formatters, status config, LS helpers
    │   └── db.ts                         # Prisma client singleton (SQLite)
    │
    ├── hooks/
    │   ├── use-toast.ts                  # Sistema de toast (patron shadcn/ui)
    │   └── use-mobile.ts                 # Hook breakpoint mobile (768px)
    │
    └── components/
        ├── ui/                           # ~35 componentes shadcn/ui
        │   ├── accordion.tsx
        │   ├── alert-dialog.tsx
        │   ├── alert.tsx
        │   ├── aspect-ratio.tsx
        │   ├── avatar.tsx
        │   ├── badge.tsx
        │   ├── breadcrumb.tsx
        │   ├── button.tsx
        │   ├── calendar.tsx
        │   ├── card.tsx
        │   ├── carousel.tsx
        │   ├── chart.tsx
        │   ├── checkbox.tsx
        │   ├── collapsible.tsx
        │   ├── command.tsx
        │   ├── context-menu.tsx
        │   ├── dialog.tsx
        │   ├── drawer.tsx
        │   ├── dropdown-menu.tsx
        │   ├── form.tsx
        │   ├── hover-card.tsx
        │   ├── input-otp.tsx
        │   ├── input.tsx
        │   ├── label.tsx
        │   ├── menubar.tsx
        │   ├── navigation-menu.tsx
        │   ├── pagination.tsx
        │   ├── popover.tsx
        │   ├── progress.tsx
        │   ├── radio-group.tsx
        │   ├── resizable.tsx
        │   ├── scroll-area.tsx
        │   ├── select.tsx
        │   ├── separator.tsx
        │   ├── sheet.tsx
        │   ├── sidebar.tsx
        │   ├── skeleton.tsx
        │   ├── slider.tsx
        │   ├── sonner.tsx                # Toaster activo (usado en layout.tsx)
        │   ├── switch.tsx
        │   ├── table.tsx
        │   ├── tabs.tsx
        │   ├── textarea.tsx
        │   ├── toast.tsx
        │   ├── toaster.tsx
        │   ├── toggle-group.tsx
        │   ├── toggle.tsx
        │   └── tooltip.tsx
        │
        └── finanzaspro/                  # COMPONENTES ESPECIFICOS DE LA APP
            ├── Login.tsx                 # Selector de perfil (3 departamentos)
            ├── Sidebar.tsx               # Navegacion lateral con perfil de usuario
            ├── Dashboard.tsx             # KPIs + grafico barras + pastel + tabla proyectos
            ├── ProjectsView.tsx          # CRUD de proyectos + modal de pago + barras de progreso
            ├── PortfolioView.tsx         # Tabla de cartera + busqueda + modal de pago
            └── GoalsView.tsx             # Editor de metas mensuales + dark mode + exportar JSON
```

---

## 4. Modelos de Datos (Types)

Definidos en `src/lib/types.ts`:

```typescript
// Vistas de navegacion
export type ViewState = 'dashboard' | 'proyectos' | 'cartera' | 'metas';

// Perfil de usuario
export interface User {
  id: string;       // '1', '2', '3'
  name: string;     // 'Desarrollo y Automatizaciones', 'Multimedia', 'Trafficker'
  role: string;     // 'ADMIN'
  avatar: string;   // URL de picsum.photos
}

// Proyecto / Factura
export interface Project {
  id: string;                    // ID aleatorio (Math.random)
  name: string;                  // Nombre del proyecto
  client: string;                // Nombre del cliente
  amount: number;                // Valor total en COP
  paid: number;                  // Monto pagado en COP
  status: 'facturado' | 'pendiente' | 'en_espera' | 'pagado';
  category: 'Desarrollo' | 'Diseño' | 'Automatización' | 'Consultoría';
  date: string;                  // Fecha formateada (ej: '15 Oct 2024')
}

// Meta mensual
export interface MonthlyGoal {
  month: string;    // 'Ene', 'Feb', ... 'Dic'
  target: number;   // Meta en COP
  actual: number;   // Real alcanzado en COP
}
```

---

## 5. Constantes y Configuracion

Definidas en `src/lib/constants.ts`:

### Usuarios Predefinidos

| ID | Nombre | Rol |
|---|---|---|
| 1 | Desarrollo y Automatizaciones | ADMIN |
| 2 | Multimedia | ADMIN |
| 3 | Trafficker | ADMIN |

### Datos Mock de Proyectos

5 proyectos de ejemplo con diferentes estados (`pagado`, `facturado`, `en_espera`, `pendiente`) y categorias.

### Metas Mensuales Mock

12 metas con target de $35,000,000 COP/mes, con datos de muestra para Ene-Ago y ceros para Sep-Dic.

### Categorias Disponibles

`Desarrollo`, `Diseño`, `Automatización`, `Consultoría`

### Meses del Ano

`Ene`, `Feb`, `Mar`, `Abr`, `May`, `Jun`, `Jul`, `Ago`, `Sep`, `Oct`, `Nov`, `Dic`

### Formateador de Moneda

```typescript
// Formato: $XX,XXX (COP, sin decimales)
export const CURRENCY_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});
```

### Configuracion de Estados (Badges)

| Estado | Color Light | Color Dark |
|---|---|---|
| `pagado` | Verde (emerald) | Verde oscuro |
| `facturado` | Azul (blue) | Azul oscuro |
| `pendiente` | Ambar (amber) | Ambar oscuro |
| `en_espera` | Gris (slate) | Gris oscuro |

### Iconos de Categoria

| Categoria | Icono Material |
|---|---|
| Desarrollo | `terminal` |
| Diseño | `palette` |
| Automatización | `smart_toy` |
| Consultoría | `settings_suggest` |

### Helpers de localStorage (SSR-safe)

```typescript
safeGetItem<T>(key: string, fallback: T): T    // Lee de localStorage con fallback
safeSetItem(key: string, value: unknown): void  // Escribe a localStorage
safeRemoveItem(key: string): void               // Elimina de localStorage
```

Todos verifican `typeof window === 'undefined'` antes de acceder y envuelven en `try/catch`.

---

## 6. Arquitectura de Estado

Toda la gestion de estado vive en `src/app/page.tsx` (componente `Home`).

### Hook Personalizado: `useStoredState<T>`

```typescript
function useStoredState<T>(key: string, fallback: T):
  [T, React.Dispatch<React.SetStateAction<T>>]
```

- Inicializa el estado leyendo de `localStorage` via `safeGetItem`
- Cada vez que el estado cambia, sincroniza automaticamente con `localStorage` via `safeSetItem`
- SSR-safe: no lanza errores en el servidor

### Hook Personalizado: `useHash`

```typescript
function useHash(): ViewState
```

- Escucha cambios en `window.location.hash`
- Valida que el hash sea uno de: `dashboard`, `proyectos`, `cartera`, `metas`
- Retorna el `ViewState` actual

### Estado Global en `Home`

| State | Key de localStorage | Tipo | Default |
|---|---|---|---|
| `currentUser` | `finpro_user` | `User \| null` | `null` |
| `isDarkMode` | `finpro_darkmode` | `boolean` | `false` |
| `projects` | `finpro_projects` | `Project[]` | `MOCK_PROJECTS` |
| `goals` | `finpro_goals_{userId}` | `MonthlyGoal[]` | `MOCK_GOALS` |
| `currentView` | (URL hash) | `ViewState` | `'dashboard'` |
| `isMobileMenuOpen` | (volatile) | `boolean` | `false` |

### Efectos Secundarios

1. **Auth:** Cuando `currentUser` cambia, sincroniza con `localStorage`
2. **Dark Mode:** Cuando `isDarkMode` cambia, agrega/remueve la clase `dark` en `<html>`
3. **Navegacion:** `useHash` escucha el evento `hashchange` del navegador

### Handlers Principales

```typescript
handleLogin(user: User)           // Establece usuario autenticado
handleLogout()                    // Limpia usuario, redirige a #dashboard
handleAddProject(newProject)      // Crea proyecto con id aleatorio, status 'pendiente', paid 0
handleDeleteProject(id)           // Elimina proyecto con confirmacion
handleUpdatePaid(id, amount)      // Abona pago, actualiza status automaticamente
```

**Logica de actualizacion de estado al pagar:**
- Si `paid >= amount` → estado cambia a `pagado`
- Si `paid > 0` (pero menor al total) → estado cambia a `facturado`
- El monto se limita con `Math.min(paid + amount, project.amount)`

---

## 7. Componentes de la Aplicacion

### 7.1 Login (`src/components/finanzaspro/Login.tsx`)

**Prop:** `onLogin: (user: User) => void`

Pantalla de seleccion de perfil. Muestra tres tarjetas con avatar, nombre y rol para cada departamento. Al seleccionar un perfil, invoca `onLogin` y el usuario accede al dashboard.

**Elementos visuales:**
- Logo de FinanzasPro con icono `payments`
- Titulo "Bienvenido a FinanzasPro"
- Tres botones tipo tarjeta con avatar circular, nombre, rol y flecha
- Footer: "Powered by La Filial — Estudio Digital"
- Animacion: `animate-fadeInScale`

### 7.2 Sidebar (`src/components/finanzaspro/Sidebar.tsx`)

**Props:** `currentView`, `onNavigate`, `isOpen`, `onClose`, `user`, `onLogout`

Barra lateral de navegacion fija (desktop: `w-64`, mobile: overlay con backdrop). Contiene:

- **Header:** Logo FinanzasPro con icono `payments`
- **Navegacion:** 4 items con icono Material Icons
  - Dashboard (`dashboard`)
  - Proyectos (`business_center`)
  - Cartera (`account_balance_wallet`)
  - Reportes / Metas (`bar_chart`)
- **Footer:** Link de Configuracion + perfil de usuario con avatar, nombre, rol y boton "Cerrar Sesion"

**Comportamiento responsive:**
- Desktop (lg+): Sidebar fija, siempre visible (`lg:translate-x-0`)
- Mobile: Sidebar se muestra/oculta con animacion de transform, overlay oscuro

### 7.3 Dashboard (`src/components/finanzaspro/Dashboard.tsx`)

**Props:** `onNavigate`, `projects`, `goals`

Vista principal con 4 secciones:

#### KPI Cards (4 tarjetas)
| KPI | Descripcion | Icono |
|---|---|---|
| Total Recaudado | Suma de todos los `paid` | `description` |
| Cartera Pendiente | Suma de `amount - paid` | `pending_actions` |
| % de Meta Anual | `(totalFacturado / annualGoal) * 100` | `track_changes` |
| Proyeccion Anual | `totalFacturado * 1.2` (+20%) | `insights` |

#### Grafico de Barras (Recharts)
- Compara meta mensual vs. real por cada mes
- Barras: `meta` (gris claro) vs. `actual` (azul primario `#004fff`)
- Tooltips con formato de moneda COP
- Eje Y con formato corto (ej: `35M`)

#### Grafico de Pastel (Recharts)
- Muestra porcentaje de meta anual alcanzada
- Donut chart con `innerRadius=60`, `outerRadius=85`
- Centro: porcentaje grande + etiqueta "ALCANZADO"
- Leyenda: Meta Total vs. Recaudado

#### Tabla de Proyectos Recientes
- Muestra los primeros 5 proyectos
- Columnas: Proyecto, Cliente, Monto, Estado (badge de color)
- Link "Ver todos" que navega a `#proyectos`
- Boton "Exportar" (imprimir) y "Nuevo Proyecto"

### 7.4 ProjectsView (`src/components/finanzaspro/ProjectsView.tsx`)

**Props:** `projects`, `onAddProject`, `onUpdatePaid`, `onDeleteProject`

Vista de gestion de proyectos con dos columnas:

#### Tarjetas de Resumen (3)
- Total Proyectado (suma de `amount`)
- Total Recaudado (suma de `paid`) con barra de progreso
- Pendiente de Cobro (diferencia)

#### Listado de Proyectos
Cada proyecto se muestra como tarjeta con:
- Icono de categoria (Material Icons)
- Nombre, categoria (badge), fecha, estado (badge)
- Monto total
- Barra de progreso de abonos con porcentaje
- Boton "Abonar" (si hay saldo pendiente) o badge "Pagado" (verde)
- Boton eliminar (icono rojo)

#### Formulario "Nuevo Proyecto" (sticky sidebar)
- Campo Nombre (texto, required)
- Campo Cliente (texto, required)
- Selector de Categoria (dropdown: Desarrollo, Diseño, Automatización, Consultoria)
- Campo Valor (numero COP, con prefijo $, min=0)
- Selector de Fecha (date picker nativo)
- Boton "Registrar Proyecto"

#### Modal de Pago
- Muestra nombre del proyecto y monto pendiente
- Input para monto del pago (max = pendiente)
- Botones Cancelar / Confirmar

### 7.5 PortfolioView (`src/components/finanzaspro/PortfolioView.tsx`)

**Props:** `projects`, `onUpdatePaid`, `onDeleteProject`

Vista de cartera (cuentas por cobrar):

#### Tarjetas de Resumen (4)
- Total Cartera, Con Deuda, Proyeccion Q4, Eficiencia (72%)

#### Tabla de Proyectos con Deuda
- Filtra proyectos donde `amount > paid`
- Buscador por nombre de proyecto o cliente
- Columnas: Proyecto/Cliente, Valor Pendiente, Vencimiento, Estado, Accion
- Botones: Abonar (azul) y Eliminar (rojo)
- Estado vacio cuando no hay resultados

#### Modal de Pago
- Identico al de ProjectsView: nombre del proyecto, pendiente, input de monto, confirmar/cancelar

### 7.6 GoalsView (`src/components/finanzaspro/GoalsView.tsx`)

**Props:** `goals`, `setGoals`, `isDarkMode`, `toggleDarkMode`

Vista de configuracion de metas anuales:

#### Header
- Icono `wallet` con titulo "Metas Anuales"
- Meta total anual calculada (suma de todos los `target`)

#### Grid de 12 Meses
- Cada mes es una tarjeta editable
- Input numerico para meta sugerida (min=0)
- Sanitiza el input eliminando caracteres no numericos con `replace(/[^0-9]/g, '')`

#### Panel Lateral
- **Preferencias:** Toggle de Modo Oscuro (persistido en localStorage)
- **Datos:** Boton para exportar metas como archivo JSON (`finanzas_pro_metas_{timestamp}.json`)

---

## 8. Sistema de Diseno y Branding

### Paleta de Colores (La Filial)

Extraida de https://lafilial.digital/

| Token | Light | Dark | Descripcion |
|---|---|---|---|
| `--primary` | `#004fff` | `#004fff` | Azul principal (invariable) |
| `--primary-foreground` | `#ffffff` | `#ffffff` | Texto sobre primario |
| `--background` | `#ffffff` | `#0a0a0a` | Fondo principal |
| `--foreground` | `#0a0a0a` | `#f5f5f5` | Texto principal |
| `--card` | `#ffffff` | `#141414` | Fondo de tarjetas |
| `--border` | `#e5e5e5` | `rgba(255,255,255,0.08)` | Bordes |
| `--muted` | `#f5f5f5` | `#1a1a1a` | Fondos secundarios |
| `--accent` | `#f0f4ff` | `#0d1a33` | Acentos |
| `--destructive` | `#ef4444` | `#ef4444` | Error/eliminar |

### Colores de Graficos (Gradiente Azul)

| Token | Valor |
|---|---|
| `--chart-1` | `#004fff` |
| `--chart-2` | `#0b4eff` |
| `--chart-3` | `#3b82f6` |
| `--chart-4` | `#60a5fa` |
| `--chart-5` | `#93c5fd` |

### Tipografia

- **Fuente principal:** Poppins (Google Fonts)
- **Pesos cargados:** 300, 400, 500, 600, 700, 800, 900
- **Iconos:** Material Icons Round (Google Fonts CDN)
- **Iconos UI:** Lucide React (via shadcn/ui)

### Animaciones CSS Custom

```css
@keyframes fadeIn       { opacity: 0; translateY(12px) → opacity: 1; translateY(0) }     /* 0.4s */
@keyframes fadeInScale  { opacity: 0; scale(0.95) → opacity: 1; scale(1) }             /* 0.3s */
@keyframes slideInLeft  { opacity: 0; translateX(-20px) → opacity: 1; translateX(0) }  /* 0.3s */
```

### Scrollbar Custom

- Ancho: 6px
- Track: transparente
- Thumb: `#d4d4d4` (light) / `#333333` (dark), border-radius: 10px

### Estilos de Impresion

- Clase `.no-print`: oculta elementos al imprimir
- `.printable-area`: elimina padding/margin al imprimir

### Dark Mode

- Implementado via clase CSS `.dark` en `<html>`
- Persistido en `localStorage` (key: `finpro_darkmode`)
- Toggle disponible en la vista de Metas
- Todas las variables CSS se redefinen bajo `.dark { ... }`

---

## 9. Funcionalidades Principales

### Autenticacion
- Selector de perfil (no hay login con contraseña)
- 3 perfiles predefinidos: Desarrollo y Automatizaciones, Multimedia, Trafficker
- Sesion persistida en `localStorage` (key: `finpro_user`)
- Cerrar sesion limpia el estado y redirige a `#dashboard`

### Dashboard Principal
- 4 tarjetas KPI con datos en tiempo real
- Grafico de barras: progreso mensual vs. meta
- Grafico de pastel: porcentaje de meta anual alcanzada
- Tabla de proyectos recientes (5 ultimos)
- Boton exportar (window.print)
- Boton "Nuevo Proyecto" que navega a la vista de proyectos

### Gestion de Proyectos (CRUD)
- Crear proyectos con: nombre, cliente, categoria, valor, fecha
- Listar todos los proyectos con barra de progreso individual
- Registrar abonos parciales via modal de pago
- Eliminar proyectos con confirmacion
- Estados automaticos al pagar: pendiente → facturado → pagado
- 4 categorias con iconos distinctivos
- Selector de fecha nativo (date picker)

### Cartera (Cuentas por Cobrar)
- Vista filtrada de proyectos con deuda pendiente
- Busqueda por nombre de proyecto o cliente
- 4 metricas de resumen
- Modal de pago para abonos parciales
- Opcion de eliminar proyectos

### Metas Anuales
- Grid editable de 12 meses
- Meta total anual calculada automaticamente
- Toggle de modo oscuro
- Exportacion de datos como archivo JSON
- Sanitizacion de inputs (solo numeros positivos)

### Navegacion
- Hash-based routing (`#dashboard`, `#proyectos`, `#cartera`, `#metas`)
- Sidebar con menu activo resaltado
- Responsive: hamburger menu en mobile, sidebar fija en desktop

---

## 10. Errores Originales Encontrados y Corregidos

Se identificaron **17 errores** en la app original (Vite + React + TypeScript), clasificados en 4 niveles de severidad:

### Criticos (3)

1. **Archivo `index.css` faltante:** La app importaba `./index.css` pero el archivo no existia. Esto causaba un error de compilacion que impedía que la app arrancara.
   - **Fix:** Se creo el archivo con las animaciones (`fadeIn`, `fadeInScale`, `slideUp`) y estilos base.

2. **`<script type="importmap">` en `index.html` conflictivo:** El HTML original contenia un importmap que entraba en conflicto con la resolucion de modulos de Vite, causando errores de importacion en el navegador.
   - **Fix:** Se elimino el importmap del `index.html` original. En la reconstruccion con Next.js no fue necesario.

3. **Falta de `@types/react` y `@types/react-dom` en dependencias:** TypeScript no tenia los tipos de React, causando errores de compilacion en desarrollo.
   - **Fix:** Se agregaron ambas dependencias al `package.json`.

### Funcionales (6)

4. **`substr()` deprecated:** El codigo original usaba `substr()` que es un metodo deprecado de JavaScript.
   - **Fix:** Se reemplazo por `substring()` en todas las ocurrencias.

5. **Logica de estado al pagar incorrecta:** El handler `handleUpdatePaid` no actualizaba correctamente el estado del proyecto cuando se recibia un pago (no cambiaba de `pendiente` a `facturado` o `pagado`).
   - **Fix:** Se implemento logica condicional: `paid >= amount` → `pagado`, `paid > 0` → `facturado`.

6. **`useCallback` innecesario causando advertencias del React Compiler:** El compilador de React 19 maneja la memoizacion automaticamente. El uso manual de `useCallback` generaba advertencias de lint.
   - **Fix:** Se eliminaron todos los `useCallback` manuales, dejando que el compilador optimice.

7. **`useEffect` para leer localStorage en montaje:** El patron `useEffect(() => { const val = localStorage.getItem(...); setState(val); }, [])` causaba parpadeo de UI y advertencias del compilador.
   - **Fix:** Se refactorizo a inicializacion perezosa en `useState`: `useState(() => safeGetItem(key, default))`.

8. **Referencia residual a `localValue` en GoalsView:** Despues de un refactor, quedo una referencia a una variable `localValue` que ya no existia, causando un error de ReferenceError.
   - **Fix:** Se elimino la referencia y se conecto correctamente el estado.

9. **Variable de entorno `GEMINI_API_KEY` expuesta innecesariamente:** El `vite.config.ts` original exponia la API key de Gemini sin que la app la usara.
   - **Fix:** Se elimino del config de Vite.

### de Presentacion (4)

10. **Formato de moneda inconsistente:** Algunos lugares mostraban `$XX,XXX` y otros solo `XX,XXX` sin simbolo.
    - **Fix:** Se unifico con `CURRENCY_FORMATTER` (`Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' })`).

11. **Solo 2 estados visuales (pagado/pendiente):** La app solo diferenciaba entre pagado y pendiente, sin estados intermedios.
    - **Fix:** Se implementaron 4 estados con badges de color: `pagado` (verde), `facturado` (azul), `pendiente` (ambar), `en_espera` (gris).

12. **Ano hardcodeado:** El dashboard mostraba un ano fijo en lugar del ano actual.
    - **Fix:** Se implemento `CURRENT_YEAR_STR` via `new Date().getFullYear()`.

13. **Sin selector de categoria ni date picker en formulario:** El formulario de nuevo proyecto no tenia forma de seleccionar categoria ni fecha.
    - **Fix:** Se agrego un dropdown de categoria (4 opciones) y un input tipo `date` nativo.

### Menores (4)

14. **Sin persistencia de dark mode:** Al recargar la pagina, el modo oscuro se reiniciaba.
    - **Fix:** Se persiste en `localStorage` (key: `finpro_darkmode`).

15. **Sin modal de pago parcial en Cartera:** La vista de cartera solo permitia "pagar todo" sin opcion de abonos parciales.
    - **Fix:** Se implemento modal con input para monto personalizado.

16. **Sin animaciones de transicion:** Los cambios de vista eran abruptos.
    - **Fix:** Se agregaron animaciones CSS (`fadeIn`, `fadeInScale`, `slideInLeft`).

17. **Sin boton funcional de guardado en Metas:** El boton de guardar metas no estaba conectado a ninguna logica.
    - **Fix:** Los inputs de meta actualizan el estado en tiempo real; los cambios se guardan automaticamente en `localStorage`.

---

## 11. Mejoras Implementadas

Ademas de corregir los 17 errores, se implementaron las siguientes mejoras:

1. **Migracion a Next.js 16:** La app original (Vite) se reconstruyo completamente en Next.js 16 con App Router, obteniendo SSR, optimizacion de imagenes, y mejor estructura de proyecto.

2. **shadcn/ui:** Se integro la libreria completa de componentes (35+ componentes) para asegurar UI consistente y accesible.

3. **Identidad visual La Filial:** Toda la paleta de colores se extrajo del sitio web de La Filial y se aplico de forma consistente en light y dark mode.

4. **Responsive design completo:** Sidebar colapsable en mobile, grids adaptativos, tablas con scroll horizontal, y modales full-width en pantallas pequenas.

5. **Barras de progreso en proyectos:** Cada proyecto muestra visualmente el porcentaje de pago recibido.

6. **Busqueda en cartera:** La vista de cartera incluye un buscador que filtra por nombre de proyecto o cliente.

7. **Metricas de resumen:** Cada vista incluye tarjetas KPI con datos calculados en tiempo real.

8. **Exportacion a JSON:** La vista de metas permite descargar los datos como archivo JSON.

9. **Exportacion a PDF/Impresion:** El dashboard tiene boton de exportar que usa `window.print()`.

10. **Proyeccion financiera:** El dashboard incluye una tarjeta de "Proyeccion Anual" que calcula el estimado con un factor de crecimiento del 20%.

11. **Scrollbar personalizado:** Scrollbars estilizados que coinciden con el tema light/dark.

12. **Sanitizacion de inputs:** Los campos numericos validan valores positivos y eliminan caracteres no numericos.

13. **Confirmation dialogs:** La eliminacion de proyectos requiere confirmacion del usuario.

14. **Toast notifications:** Sonner integrado en el layout para notificaciones futuras.

15. **Tipografia profesional:** Poppins en 7 pesos tipograficos para jerarquia visual clara.

---

## 12. Persistencia de Datos

La app utiliza `localStorage` del navegador como base de datos local. Todos los helpers son SSR-safe:

| Key | Tipo | Descripcion |
|---|---|---|
| `finpro_user` | `User \| null` | Usuario autenticado |
| `finpro_darkmode` | `boolean` | Preferencia de modo oscuro |
| `finpro_projects` | `Project[]` | Lista de proyectos |
| `finpro_goals_{userId}` | `MonthlyGoal[]` | Metas mensuales (por usuario) |

**Nota:** Cada usuario tiene sus propias metas almacenadas bajo una clave unica (`finpro_goals_1`, `finpro_goals_2`, etc.), pero los proyectos se comparten entre todos los usuarios.

---

## 13. Navegacion

La navegacion se implementa via **hash-based routing**:

| Hash | Vista | Componente |
|---|---|---|
| `#dashboard` | Dashboard Principal | `Dashboard.tsx` |
| `#proyectos` | Gestion de Proyectos | `ProjectsView.tsx` |
| `#cartera` | Cartera Pendiente | `PortfolioView.tsx` |
| `#metas` | Metas Anuales | `GoalsView.tsx` |

El hook `useHash` escucha el evento `hashchange` del navegador y actualiza el estado de `currentView`. Al hacer logout, se redirige a `#dashboard`.

---

## 14. Infraestructura y Despliegue

### Scripts

```bash
bun run dev      # Desarrollo en puerto 3000
bun run build    # Build de produccion (standalone)
bun run start    # Servir produccion con Bun
bun run lint     # Linting con ESLint
```

### Build de Produccion

1. `next build` genera el standalone output
2. Se copian los assets estaticos y la carpeta `public/` al standalone
3. Se sirve con `NODE_ENV=production bun .next/standalone/server.js`

### Caddy (Reverse Proxy)

Configurado en `Caddyfile` para servir en puerto `:81` con transformacion de puerto dinamica via `XTransformPort`.

### API

- `GET /api` → `{ "message": "Hello, world!" }` (stub, sin logica real)

### Prisma + SQLite

- Schema definido en `prisma/schema.prisma` con modelos `User` y `Post`
- **Nota:** Estos modelos son un scaffold y NO se usan actualmente en la app. Los datos reales se manejan via `localStorage`.

---

## 15. Dependencias Disponibles pero No Utilizadas

El proyecto tiene instaladas varias librerias que **no estan siendo utilizadas** activamente en la aplicacion. Estas estan disponibles para futuras implementaciones:

| Paquete | Uso Potencial |
|---|---|
| `zustand` | State management global (alternativa a useState + localStorage) |
| `@dnd-kit/*` | Drag and drop (reordenar proyectos, metas) |
| `@tanstack/react-query` | Server state management, cache, fetching |
| `@tanstack/react-table` | Tablas avanzadas con sorting, filtering, pagination |
| `react-hook-form` + `zod` | Formularios con validacion robusta |
| `next-auth` | Autenticacion real con credenciales/OAuth |
| `next-intl` | Internacionalizacion (actualmente hardcodeado en ES) |
| `framer-motion` | Animaciones avanzadas (reemplazar animaciones CSS) |
| `@mdxeditor/editor` | Editor de contenido MDX |
| `date-fns` | Utilidades de fecha (actualmente se usa `toLocaleDateString`) |
| `react-day-picker` | Selector de fecha avanzado |
| `sharp` | Procesamiento de imagenes en servidor |
| `react-markdown` + `react-syntax-highlighter` | Renderizado de Markdown |

---

## 16. Sugerencias Futuras

Basado en el analisis de la app y las dependencias disponibles, estas son las mejoras sugeridas para futuras iteraciones:

### Alta Prioridad
- **Backend real con API:** Migrar de `localStorage` a una API REST con Prisma + SQLite para persistencia real y comparticion de datos entre dispositivos.
- **Autenticacion real:** Implementar `next-auth` con credenciales para reemplazar el selector de perfil actual.
- **Validacion de formularios:** Usar `react-hook-form` + `zod` para validacion robusta en los formularios de proyectos.

### Media Prioridad
- **Tablas avanzadas:** Migrar a `@tanstack/react-table` para sorting, pagination y filtering en la vista de cartera.
- **Internationalizacion:** Configurar `next-intl` para soporte multiidioma.
- **Drag and drop:** Usar `@dnd-kit` para reordenar proyectos y metas arrastrando.
- **Notificaciones de pago:** Usar Sonner para mostrar toasts cuando se registra un pago o se elimina un proyecto.

### Baja Prioridad
- **Animaciones avanzadas:** Migrar animaciones CSS a `framer-motion` para transiciones mas fluidas.
- **Graficos interactivos:** Agregar mas tipos de graficos (lineas, area) con Recharts.
- **Exportacion a PDF:** Implementar generacion de reportes PDF con datos reales (no solo `window.print`).
- **Dashboard por usuario:** Permitir que cada departamento tenga sus propios proyectos (no compartir).
- **Roles y permisos:** Implementar roles reales con diferentes niveles de acceso.

---

## Historial de Versiones

| Version | Cambios |
|---|---|
| **0.1.0 (Original)** | App original Vite + React + TypeScript con 17 errores conocidos |
| **0.2.0 (Rebuild)** | Reconstruccion completa en Next.js 16 con shadcn/ui, La Filial branding, todos los errores corregidos y 15 mejoras implementadas |

---

*Documento generado automaticamente a partir del analisis completo del codigo fuente de FinanzasPro Dashboard.*
