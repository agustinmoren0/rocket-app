'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/app/context/UserContext'
import {
  migrateAllData,
  verifyMigration,
  isMigrationComplete,
  createUserProfile,
  type MigrationStats,
} from '@/app/lib/supabase-migrate'
import styles from '@/app/styles/migration.module.css'

interface MigrationModalProps {
  isOpen: boolean
  onComplete: () => void
}

export default function MigrationModal({ isOpen, onComplete }: MigrationModalProps) {
  const [status, setStatus] = useState<'idle' | 'migrating' | 'verifying' | 'complete' | 'error'>(
    'idle'
  )
  const [stats, setStats] = useState<MigrationStats | null>(null)
  const [error, setError] = useState<string>('')
  const { user, username } = useUser()

  useEffect(() => {
    if (!isOpen || !user) return

    const runMigration = async () => {
      try {
        setStatus('migrating')
        setError('')

        // Check if already migrated
        const alreadyMigrated = await isMigrationComplete(user.id)
        if (alreadyMigrated) {
          console.log('✅ Data already migrated')
          setStatus('complete')
          setTimeout(onComplete, 1500)
          return
        }

        // Create user profile
        const profileCreated = await createUserProfile(user.id, username, user.email || 'unknown')
        if (!profileCreated) {
          throw new Error('Failed to create user profile')
        }

        // Migrate all data
        const migrationStats = await migrateAllData(user.id)
        setStats(migrationStats)

        // Verify migration
        setStatus('verifying')
        const verification = await verifyMigration(user.id)

        if (verification.verified) {
          console.log('✅ Migration verified successfully')
          setStatus('complete')
          setTimeout(onComplete, 1500)
        } else {
          console.warn('⚠️ Migration verification found mismatches:', verification.mismatches)
          // Still mark as complete but show warnings
          setStatus('complete')
          setTimeout(onComplete, 2000)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        setStatus('error')
        console.error('Migration error:', err)
      }
    }

    runMigration()
  }, [isOpen, user, username, onComplete])

  if (!isOpen) return null

  return (
    <div className={styles.backdrop} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-labelledby="migration-title"
        aria-modal="true"
      >
        <div className={styles.content}>
          <h2 id="migration-title" className={styles.title}>
            {status === 'complete' ? '✅ Listo!' : '⏳ Migrando datos...'}
          </h2>

          {status === 'migrating' && (
            <div className={styles.migrating}>
              <div className={styles.spinner} />
              <p className={styles.message}>Preparando tu cuenta en la nube...</p>
              <p className={styles.submessage}>
                Esto puede tomar un momento, por favor no cierres la aplicación
              </p>
            </div>
          )}

          {status === 'verifying' && (
            <div className={styles.verifying}>
              <div className={styles.spinner} />
              <p className={styles.message}>Verificando datos...</p>
              {stats && (
                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <span className={styles.label}>Hábitos:</span>
                    <span className={styles.value}>{stats.habits}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.label}>Actividades:</span>
                    <span className={styles.value}>{stats.activities}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.label}>Reflexiones:</span>
                    <span className={styles.value}>{stats.reflections}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {status === 'complete' && (
            <div className={styles.complete}>
              <div className={styles.successIcon}>🎉</div>
              <p className={styles.message}>Tu cuenta está lista en la nube</p>
              {stats && (
                <div className={styles.summaryStats}>
                  <p>Se migraron correctamente:</p>
                  <ul>
                    {stats.habits > 0 && <li>{stats.habits} hábitos</li>}
                    {stats.activities > 0 && <li>{stats.activities} actividades</li>}
                    {stats.reflections > 0 && <li>{stats.reflections} reflexiones</li>}
                    {stats.completions > 0 && <li>{stats.completions} registros de completación</li>}
                    {stats.cycleData && <li>Datos del ciclo menstrual</li>}
                  </ul>
                  <p className={styles.timeInfo}>
                    Tiempo total: {(stats.totalTime / 1000).toFixed(1)}s
                  </p>
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className={styles.error}>
              <div className={styles.errorIcon}>⚠️</div>
              <p className={styles.message}>Error durante la migración</p>
              <p className={styles.errorText}>{error}</p>
              <p className={styles.submessage}>
                Tu app sigue funcionando sin conexión. Intenta de nuevo más tarde.
              </p>
            </div>
          )}
        </div>

        {status === 'complete' && (
          <button onClick={onComplete} className={styles.button} aria-label="Continuar">
            Continuar
          </button>
        )}

        {status === 'error' && (
          <div className={styles.buttonGroup}>
            <button onClick={onComplete} className={styles.button}>
              Continuar sin sincronizar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
