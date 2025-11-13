# 🎯 HABIKA PROJECT CONTEXT - Registro Único Central

**Fecha de creación:** 2025-11-12
**Última actualización:** 2025-11-12
**Estado del proyecto:** En desarrollo - Fixes en progreso

---

## 📌 INFORMACIÓN DEL USUARIO

- **User ID:** `d8dec836-4928-4dac-92ca-342fee1a5647`
- **Proyecto Supabase:** Habika (habit tracking app)
- **Tech Stack:** Next.js, React, TypeScript, Supabase, localStorage, TailwindCSS
- **Arquitectura:** Offline-first (localStorage primary, Supabase sync secondary)

---

## 🏗️ ESTRUCTURA DE FORMULARIOS & ENTRADA DE DATOS

### Crear Hábito - `/app/habitos/page.tsx`
**Componente modal:** `CreateHabitModal` (líneas ~200-800)
**Campos del formulario:**
- `name` (text) - Nombre del hábito
- `type` (select) - "formar" o "dejar"
- `frequency` (select) - "diario", "semanal", etc
- `startTime` (input type="time") - **FORMATO: HH:MM (ej: "06:30")**
- `endTime` (input type="time") - **FORMATO: HH:MM (ej: "07:00")**
- `description` (textarea)
- `color` (color picker)
- `icon` (select from LUCIDE_ICONS)
- `status` (default "active")

**Dónde se guarda:**
1. localStorage con clave: `habika_custom_habits`
2. Supabase tabla: `habits` (si usuario autenticado)

---

## 🗄️ ESQUEMA DE BASE DE DATOS

### Tabla: `habits`
```
Columnas existentes:
- id (uuid) - PK
- user_id (uuid) - FK, NOT NULL
- name (text) - NOT NULL
- description (text)
- frequency (text) - NOT NULL
- days_of_week (ARRAY)
- status (text) - default "active"
- color (text)
- icon (text)
- goal (integer)
- unit (text)
- category (text)
- streak (integer)
- created_at (timestamp)
- updated_at (timestamp)

COLUMNAS NUEVAS AGREGADAS (2025-11-12):
- start_time (time) - Hora de inicio del hábito (ej: 06:30)
- end_time (time) - Hora de fin del hábito (ej: 07:00)

CONSTRAINT:
- UNIQUE(user_id, name)
- RLS habilitado con políticas user_id = auth.uid()
```

### Tabla: `user_settings`
```
Columnas:
- id (uuid) - PK
- user_id (uuid) - FK, NOT NULL, UNIQUE
- notifications_enabled (boolean)
- notification_time (time) - Posible uso futuro
- reminder_frequency (text)
- data_synced_at (timestamp)
- last_backup_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

### Tabla: `cycle_data`
```
Columnas:
- id (uuid) - PK
- user_id (uuid) - FK, NOT NULL, UNIQUE
- is_active (boolean)
- last_period_start (date)
- cycle_length_days (integer)
- period_length_days (integer)
- current_phase (text)
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### Tabla: `activities`
```
Columnas clave:
- id (uuid) - PK
- user_id (uuid) - FK, NOT NULL
- name (text)
- duration (integer)
- unit (text) - NOT NULL (ej: "min", "horas")
- category (text) - Mapeado desde "categoria" en JS
- color (text)
- date (text) - Formato YYYY-MM-DD
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)

RLS: auth.uid() = user_id (múltiples políticas duplicadas)
```

---

## 🔄 FLUJO DE PERSISTENCIA ACTUAL

### Crear un Hábito
```
1. Usuario llena formulario en CreateHabitModal (/app/habitos/page.tsx)
2. Al hacer click "Crear":
   - Generar: id = crypto.randomUUID()
   - Generar: createdAt = new Date().toISOString()
   - Generar: startTime, endTime = valores del input

3. Guardar en localStorage:
   - Clave: 'habika_custom_habits'
   - persistData({ table: 'habits', data: habitObject, userId })

4. Si usuario autenticado:
   - persistToSupabase() en persistence-layer.ts
   - UPSERT a Supabase con onConflict: 'user_id,name'
   - Incluir: start_time = habitObject.startTime (mapeo!)
   - Incluir: end_time = habitObject.endTime (mapeo!)
```

### Leer Hábitos en Calendario
```
1. /app/app/calendario/page.tsx mounted
2. Leer: localStorage['habika_custom_habits']
3. Filtrar: status === 'active'
4. Para cada hábito:
   - Leer start_time
   - Calcular hour = parseInt(start_time.split(':')[0])
   - Mostrar en calendario a esa hora
```

---

## ✅ FIXES COMPLETADOS (P0-P4)

### P0: Logout - Limpiar localStorage
- **Archivo:** `app/context/UserContext.tsx`
- **Qué hace:** Al logout, elimina todas las claves `habika_*`
- **Líneas:** ~65-85
- **Status:** ✅ COMPLETADO

