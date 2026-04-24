# Finanzas Pro - Dashboard Financiero

Finanzas Pro es una aplicación moderna de gestión financiera diseñada para el seguimiento de proyectos, abonos y cumplimiento de metas. Construida con **Next.js 15**, **Supabase** y **Tailwind CSS**.

## 🚀 Características Principales

- **Dashboard General**: Visualización de métricas clave (Recaudado, Proyectado, Pendiente).
- **Gestión de Proyectos**: CRUD completo de proyectos con estados dinámicos.
- **Seguimiento de Abonos**: Registro y control de pagos parciales por proyecto.
- **Cartera de Clientes**: Vista especializada en facturas pendientes y cobros.
- **Metas Financieras**: Control de metas mensuales y anuales por área.
- **Seguridad RLS**: Protección de datos a nivel de fila mediante Supabase.
- **Modo Oscuro**: Interfaz adaptable para reducir la fatiga visual.

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos & Auth**: Supabase
- **Estilos**: Tailwind CSS
- **Iconos**: Material Icons Round

## 📦 Instalación y Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/finanzas_pro.git
    cd finanzas_pro
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    # o si usas bun
    bun install
    ```

3.  **Variables de entorno:**
    Crea un archivo `.env.local` en la raíz con las siguientes variables:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
    ```

4.  **Configuración de la Base de Datos:**
    Asegúrate de ejecutar los scripts de migración y habilitar las políticas **RLS** necesarias para las tablas `proyectos`, `abonos`, `usuarios`, `areas` y `metas`.

5.  **Ejecutar en desarrollo:**
    ```bash
    npm run dev
    ```

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.
