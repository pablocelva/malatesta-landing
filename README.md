# Malatesta Pedales

Inventario y catálogo online de pedales de guitarra para [Malatesta](https://malatesta-pedales.netlify.app/).

## Resumen

Plataforma full-stack que permite gestionar un catálogo público de pedales de guitarra, con un panel administrativo completo para CRUD, importación/exportación CSV y autenticación segura. Diseñada con un enfoque mobile-first y un diseño dark mode inspirado en la estética de Claude Code.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | [Astro 7](https://astro.build/) (output híbrido: estático + SSR) |
| Backend/BaaS | [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS) |
| Deploy | [Netlify](https://www.netlify.com/) (Edge Functions vía `@astrojs/netlify`) |
| Testing | [Vitest](https://vitest.dev/) |
| Lenguaje | TypeScript |

## Arquitectura

```
src/
  components/       Componentes reutilizables (Hero, PedalCard, RarityBadge, PriceDisplay)
  layouts/          Layouts base (pública) y admin (sidebar responsive)
  lib/
    supabase.ts     Cliente Supabase + helpers de consulta
    types.ts        Tipos TypeScript, metadata de categorías, rareza
    utils.ts        Utilidades (formatPrice, generateSlug, etc.)
  pages/
    index.astro     Landing principal (estático)
    catalogo.astro  Catálogo público (fetch client-side)
    catalogo/[slug].astro   Detalle de pedal (SSR, revalidación ISR)
    categoria/[slug].astro  Filtrado por categoría (SSR, revalidación ISR)
    admin/
      login.astro       Login con Supabase Auth
      index.astro       Dashboard (tabla sortable, paginación, CSV export)
      import.astro      Importación CSV con drag & drop
      pedales/
        nuevo.astro     Formulario de creación
        [slug].astro    Formulario de edición + eliminación
supabase/
  schema.sql        Schema de la tabla `pedales` con RLS
```

## Features

### Catálogo público
- Listado de 50+ pedales con búsqueda y filtrado por categoría
- 10 categorías: Booster, Compresor, Overdrive, Preamp, Distorsión, Fuzz, Modulación, Delay/Reverb, Pitch/Wah, Multi-FX
- Detalle individual con imagen, precios (venta/piso/optimista), rareza, estado, tags
- JSON-LD (Schema.org) para SEO
- Sitemap automático (`@astrojs/sitemap`)

### Panel administrativo
- Autenticación con Supabase Auth (email/password)
- Dashboard con estadísticas rápidas (total, disponibles, en uso)
- Tabla con sorting por columna y paginación (15 por página)
- CRUD completo: crear, editar, eliminar pedals
- Importación masiva desde CSV con drag & drop y preview antes de subir
- Exportación CSV de todos los registros
- Confirmación antes de eliminación

### Diseño
- Dark mode completo (`#0a0a0a` background, sistema de tokens CSS)
- Responsive: mobile-first, sidebar con hamburger en ≤768px
- Cards de pedal en mobile, tabla completa en desktop
- Emojis de rareza: 💎 (ultra rara), 🔷 (rara), 🔹 (poco común)
- Categorías con emojis propios

### Datos
- 50 pedales de guitarra pre-cargados en CSV
- 10 efectos premium (Klon, Klon Clone, Boss HM-2, Strymon, etc.)
- Condiciones: MINT, EXCELENTE, BUENO, REGULAR, REPARACIÓN

## Base de datos

Tabla `pedales` con 20 columnas, RLS habilitado:
- Lectura pública (anonymous)
- Escritura solo para usuarios autenticados
- Índices en `category` y `slug`
- Tags almacenados como pipe-delimited text, parseados en la aplicación

```sql
-- Lectura pública
SELECT * FROM pedales WHERE category = 'overdrive';

-- Escritura autenticada
INSERT INTO pedales (...) VALUES (...);
```

## Desarrollo

```bash
# Instalar dependencias
pnpm install

# Desarrollo local
pnpm dev

# Build
pnpm build

# Preview del build
pnpm preview

# Tests
pnpm test
```

### Variables de entorno

```env
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

Las variables con prefijo `PUBLIC_` son accesibles tanto en el servidor como en el cliente (Astro 7).

## Deploy

El proyecto deploya automáticamente en Netlify al hacer push a `main`.

1. Conectar el repositorio a Netlify
2. Configurar las variables de entorno en el dashboard de Netlify
3. Build: `pnpm build`, Directorio: `dist`, Node: 22

### Producción

```bash
# En Netlify, configurar:
# Build command: pnpm build
# Publish directory: dist
# Node version: 20
```

## Testing

```bash
pnpm test          # Ejecutar tests
pnpm test:watch    # Modo watch
```

Tests unitarios para utilidades (formatPrice, generateSlug, etc.) con Vitest.

## Decisiones técnicas

| Decisión | Razón |
|----------|-------|
| Astro híbrido (static + SSR) | Landing y catálogo son estáticos para SEO; admin y detalle usan SSR para datos dinámicos |
| Supabase en vez de API custom | Auth, database y RLS out-of-the-box, sin backend propio |
| `@astrojs/netlify` adapter | Deploy serverless en Netlify Edge Functions |
| CSS custom (no Tailwind) | Control total del diseño dark mode, sin overhead de framework CSS |
| Tags como pipe-delimited text | Supabase no soporta arrays en texto simple; se parsea en la aplicación |
| Client-side fetch en catálogo | Catálogo es estático pero los datos se cargan desde Supabase en runtime |

## Licencia

Proyecto privado para [Malatesta](https://malatesta.cl).
