# Malatesta

Plataforma full-stack de inventario y catálogo online de pedales de guitarra para [Malatesta](https://malatesta-pedales.netlify.app/).

## Resumen

Sistema completo de gestión de inventario de pedales de guitarra con catálogo público, panel administrativo seguro, subida de imágenes a Cloudinary con uploads firmados, importación/exportación CSV, búsqueda en tiempo real, y diseño responsive dark mode. Deploy automatico en Netlify.

## Stack

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| Framework | [Astro 7](https://astro.build/) | Output híbrido: estático + SSR |
| Backend/BaaS | [Supabase](https://supabase.com/) | PostgreSQL, Auth, Row Level Security |
| Almacenamiento de imágenes | [Cloudinary](https://cloudinary.com/) | Uploads firmados, CDN, optimización automática |
| Deploy | [Netlify](https://www.netlify.com/) | Edge Functions, deploy automático |
| Functions | [Netlify Functions](https://docs.netlify.com/functions/) | Serverless functions (Cloudinary signing) |
| Testing | [Vitest](https://vitest.dev/) | Tests unitarios |
| Lenguaje | TypeScript | Tipado estático en todo el proyecto |

## Arquitectura

```
malatesta-landing/
├── netlify/
│   └── functions/
│       └── cloudinary-sign.ts    # Netlify Function: verifica auth + genera firma Cloudinary
├── src/
│   ├── components/
│   │   ├── CatalogSearch.astro   # Componente de búsqueda reutilizable
│   │   ├── Hero.astro            # Hero section de la landing
│   │   ├── PedalCard.astro       # Card de pedal para el catálogo
│   │   ├── PriceDisplay.astro    # Display de precios con formato CLP
│   │   └── RarityBadge.astro     # Badge de rareza (💎🔷🔹)
│   ├── layouts/
│   │   ├── Layout.astro          # Layout público (SEO, Open Graph, favicon)
│   │   └── AdminLayout.astro     # Layout admin (sidebar responsive, auth check)
│   ├── lib/
│   │   ├── cloudinary.ts         # Uploads firmados a Cloudinary vía Netlify Function
│   │   ├── supabase.ts           # Cliente Supabase + helpers de consulta
│   │   ├── types.ts              # Tipos TypeScript, metadata de categorías, rareza
│   │   └── utils.ts              # Utilidades (formatPrice, generateSlug, etc.)
│   ├── pages/
│   │   ├── index.astro           # Landing principal (estático)
│   │   ├── catalogo.astro        # Catálogo público con búsqueda y paginación
│   │   ├── catalogo/
│   │   │   └── [slug].astro      # Detalle de pedal (SSR, revalidación ISR)
│   │   ├── categoria/
│   │   │   └── [slug].astro      # Filtrado por categoría (SSR, revalidación ISR)
│   │   └── admin/
│   │       ├── login.astro       # Login con Supabase Auth
│   │       ├── index.astro       # Dashboard (tabla sortable, búsqueda, paginación, CSV)
│   │       ├── import.astro      # Importación CSV con drag & drop
│   │       └── pedales/
│   │           ├── nuevo.astro   # Formulario de creación con upload de imágenes
│   │           └── [slug].astro  # Formulario de edición + eliminación
│   ├── styles/
│   │   └── tokens.css            # Design system: variables CSS, dark mode, colores
│   └── env.d.ts                  # Tipos de variables de entorno
├── supabase/
│   └── schema.sql                # Schema de la tabla `pedales` con RLS
├── tests/
│   └── utils.test.ts             # Tests unitarios (12 tests)
├── netlify.toml                  # Configuración de build y functions
├── astro.config.mjs              # Configuración de Astro + Netlify adapter
├── vitest.config.ts              # Configuración de Vitest
└── .env.example                  # Variables de entorno requeridas
```

## Features

### Catálogo público

- Listado de 50+ pedales con búsqueda en tiempo real (nombre, tipología, tipo, tags)
- 10 categorías: Booster, Compresor, Overdrive, Preamp, Distorsión, Fuzz, Modulación, Delay/Reverb, Pitch/Wah, Multi-FX
- Página de categoría con revalidación ISR (`revalidate = 60`)
- Detalle individual con imagen, precios (venta/piso/optimista), rareza, estado, tags
- JSON-LD (Schema.org) para SEO
- Sitemap automático (`@astrojs/sitemap`)
- Favicon SVG personalizado (🎸)

### Panel administrativo

- Autenticación con Supabase Auth (email/password)
- Check de sesión en cada carga de página y antes de operaciones destructivas
- Dashboard con estadísticas rápidas (total, valor catálogo, en uso, raros)
- Tabla con sorting por columna y paginación (15 por página)
- Búsqueda en tiempo real sobre nombre, tipología, tipo y tags
- CRUD completo: crear, editar, eliminar pedals
- Importación masiva desde CSV con drag & drop y preview antes de subir
- Exportación CSV de todos los registros
- Confirmación antes de eliminación (`confirm()` dialog)
- Sidebar responsive: hamburger menu en ≤768px con drawer slide-in

### Upload de imágenes (Cloudinary signed uploads)

- Toggle dual: URL directa o subida de archivo
- Drag & drop con zona de drop visual
- Upload automático a Cloudinary al seleccionar archivo
- Preview de imagen en tiempo real
- Botón de eliminación de imagen
- **Seguridad**: uploads firmados vía Netlify Function
  - La función verifica la sesión de Supabase antes de generar la firma
  - El API secret nunca se expone al cliente
  - Solo usuarios autenticados pueden subir imágenes
- Validaciones server-side en Cloudinary: formatos permitidos (JPG, PNG, WEBP, GIF), tamaño máximo

### Diseño

- Dark mode completo (`#0a0a0a` background, sistema de tokens CSS)
- Responsive: mobile-first, sidebar con hamburger en ≤768px
- Cards de pedal en mobile, tabla completa en desktop
- Emojis de rareza: 💎 (ultra rara), 🔷 (rara), 🔹 (poco común)
- Categorías con emojis propios

## Seguridad

### Autenticación

Todas las rutas admin verifican la sesión de Supabase en cada carga:

```typescript
const { data: { session } } = await supabase.auth.getSession()
if (!session) {
  window.location.href = '/admin/login'
  return false
}
```

### Row Level Security (RLS)

La tabla `pedales` tiene RLS habilitado con las siguientes políticas:

| Operación | Política |
|-----------|----------|
| `SELECT` | Pública (cualquiera puede leer) |
| `INSERT` | Solo usuarios autenticados |
| `UPDATE` | Solo usuarios autenticados |
| `DELETE` | Solo usuarios autenticados |

### Subida de imágenes

```
Admin (autenticado) → Netlify Function (verifica auth + firma) → Cloudinary
```

1. El cliente envía el access token de Supabase a la Netlify Function
2. La Function verifica el token con la API de Supabase
3. Si es válido, genera un signature con el API secret (nunca expuesto al cliente)
4. El cliente sube a Cloudinary con la firma
5. Cloudinary verifica la firma y acepta o rechaza

### Variables de entorno

| Variable | Tipo | Propósito |
|----------|------|-----------|
| `PUBLIC_SUPABASE_URL` | Pública | URL del proyecto Supabase |
| `PUBLIC_SUPABASE_ANON_KEY` | Pública | Anon key de Supabase (protegida por RLS) |
| `PUBLIC_CLOUDINARY_CLOUD_NAME` | Pública | Cloud name de Cloudinary |
| `PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Pública | Upload preset (signed) |
| `CLOUDINARY_API_KEY` | Server-side | API key de Cloudinary |
| `CLOUDINARY_API_SECRET` | Server-side | API secret (nunca se expone al cliente) |

Las variables con prefijo `PUBLIC_` se incluyen en el bundle del cliente. Las sin prefijo solo están disponibles en el servidor (Netlify Functions).

## Base de datos

Tabla `pedales` con 20 columnas:

```sql
CREATE TABLE pedales (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  slug             text NOT NULL UNIQUE,
  category         text NOT NULL,
  type             text NOT NULL DEFAULT '',
  typology         text NOT NULL DEFAULT '',
  tags             text NOT NULL DEFAULT '',        -- pipe-delimited: "tag1|tag2"
  rarity           text NOT NULL DEFAULT '',
  condition        text NOT NULL DEFAULT 'MINT',
  condition_detail text NOT NULL DEFAULT '',
  price            integer NOT NULL DEFAULT 0,
  price_floor      integer NOT NULL DEFAULT 0,
  price_optimistic integer NOT NULL DEFAULT 0,
  in_use           boolean NOT NULL DEFAULT false,
  available        boolean NOT NULL DEFAULT true,
  image_url        text NOT NULL DEFAULT '',
  notes            text NOT NULL DEFAULT '',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_pedales_category ON pedales (category);
CREATE INDEX idx_pedales_slug ON pedales (slug);
```

## Desarrollo

```bash
# Instalar dependencias
pnpm install

# Desarrollo local (Astro dev server)
pnpm dev

# Desarrollo local con Netlify Functions
pnpm dev:netlify

# Build de producción
pnpm build

# Preview del build
pnpm preview

# Tests
pnpm test

# Tests en watch mode
pnpm test:watch
```

## Deploy

El proyecto deploya automáticamente en Netlify al hacer push a `main`.

### Configuración en Netlify

| Setting | Valor |
|---------|-------|
| Build command | `pnpm build` |
| Publish directory | `dist` |
| Node version | 22 |

### Variables de entorno en Netlify

Agregar en **Site settings → Environment variables**:

```
# Públicas (accesibles en el cliente)
PUBLIC_SUPABASE_URL
PUBLIC_SUPABASE_ANON_KEY
PUBLIC_CLOUDINARY_CLOUD_NAME
PUBLIC_CLOUDINARY_UPLOAD_PRESET

# Server-side (solo en Netlify Functions)
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

### Cloudinary

1. Crear cuenta en [cloudinary.com](https://cloudinary.com/)
2. Crear upload preset (`Settings → Upload → Add upload preset`)
3. Configurar signing mode: **Signed**
4. Configurar validaciones: formatos permitidos, tamaño máximo
5. Copiar Cloud Name, API Key y API Secret

## Decisiones técnicas

| Decisión | Razón |
|----------|-------|
| Astro híbrido (static + SSR) | Landing y catálogo index estático para SEO; admin, detalle y categoría usan SSR para datos dinámicos |
| Supabase en vez de API custom | Auth, database y RLS out-of-the-box, sin backend propio |
| `@astrojs/netlify` adapter | Deploy serverless en Netlify Edge Functions |
| CSS custom (no Tailwind) | Control total del diseño dark mode, sistema de tokens, sin overhead de framework CSS |
| Tags como pipe-delimited text | Supabase almacena como texto simple; se parsea a array en la aplicación |
| Cloudinary signed uploads | Seguridad: el API secret nunca se expone al cliente; la Netlify Function verifica auth antes de firmar |
| Netlify Function sin dependencias | Cold starts rápidos; verificación de token vía `fetch` a la API REST de Supabase en vez del SDK |
| Búsqueda client-side | Filtrado instantáneo sin queries adicionales a la base de datos |
| ISR en páginas de categoría | Revalidación cada 60 segundos平衡a freshness y performance |

## Testing

```bash
pnpm test          # Ejecutar todos los tests
pnpm test:watch    # Modo watch para desarrollo
```

Tests unitarios para utilidades (`formatPrice`, `generateSlug`, `getConditionLabel`, `getConditionColor`) con Vitest.

## Licencia

Proyecto privado para [Malatesta](https://malatesta.cl).
