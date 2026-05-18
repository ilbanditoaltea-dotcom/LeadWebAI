# LeadWeb AI

LeadWeb AI es una plataforma SaaS (Next.js App Router + TypeScript + Tailwind + Supabase + OpenAI) para:

- detectar leads de negocio local
- analizar su presencia digital
- generar demos web personalizadas
- preparar mensajes comerciales asistidos por IA

## Requisitos

- Node.js 18.17+ (recomendado 20+)
- npm 9+

## Configuración local

1. Instala dependencias:

```bash
npm install
```

2. Copia variables de entorno:

```bash
cp .env.example .env.local
```

3. Completa `.env.local` con tus claves:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
SERPER_API_KEY=your_serper_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
SCRAPINGBEE_API_KEY=your_scrapingbee_api_key
BROWSERLESS_WS=ws://your-browserless-endpoint
REDIS_URL=redis://your-redis-endpoint
CRON_SECRET=your_random_cron_secret
```

## Scripts

- Desarrollo: `npm run dev`
- Build producción: `npm run build`
- Servir build: `npm run start`
- Lint: `npm run lint`

## Supabase

El esquema SQL está en `supabase/schema.sql`.

Clientes incluidos:
- Browser client: `src/lib/supabase/client.ts`
- Server client: `src/lib/supabase/server.ts`
- Proxy/session refresh: `src/lib/supabase/proxy.ts`

Si faltan variables válidas de Supabase, la app usa fallback de datos demo.

## Producción (Vercel CLI)

### 1) Verifica build local

```bash
npm run build
```

### 2) Instala Vercel CLI

```bash
npm i -g vercel
```

### 3) Deploy a producción

```bash
vercel --prod
```

> Nota: `vercel --prod` requiere autenticación interactiva la primera vez.

## Seguridad

- No se incluyen claves reales en código fuente.
- Las claves deben ir únicamente en variables de entorno (`.env.local` en local y variables de proyecto en Vercel).

## Autopilot MVP

Se añadió un flujo automático para campañas:

- Endpoint: `POST /api/agent/run-campaign`
- Input:

```json
{
  "city": "Alicante",
  "category": "restaurant",
  "limit": 8,
  "channel": "email"
}
```

Flujo que ejecuta:

1. Descubre negocios (`SERPER_API_KEY`) o usa fallback.
2. Crea leads en Supabase.
3. Escanea web (`FIRECRAWL_API_KEY` o `SCRAPINGBEE_API_KEY`, con fallback fetch).
4. Analiza negocio con IA (si `OPENAI_API_KEY` válida; si no, fallback heurístico).
5. Genera demo web y mensaje comercial.
6. Mueve lead a `pending_approval` y registra actividades.

Panel de disparo manual:
- `/campaigns` -> sección **Autopilot Campaign Runner**.
