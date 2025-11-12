# SQL Migrations - Rocket App

Esta carpeta contiene todos los scripts SQL necesarios para configurar la base de datos Supabase.

## 📋 Estructura de Migrations

Las migraciones siguen un patrón de numeración secuencial para facilitar el control de versiones:

```
001-create-period-history-table.sql
002-enable-rls-period-history.sql
003-enable-rls-all-tables.sql
```

## ✅ Estado de Migraciones

| # | Nombre | Descripción | Estado |
|---|--------|-------------|--------|
| 001 | create-period-history-table | Crea tabla period_history | ✅ Aplicada |
| 002 | enable-rls-period-history | RLS para period_history | ✅ Aplicada |
| 003 | enable-rls-all-tables | RLS para todas las tablas | ✅ Aplicada |

## 🚀 Cómo aplicar migraciones

### Método 1: Supabase Dashboard (Recomendado)

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Click en el botón **+ (New Query)**
4. Copia el contenido del archivo SQL
5. Pega en el editor
6. Presiona **Run**
7. Verifica que no haya errores

### Método 2: Supabase CLI (Avanzado)

```bash
# Si tienes Supabase CLI instalado
supabase db push sql-migrations/001-create-period-history-table.sql
supabase db push sql-migrations/002-enable-rls-period-history.sql
supabase db push sql-migrations/003-enable-rls-all-tables.sql
```

## 🔍 Verificación Post-Aplicación

Después de aplicar las migraciones, verifica que todo está correcto:

```sql
-- Verificar que RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
ORDER BY tablename;

-- Debería mostrar:
-- activities, cycle_data, habits, habit_completions, 
-- reflections, user_settings, period_history
```

O en el Dashboard:
1. Ve a **Authentication → Policies**
2. Para cada tabla, verifica que dice **"RLS is ON"** (en verde)

## 📝 Agregar nuevas migraciones

Cuando necesites agregar nuevas migraciones:

1. Crea un nuevo archivo: `00X-descripcion.sql`
2. Incrementa el número secuencial
3. Documenta el propósito en el encabezado
4. Aplica siguiendo los pasos de "Cómo aplicar migraciones"
5. Actualiza este README con el estado

### Plantilla para nuevas migraciones:

```sql
/**
 * SQL Migration 00X: [Descripción breve]
 * 
 * Description: [Descripción detallada de qué hace esta migración]
 * 
 * Status: ⏳ Pendiente / ✅ Aplicada
 * Date: YYYY-MM-DD
 */

-- Tu SQL aquí

-- Ejemplo de verificación:
-- SELECT * FROM [tabla] WHERE ... LIMIT 5;
```

## ⚠️ Importante

- **NO modifiques** migraciones ya aplicadas
- Crea **nuevas** migraciones para cambios posteriores
- Siempre **verifica** en el dashboard que RLS esté ON
- Si algo falla, revisa los **logs** en Supabase Dashboard

## 🔐 Row Level Security (RLS)

Todas nuestras migraciones implementan RLS para proteger datos:

- ✅ Los usuarios solo pueden leer/escribir sus propios datos
- ✅ Las políticas usan `auth.uid()` para identificación
- ✅ Previene acceso cross-user (seguridad crítica)

### Estructura de cada política RLS:

```sql
-- SELECT: Usuarios ven solo sus datos
CREATE POLICY "users_select_[table]"
ON [table]
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Solo pueden crear con su user_id
CREATE POLICY "users_insert_[table]"
ON [table]
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Solo pueden editar sus datos
CREATE POLICY "users_update_[table]"
ON [table]
FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE: Solo pueden borrar sus datos
CREATE POLICY "users_delete_[table]"
ON [table]
FOR DELETE
USING (auth.uid() = user_id);
```

## 📞 Troubleshooting

### Error: "relation does not exist"
- Verifica que la tabla existe antes de aplicar políticas
- Crea las tablas antes de las políticas RLS

### Error: "Policy with that name already exists"
- No es un error crítico
- Significa que la política ya existe
- Puedes ignorarlo o eliminar la vieja: `DROP POLICY [nombre] ON [tabla]`

### RLS no funciona
- Verifica en Dashboard: Authentication → Policies → "RLS is ON"
- Verifica que las políticas están creadas correctamente
- Revisa los logs de Supabase

## 📚 Referencias

- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [Auth in Supabase](https://supabase.com/docs/guides/auth)

---

**Última actualización:** 2024-11-12  
**Versión:** 1.0  
**Estado:** ✅ Migraciones base completadas
