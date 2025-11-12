# 📁 SQL Migrations - Índice General

## 🎯 Propósito

Esta carpeta contiene todos los scripts SQL necesarios para:
- ✅ Crear tablas en Supabase
- ✅ Configurar Row Level Security (RLS)
- ✅ Crear índices para performance
- ✅ Documentar cambios de base de datos

## 📚 Archivos

### 1. **001-create-period-history-table.sql** (23 líneas)
   - **Propósito:** Crear tabla `period_history` para historial de ciclo
   - **Tablas afectadas:** `period_history` (nueva)
   - **Cuándo usar:** Cuando necesites tracking de periodo
   - **Estado:** ✅ Aplicado

### 2. **002-enable-rls-period-history.sql** (35 líneas)
   - **Propósito:** Activar RLS en `period_history`
   - **Tablas afectadas:** `period_history`
   - **Cuándo usar:** Después de crear la tabla
   - **Estado:** ✅ Aplicado

### 3. **003-enable-rls-all-tables.sql** (167 líneas)
   - **Propósito:** Configurar RLS en TODAS las tablas de usuario
   - **Tablas afectadas:** 
     - `activities`
     - `cycle_data`
     - `habits`
     - `habit_completions`
     - `reflections`
     - `user_settings`
   - **Cuándo usar:** Protección de datos (CRÍTICO)
   - **Estado:** ✅ Aplicado

### 4. **README.md**
   - **Propósito:** Guía completa de uso y troubleshooting
   - **Contiene:** Instrucciones, ejemplos, solución de problemas

## 🚀 Orden de Aplicación

Las migraciones deben aplicarse en **orden secuencial**:

```
001 → 002 → 003
```

## ✅ Verificación Rápida

Después de aplicar todas las migraciones:

1. **Supabase Dashboard** → **Authentication** → **Policies**
2. Selecciona cada tabla en el dropdown
3. Verifica que aparezca **"RLS is ON"** en verde

Tablas que deberían tener RLS:
- ✅ `activities`
- ✅ `cycle_data`
- ✅ `habits`
- ✅ `habit_completions`
- ✅ `period_history`
- ✅ `reflections`
- ✅ `user_settings`

## 📝 Cómo Agregar Nuevas Migraciones

1. Crea archivo: `00X-descripcion.sql`
2. Incrementa el número (001, 002, 003, etc.)
3. Sigue la plantilla en README.md
4. Documenta en este archivo

Ejemplo:
```
004-add-notifications-table.sql
005-enable-rls-notifications.sql
```

## 🔐 Importancia de RLS

**Row Level Security es CRÍTICO para seguridad:**

- 🔒 Previene que Usuario A vea datos de Usuario B
- 🔒 Previene acceso no autorizado a bases de datos
- 🔒 Base de seguridad del sistema
- 🔒 Requerido para producción

Sin RLS: ⚠️ **Brechas de seguridad graves**

## 🎯 Próximas Migraciones Posibles

Para futuras funcionalidades:

```
004-create-notifications-table.sql
005-create-goals-table.sql
006-create-achievements-table.sql
```

## 📞 Soporte

Si encuentras errores:

1. Verifica el orden de aplicación (001 → 002 → 003)
2. Revisa README.md section "Troubleshooting"
3. Comprueba que RLS esté ON en Dashboard
4. Si persiste: Revisa logs en Supabase Dashboard

---

**Última actualización:** 2024-11-12  
**Total migraciones:** 3  
**Estado:** ✅ Completadas  
**Seguridad:** ✅ RLS habilitado
