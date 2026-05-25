# Diario de Cefaleas

App web minimalista para registrar episodios de cefalea y detectar patrones.
React 18 + TypeScript + Vite + Tailwind. Persistencia en **Supabase** (con
fallback automático a `localStorage` si no hay credenciales configuradas).
Funciona como **PWA instalable y offline-first**.

## Características

- Vista de calendario mensual con navegación entre meses.
- Cada día muestra un punto de color según la intensidad:
  - 🟢 Leve (1-3) · 🟡 Moderado (4-6) · 🔴 Intenso (7-10)
- Modal de entrada con intensidad, tipo de dolor, zona, desencadenantes (chips
  multi-select) y notas libres. Guardar / Eliminar / Cancelar.
- Lista de entradas del mes actual ordenadas por fecha descendente.
- Exportación de todas las entradas a CSV.
- **PWA**: instalable en móvil/escritorio, funciona sin conexión y se
  autoactualiza al detectar una nueva versión.
- **Offline + sync**: las entradas se guardan localmente al instante y, si la
  red falla, se encolan y se envían a Supabase cuando vuelve la conexión.
- Diseño limpio, mobile-first, en español, semana empezando en lunes.

## Estructura

```
src/
  components/  Calendar.tsx, DayCell.tsx, EntryModal.tsx, EntryList.tsx
  hooks/       useEntries.ts          ← CRUD Supabase + fallback localStorage
  lib/         supabase.ts            ← cliente Supabase
  types/       index.ts               ← HeadacheEntry y constantes
  utils/       csv.ts, date.ts
  App.tsx
  main.tsx
supabase/schema.sql                   ← tabla + RLS
vercel.json                           ← rewrite SPA
```

## Desarrollo local

```bash
npm install
npm run dev
```

La app abrirá en `http://localhost:5173`. Sin variables de entorno funciona con
`localStorage` (los datos quedan en tu navegador).

## Configurar Supabase (recomendado para producción)

1. Crea un proyecto gratis en <https://supabase.com>.
2. En **SQL Editor**, ejecuta el contenido de [`supabase/schema.sql`](supabase/schema.sql).
3. En **Project Settings → API**, copia:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
4. Copia `.env.example` a `.env.local` y pega los valores:

   ```bash
   cp .env.example .env.local
   ```

5. Reinicia `npm run dev`. En el pie de página verás `Almacenamiento: Supabase`.

> ⚠️ El esquema por defecto permite lectura/escritura con la clave anónima
> (un único diario compartido). Si quieres separar por usuario, añade
> autenticación de Supabase y una columna `user_id` con políticas RLS basadas en
> `auth.uid()`.

## Build de producción

```bash
npm run build
npm run preview
```

## Desplegar en Vercel

1. Sube el repo a GitHub.
2. En Vercel, **Import Project** → selecciona el repo.
   - Framework preset: **Vite** (se detecta solo).
   - Build command: `npm run build` · Output: `dist`.
3. En **Settings → Environment Variables** añade:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy.

O desde la línea de comandos:

```bash
npm i -g vercel
vercel        # primer deploy / link
vercel --prod
```

El archivo [`vercel.json`](vercel.json) incluye la regla de rewrite SPA para que
todas las rutas se sirvan desde `index.html`.