### P1.1: Reload Habitos on User Change
- **Archivo:** `app/app/habitos/page.tsx`
- **Qué hace:** useEffect([user?.id]) → loadHabits()
- **Líneas:** 35-39
- **Status:** ✅ COMPLETADO

### P1.2: Reload Actividades on User Change
- **Archivo:** `app/app/actividades/page.tsx`
- **Qué hace:** Similar a P1.1 para actividades
- **Status:** ✅ COMPLETADO

### P1.3: Calendario Load from habika_activities_today
- **Archivo:** `app/lib/initial-sync.ts`
- **Qué hace:** Convierte flat activities a formato by-date
- **Líneas:** 50-62
- **Status:** ✅ COMPLETADO

### P2: Initial Sync Event Emitter
- **Archivo:** `app/hooks/useInitialSync.ts`
- **Qué hace:** Emite 'habika-initial-sync-complete' event tras sync
- **Líneas:** 73-76
- **Status:** ✅ COMPLETADO
- **Listeners:** habitos/page.tsx (línea 65), actividades/page.tsx (línea 140)

### P3: ActivityContext Listener
- **Archivo:** `app/context/ActivityContext.tsx`
- **Qué hace:** Escucha 'habika-initial-sync-complete', recarga actividades
- **Status:** ✅ COMPLETADO

### P4: Actividades Direct Reload
- **Archivo:** `app/app/actividades/page.tsx`
- **Qué hace:** Lee directo de localStorage al sync, evita timing issues
- **Líneas:** ~136-156
- **Status:** ✅ COMPLETADO

---

## ✅ P5 - HABIT TIMES EN CALENDARIO (COMPLETADO 2025-11-12)

### Problema (RESUELTO)
- Calendario mostraba todos los hábitos a 6:00 AM
- Raíz: No existía columna `start_time` en tabla `habits`

### Solución Implementada
**Paso 1: Agregar columnas a DB** ✅ COMPLETADO
```sql
ALTER TABLE habits
ADD COLUMN start_time TIME DEFAULT '06:00:00',
ADD COLUMN end_time TIME DEFAULT '07:00:00';
```
Resultado verificado: Columnas creadas (type="time without time zone")

**Paso 2: Mapeo en Persistence Layer** ✅ COMPLETADO
- Archivo: `app/lib/persistence-layer.ts` (línea 160-161)
- Cambio: Agregados mapeos en sección habits:
  - `start_time: data.startTime || null`
  - `end_time: data.endTime || null`

**Paso 3: Mapeo en Sync** ✅ COMPLETADO
- Archivo: `app/lib/supabase-sync.ts` (línea 56-57)
- Cambio: Agregados campos al upsert de habits
  - `start_time: habit.startTime || null`
  - `end_time: habit.endTime || null`

**Paso 4: Mapeo en Migration** ✅ COMPLETADO
- Archivo: `app/lib/supabase-migrate.ts` (línea 173-174)
- Cambio: Agregados campos al migration de habits para usuarios existentes

**Paso 5: Lectura en Calendario** ✅ VERIFICADO
- Archivo: `app/app/calendario/page.tsx` (línea 152-154)
- Status: Ya lee correctamente `hab.startTime` de localStorage e interpreta la hora

### Commits Asociados
- `dd93aea` (2025-11-12): "feat: P5 - Map habit times to Supabase columns"

---

## 📊 CAMBIOS EN PERSISTENCIA (Antes vs Después)

### ANTES - Hábito en localStorage
```javascript
{
  "id": "uuid",
  "name": "Correr",
  "type": "formar",
  "startTime": "06:30",  // ← De input type="time"
  "endTime": "07:00",    // ← De input type="time"
  "status": "active",
  // ... otros campos
}
```

### DESPUÉS - Hábito en Supabase
```javascript
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Correr",
  "start_time": "06:30",  // ← MAPEO: startTime → start_time
  "end_time": "07:00",    // ← MAPEO: endTime → end_time
  "status": "active",
  // ... otros campos
  "updated_at": "2025-11-12T..."
}
```

**Mapeo necesario:**
- `startTime` (camelCase JS) → `start_time` (snake_case SQL)
- `endTime` (camelCase JS) → `end_time` (snake_case SQL)

---

## 🔗 ARCHIVOS CLAVE A MODIFICAR

| Archivo | Líneas | Qué hacer |
|---------|--------|-----------|
| [app/lib/persistence-layer.ts](app/lib/persistence-layer.ts) | 160-161 | ✅ Mapeo start_time/end_time en sección habits |
| [app/lib/supabase-sync.ts](app/lib/supabase-sync.ts) | 56-57 | ✅ Agregados start_time, end_time a upsert |
| [app/lib/supabase-migrate.ts](app/lib/supabase-migrate.ts) | 173-174 | ✅ Agregados start_time, end_time a migration |
| [app/app/calendario/page.tsx](app/app/calendario/page.tsx) | 152-154 | ✅ Lee startTime correctamente, interpreta hora |

