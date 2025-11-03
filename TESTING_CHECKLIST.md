# 🧪 Testing Checklist - HABIKA PWA

## ✅ PWA Testing (Mobile/Tablet)

### 1. Hábitos - Create, Read, Update, Delete
- [ ] Ir a Biblioteca → Crear hábito desde plantilla
  - [ ] Verificar que abre modal sin flicker
  - [ ] Completar formulario (nombre, tipo, color, icono)
  - [ ] Guardar - debe redirigir a Hábitos sin pantalla blanca
  - [ ] El nuevo hábito aparece en la lista

- [ ] Editar hábito desde lista de Hábitos
  - [ ] Click en hábito abre modal de edición
  - [ ] Cambiar nombre, color, icono
  - [ ] Guardar - actualización instantánea
  - [ ] Verificar cambios reflejados en lista

- [ ] Crear hábito personalizado (sin plantilla)
  - [ ] Click en "Crear hábito personalizado"
  - [ ] Completar todos los campos
  - [ ] Seleccionar días, frecuencia, horario
  - [ ] Guardar exitoso

- [ ] Eliminar hábito
  - [ ] Long press o botón de opciones
  - [ ] Confirmar eliminación
  - [ ] Hábito desaparece de lista

### 2. Actividades - CRUD
- [ ] Registrar nueva actividad
  - [ ] Click en "+" en BottomNav
  - [ ] Modal abre sin flicker
  - [ ] Completar: nombre, categoría, duración
  - [ ] Guardar - debe actualizar list sin pantalla blanca
  - [ ] Actividad aparece en "Mi Día"

- [ ] Editar actividad
  - [ ] Click en actividad para editar
  - [ ] Modal abre correctamente
  - [ ] Cambiar datos
  - [ ] Guardar - actualización inmediata

- [ ] Eliminar actividad
  - [ ] Swipe o botón de eliminar
  - [ ] Actividad desaparece

### 3. Navegación y Transiciones
- [ ] Navegar entre todas las páginas
  - [ ] Home → Actividades → Hábitos → Perfil → Estadísticas
  - [ ] Verificar **CERO flicker** en transiciones
  - [ ] Verificar **CERO layout shifts** en scroll
  - [ ] Botón atrás funciona fluidamente

- [ ] BottomNav
  - [ ] Todos los botones responden
  - [ ] FAB (botón flotante) abre menú correctamente
  - [ ] Menú cierra sin problemas

- [ ] Scroll behavior
  - [ ] Scroll normal funciona
  - [ ] Over-scroll arriba no mueve layout
  - [ ] Over-scroll abajo no mueve layout
  - [ ] Momentum scrolling funciona (iOS)

### 4. Zoom y Comportamiento Nativo
- [ ] Verificar **IMPOSIBLE hacer zoom**
  - [ ] Double-tap no hace zoom
  - [ ] Pinch no hace zoom
  - [ ] App se mantiene en escala 1:1

- [ ] Verificar **SIN scroll horizontal**
  - [ ] No hay barra de scroll horizontal
  - [ ] No hay contenido fuera de pantalla

- [ ] Verificar **Tap feedback nativo**
  - [ ] Botones responden instantáneamente
  - [ ] Sin delay de 300ms en taps
  - [ ] Sin highlight visible en botones

- [ ] Verificar **Viewport inmersivo**
  - [ ] Status bar integrado (iOS)
  - [ ] Notches soportados
  - [ ] Safe areas respetadas

### 5. Estadísticas
- [ ] Datos reales mostrados
  - [ ] Hábitos completados: números correctos
  - [ ] Tiempo activo: suma correcta de actividades
  - [ ] Consistencia: porcentaje correcto
  - [ ] **No hay datos ficticios**

- [ ] Gráficos y visualización
  - [ ] Barras de progreso visibles
  - [ ] Colores correctos
  - [ ] Animaciones suaves

### 6. Cache y Updates
- [ ] "Buscar actualizaciones" funciona
  - [ ] Click en botón
  - [ ] Cache se limpia
  - [ ] App recarga con datos nuevos
  - [ ] No hay datos viejos cacheados

- [ ] Offline mode
  - [ ] Desactivar red
  - [ ] App muestra página offline
  - [ ] Datos previamente cargados accesibles

### 7. Errores y Edge Cases
- [ ] Crear hábito sin nombre - muestra error
- [ ] Registrar actividad sin duración - muestra error
- [ ] Eliminar hábito con confirmación
- [ ] Sin datos iniciales - muestra mensaje vacío
- [ ] Permisos de notificación - manejo graceful

---

## ✅ Desktop Testing (Browser)

### 1. Responsive Layout
- [ ] En pantalla completa (lg breakpoint)
  - [ ] Sidebar visible a la izquierda
  - [ ] Contenido ocupa espacio correcto
  - [ ] BottomNav **oculto** (lg:hidden)
  - [ ] TopBar visible

- [ ] Layout fluido
  - [ ] Resize browser funciona
  - [ ] Transición lg/sm smooth
  - [ ] Sin layout shifts

### 2. Hábitos Desktop
- [ ] Crear hábito
  - [ ] Modal abre correctamente
  - [ ] Todos los campos accesibles
  - [ ] Guardado exitoso

- [ ] Lista de hábitos con sidebar
  - [ ] Filtros por tipo funcionan
  - [ ] Scroll smooth
  - [ ] Edición inline si aplica

### 3. Actividades Desktop
- [ ] Crear actividad
  - [ ] Modal responsive
  - [ ] Inputs grandes y accesibles
  - [ ] Guardado exitoso

- [ ] Tabla/Lista de actividades
  - [ ] Datos mostrados correctamente
  - [ ] Edición y eliminación funciona
  - [ ] Scroll sin problemas

### 4. Navegación Desktop
- [ ] Sidebar funciona
  - [ ] Links a todas las secciones
  - [ ] Active state visible
  - [ ] Responsivo

- [ ] TopBar
  - [ ] Logo y título visibles
  - [ ] Botón de configuración funciona
  - [ ] Indicador de ciclo si aplica

### 5. Performance Desktop
- [ ] No hay console errors
- [ ] Transitions suaves (0.05s)
- [ ] Sin reflows visibles
- [ ] Responsive a 1920x1080

---

## 🎯 Performance Checks (Both Platforms)

### Lighthouse Metrics
- [ ] Performance > 90
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] PWA completeness

### Network
- [ ] No requests bloqueados
- [ ] Cache headers correctos
- [ ] Service Worker activo
- [ ] Offline funciona

### Memory
- [ ] Sin memory leaks
- [ ] Smooth garbage collection
- [ ] Animaciones no lag

---

## 📋 Final Verification

- [ ] Build sin errores: `npm run build`
- [ ] Dev server sin warnings críticos
- [ ] Git status clean
- [ ] Todos los commits pusheados
- [ ] No hay console.logs de debug
- [ ] Producción lista

---

## 🚀 Conclusión

- [ ] PWA: 100% funcional
- [ ] Desktop: 100% funcional
- [ ] Performance: Optimizado
- [ ] UX: Nativo y fluido
- [ ] **LISTO PARA PRODUCCIÓN**
