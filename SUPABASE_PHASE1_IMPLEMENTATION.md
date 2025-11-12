# SUPABASE PHASE 1-2 IMPLEMENTATION GUIDE

**Date:** 2025-11-11
**Status:** Ready to implement
**Estimated Time:** Phase 1 (4-5h) + Phase 2 (5-6h) = 9-11 hours

---

## 🔍 ANÁLISIS DE ESTRUCTURA ACTUAL

### Contextos Existentes:
```
✅ UserContext.tsx       → Maneja username (localizado)
✅ ThemeContext.tsx      → Maneja tema (localizado)
✅ CycleContext.tsx      → Maneja ciclo (localizado)
```

### Almacenamiento Actual:
```
localStorage keys:
- habika_username
- habika_theme
- habika_zen_mode
- habika_cycle_data
- habika_custom_habits
- habika_completions
- habika_activities
- habika_activities_today
- habika_calendar
- habika_reflections
- habika_streak_data
```

### Estructura de Archivos:
```
app/
├── context/
│   ├── UserContext.tsx      ← MANTENER (extender con auth)
│   ├── ThemeContext.tsx     ← OK
│   └── CycleContext.tsx     ← OK
├── hooks/
│   ├── useAuth.ts           ← CREAR (nuevo)
│   ├── useSyncData.ts       ← CREAR (nuevo)
│   └── ...existing hooks
├── lib/
│   ├── supabase.ts          ← CREAR (cliente)
│   ├── supabase-sync.ts     ← CREAR (sincronización)
│   └── store.ts             ← MANTENER
└── components/
    ├── LoginModal.tsx       ← CREAR
    ├── SignupModal.tsx      ← CREAR
    └── SyncStatus.tsx       ← CREAR
```

---

## 📋 ESTRATEGIA DE IMPLEMENTACIÓN

### Principio Clave:
```
FREE User (No logueado):
  └─ localStorage solo (sin cambios)

PREMIUM User (Logueado):
  └─ localStorage (caché) ←→ Supabase (fuente verdadera)

OFFLINE:
  └─ localStorage funciona siempre
```

### Pasos Clave:
1. **No romper userData existente** - mantener UserContext
2. **Extender UserContext** con auth de Supabase
3. **Crear capa de sincronización** separada
4. **Optar por Supabase** solo si usuario está logueado
5. **Fallback a localStorage** si Supabase falla

---

## 🔧 FASE 1: SETUP & AUTHENTICATION (4-5h)

### Paso 1.1: Instalar Supabase Client

```bash
npm install @supabase/supabase-js
```