---

## 📋 COMMITS REALIZADOS

| Commit | Fecha | Descripción |
|--------|-------|-------------|
| 1162080 | - | fix: use proper UUID generation for cycle data and period history |
| 3eeeaad | - | fix: use UserContext for real user ID in ActivityContext and CycleContext |
| 9657f6b | - | fix: expose supabase.channel() method for realtime subscriptions |
| 97d59f1 | - | chore: add detailed logging to ActivityContext for debugging sync |
| a94d1ed | - | feat: implement ActivityContext with dual-layer persistence for activities |
| (P0) | 2025-11-12 | Logout handler: clear localStorage on logout |
| (P1-P4) | 2025-11-12 | Race condition fixes: initial sync event system |
| dd93aea | 2025-11-12 | ✅ feat: P5 - Map habit times to Supabase columns + PROJECT_CONTEXT.md |

---

## 🧪 TESTING CHECKLIST - P5 FIX VALIDATION (2025-11-12 - COMPLETADO)

### Test Case: Create habit with startTime = "22:15", endTime = "22:25"

- [x] **Crear hábito:** "test" con startTime = "22:15", endTime = "22:25"
  - Status: ✅ COMPLETADO
  - Habit ID: `3c5ddd71-f5ca-476f-935e-bc35f5488519`
  - Console log: `✅ Habit created: {id: '3c5ddd71-f5ca-476f-935e-bc35f5488519', name: 'test', startTime: '22:15'}`

- [x] **Verificar localStorage:** startTime y endTime guardados correctamente
  - Status: ✅ COMPLETADO
  - Console log: `✅ Persisted to localStorage: habits/3c5ddd71-f5ca-476f-935e-bc35f5488519`
  - Data verified: `"startTime": "22:15"`, `"endTime": "22:25"`

- [x] **Verificar Supabase sync:** start_time y end_time sincronizados correctamente
  - Status: ✅ COMPLETADO
  - Console log: `📝 Preparing habit record for Supabase: {id: '3c5ddd71-f5ca-476f-935e-bc35f5488519', name: 'test', start_time: '22:15'}`
  - Supabase confirmation: `✅ Persisted to Supabase: habits/3c5ddd71-f5ca-476f-935e-bc35f5488519`
  - Mapping verified: `startTime → start_time` working correctly

- [x] **Verificar calendario:** Hábito aparece a las 22:15 (NO a las 06:00)
  - Status: ✅ VERIFICADO EN UI
  - Expected: Hábito "test" en slot de 22:15
  - Result: ✅ Aparece correctamente a las 22:15 (NO más a las 6:00 AM como antes)

- [x] **Verificar sin errores en consola**
  - Status: ✅ COMPLETADO - NO ERRORS ENCONTRADOS
  - RLS errors: ✅ None (42501 errors not present)
  - 406 errors: ✅ None (user_settings, cycle_data acceso OK)
  - Sync messages: ✅ All successful
  - Sample logs:
    - `✅ Data synced to Supabase successfully`
    - `✅ Initial sync completed successfully`
    - `✅ Realtime sync activated`

### Validación Completa P5:

**Problema original:** Calendario mostraba todos los hábitos a 6:00 AM
**Raíz:** Columna `start_time` no existía en tabla `habits` de Supabase

**Estado actual (POST-FIX):** ✅ RESUELTO COMPLETAMENTE
- ✅ Columnas `start_time` y `end_time` existen en DB
- ✅ Mapping camelCase → snake_case implementado en 3 archivos
- ✅ Data persiste correctamente en localStorage con `startTime`
- ✅ Data sincroniza a Supabase con `start_time`
- ✅ Calendario lee `startTime` de localStorage e interpreta hora correctamente
- ✅ Realtime subscriptions activas y recibiendo cambios
- ✅ No hay errores RLS, 406, o duplicados en logs

---

## 🚨 ERRORES CONOCIDOS (RESUELTOS)

### Error: 42501 RLS violation on activities
**Causa:** RLS policies bien configuradas, error por otra razón
**Status:** ✅ RLS OK en DB (verificado con Query 2)

### Error: 406 Not Acceptable on user_settings, cycle_data
**Causa:** Tablas existían, posible API header issue
**Status:** ✅ Tablas existen (Query 3 y 4 confirmó)

### Problema: startTime no persistía
**Causa:** Columna no existía en tabla habits
**Status:** ✅ RESUELTO - Columnas agregadas

---

## 📝 NOTAS FUTURAS

- Si hay nuevos campos a agregar a habits, seguir patrón de mapeo (camelCase JS → snake_case SQL)
- Mantener este archivo actualizado con cada cambio significativo
- Los fixes P0-P4 son reutilizables en otros futuros problemas de persistencia
- Considerar automatizar el mapeo camelCase→snake_case en una función helper