### Paso 1.2: Crear archivo `.env.local`

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://rmfywfargfgguqackdvc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZnl3ZmFyZ2ZnZ3VxYWNrZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTI2ODYsImV4cCI6MjA3ODQ2ODY4Nn0.Il_vSEpUAmp43OsXNt5cdNdSlZNXEvQEiwt3cM0ez9w
```

**IMPORTANTE:** Agregar `.env.local` a `.gitignore` (debe estar ya)

### Paso 1.3: Crear `app/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions
export type Database = any // We'll expand this later
```

### Paso 1.4: Extender `UserContext.tsx` con Autenticación

**Estrategia:**
- Mantener estado de username existente
- Agregar estado de autenticación (user, session, isPremium)
- Agregar métodos login/signup/logout
- Si usuario no está logueado → usar localStorage solo

```typescript
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { notifyDataChange } from '../lib/storage-utils';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  // Username (existente)
  username: string;
  setUsername: (name: string) => void;

  // Autenticación (nuevo)
  user: User | null;
  session: any | null;
  isPremium: boolean;
  isLoading: boolean;
  error: string | null;

  // Métodos
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  username: 'Usuario',
  setUsername: () => {},
  user: null,
  session: null,
  isPremium: false,
  isLoading: false,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsernameState] = useState('Usuario');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar sesión al montar
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || '',
          });
          setSession(data.session);
        }
      } catch (err) {
        console.error('Error loading session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    // Suscribirse a cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
        });
        setSession(session);
      } else {
        setUser(null);
        setSession(null);
      }
    });

    return () => authListener?.subscription.unsubscribe();
  }, []);

  // Cargar username del localStorage
  useEffect(() => {
    const stored = localStorage.getItem('habika_username');
    if (stored) setUsernameState(stored);
  }, []);

  // Métodos de autenticación
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, usernameInput: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw authError;

      // Guardar username si signup exitoso
      setUsername(usernameInput);
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      // Mantener username y datos locales intactos
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const setUsername = (name: string) => {
    setUsernameState(name);
    localStorage.setItem('habika_username', name);
    notifyDataChange();
  };

  const isPremium = user !== null; // Premium = está logueado

  return (
    <AuthContext.Provider value={{
      username,
      setUsername,
      user,
      session,
      isPremium,
      isLoading,
      error,
      login,
      signup,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### Paso 1.5: Crear `app/hooks/useAuth.ts` (Alias corto)

```typescript
export { useAuth } from '../context/UserContext';
```

### Paso 1.6: Crear `LoginModal.tsx`

```typescript
'use client'

import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { showToast } from './Toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: Props) {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Por favor, completa todos los campos', 'error');
      return;
    }

    try {
      await login(email, password);
      showToast('¡Sesión iniciada!', 'success');
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Error al iniciar sesión', 'error');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-[#3D2C28] mb-4">
          Iniciar Sesión
        </h2>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full h-14 px-4 rounded-2xl bg-slate-50 border-2 border-[#FFB4A8]/30 mb-3"
          disabled={isLoading}
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full h-14 px-4 rounded-2xl bg-slate-50 border-2 border-[#FFB4A8]/30 mb-4"
          disabled={isLoading}
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-12 rounded-full bg-slate-100 text-slate-700 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="flex-1 h-12 rounded-full bg-gradient-to-r from-[#FF8C66] to-[#FF99AC] text-white font-medium"
          >
            {isLoading ? 'Cargando...' : 'Ingresar'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Paso 1.7: Crear `SignupModal.tsx`

Similar a LoginModal pero con campo de username y llamar a signup().

### Paso 1.8: Crear `SyncStatus.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react';

export default function SyncStatus() {
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'error'>('synced');

  // Escuchar eventos de sincronización
  useEffect(() => {
    const handleSync = (event: any) => {
      setSyncStatus(event.detail.status);
    };

    window.addEventListener('sync-status', handleSync);
    return () => window.removeEventListener('sync-status', handleSync);
  }, []);

  const statusConfig = {
    synced: { emoji: '🟢', label: 'Sincronizado' },
    pending: { emoji: '🟡', label: 'Pendiente' },
    error: { emoji: '🔴', label: 'Error' },
  };

  const { emoji, label } = statusConfig[syncStatus];

  return (
    <div className="flex items-center gap-2 text-xs text-[#6B9B9E]">
      {emoji}
      <span>{label}</span>
    </div>
  );
}
```

### Paso 1.9: Actualizar `app/layout.tsx`

```typescript
// En el componente raíz, envolver con AuthProvider
import { AuthProvider } from '@/app/context/UserContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {/* resto del contenido */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Paso 1.10: Actualizar Perfil/Configuración

```typescript
// En /app/perfil o settings page
const { user, username, logout } = useAuth();

if (!user) {
  return <button onClick={openLoginModal}>Iniciar Sesión</button>;
}

return (
  <div>
    <p>Email: {user.email}</p>
    <p>Usuario: {username}</p>
    <button onClick={logout}>Cerrar Sesión</button>
  </div>
);
```

---

## 🔄 FASE 2: DATA SYNC LAYER (5-6h)

### Paso 2.1: Crear `app/lib/supabase-sync.ts`

```typescript
import { supabase } from './supabase';

interface SyncOptions {
  userId: string;
  forceFull?: boolean;
}

/**
 * Sincronizar datos locales a Supabase
 * Usado cuando usuario está logueado y online
 */
export async function syncToSupabase(options: SyncOptions) {
  const { userId, forceFull } = options;

  try {
    // 1. Cargar datos del localStorage
    const habits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    const completions = JSON.parse(localStorage.getItem('habika_completions') || '{}');
    const activities = JSON.parse(localStorage.getItem('habika_activities') || '[]');
    const cycleData = JSON.parse(localStorage.getItem('habika_cycle_data') || '{}');

    // 2. Subir a Supabase (por ahora log, luego implementar inserts)
    console.log('Syncing data for user:', userId);
    console.log('Habits:', habits);
    console.log('Completions:', completions);

    // 3. Guardar timestamp
    localStorage.setItem('lastSyncedAt', new Date().toISOString());

    // 4. Emitir evento de éxito
    window.dispatchEvent(new CustomEvent('sync-status', {
      detail: { status: 'synced' }
    }));
  } catch (error) {
    console.error('Sync error:', error);
    window.dispatchEvent(new CustomEvent('sync-status', {
      detail: { status: 'error' }
    }));
  }
}

/**
 * Obtener datos de Supabase (para Premium)
 */
export async function fetchFromSupabase(userId: string) {
  try {
    // Implementar queries a Supabase aquí
    // Por ahora retornar null para usar localStorage
    return null;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

/**
 * Resolver conflictos con última escritura gana
 */
export function resolveConflict(local: any, remote: any): any {
  const localTime = new Date(local.updated_at || 0).getTime();
  const remoteTime = new Date(remote.updated_at || 0).getTime();
  return remoteTime > localTime ? remote : local;
}
```

### Paso 2.2: Crear `app/hooks/useSyncData.ts`

```typescript
'use client'

import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { syncToSupabase } from '../lib/supabase-sync';

/**
 * Hook que maneja sincronización automática cuando usuario está logueado
 */
export function useSyncData() {
  const { user, isPremium } = useAuth();
  const syncTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!user || !isPremium) {
      return; // Free user, no sincronizar
    }

    // Sincronizar al montar
    syncToSupabase({ userId: user.id });

    // Sincronizar cuando regresa el foco
    const handleFocus = () => {
      window.dispatchEvent(new CustomEvent('sync-status', {
        detail: { status: 'pending' }
      }));
      syncToSupabase({ userId: user.id });
    };

    // Sincronizar cada 30 segundos si está online
    const handleOnline = () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setInterval(() => {
        syncToSupabase({ userId: user.id });
      }, 30000);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    // Sincronizar cada 60 segundos en background
    syncTimeoutRef.current = setInterval(() => {
      syncToSupabase({ userId: user.id });
    }, 60000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [user, isPremium]);
}
```

### Paso 2.3: Integrar `useSyncData` en Layout

```typescript
// En RootLayoutContent o app layout
import { useSyncData } from '@/app/hooks/useSyncData';

export function RootLayoutContent() {
  useSyncData(); // Esto dispara sincronización automática

  return (/* resto del contenido */);
}
```

### Paso 2.4: Actualizar Dashboard para mostrar Premium Status

```typescript
// En /app/page.tsx o dashboard
const { isPremium } = useAuth();

return (
  <div>
    {isPremium && <SyncStatus />}
    {/* resto del contenido */}
  </div>
);
```

---

## ✅ CHECKLIST FASE 1-2

- [ ] `npm install @supabase/supabase-js`
- [ ] `.env.local` creado con credentials
- [ ] `app/lib/supabase.ts` creado
- [ ] `UserContext.tsx` extendido con auth
- [ ] `app/hooks/useAuth.ts` creado (alias)
- [ ] `LoginModal.tsx` funcional
- [ ] `SignupModal.tsx` funcional
- [ ] `SyncStatus.tsx` componente
- [ ] `app/lib/supabase-sync.ts` creado
- [ ] `app/hooks/useSyncData.ts` creado
- [ ] Integración en layout
- [ ] Integración en perfil/settings
- [ ] Build pasa sin errores
- [ ] Todos los commits realizados

---

## 🎯 COMMITS ESPERADOS

1. `feat(env): add Supabase environment variables`
2. `feat(auth): add Supabase client and initial auth setup`
3. `feat(auth): extend UserContext with authentication`
4. `feat(auth-ui): add LoginModal, SignupModal components`
5. `feat(sync): implement data sync layer with offline fallback`
6. `feat(sync): add SyncStatus component and autosync hook`
7. `chore(layout): integrate auth and sync into root layout`

---

## 🧪 TESTING BÁSICO

### Test Login:
```
1. Ir a Settings/Perfil
2. Click "Iniciar Sesión"
3. Ingresar email: test@example.com, password: test123
4. Debe mostrar "¡Sesión iniciada!"
```

### Test Offline:
```
1. Iniciar sesión (Premium)
2. Desconectar internet
3. LocalStorage debe funcionar
4. SyncStatus muestra 🟡 Pendiente
5. Reconectar → se sincroniza
```

### Test Free User:
```
1. No iniciar sesión
2. Toda la app funciona con localStorage
3. No hay botón "Sync"
4. Sin cambios en experiencia
```

---

## 📝 NOTAS IMPORTANTES

1. **No romper localStorage:** El usuario Free NO debe sentir cambios
2. **Graceful degradation:** Si Supabase falla, fallback a localStorage
3. **Mostrar feedback:** SyncStatus indica estado de sincronización
4. **Mantener contextos existentes:** ThemeContext y CycleContext sin cambios
5. **Session persistence:** Leer sesión al recargar app

---

**Status:** Listo para comenzar implementación
**Próximo paso:** Ejecutar cada paso en orden

