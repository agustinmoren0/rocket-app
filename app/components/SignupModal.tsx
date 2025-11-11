'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser } from '@/app/context/UserContext'
import styles from '@/app/styles/modals.module.css'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginClick?: () => void
}

export default function SignupModal({ isOpen, onClose, onLoginClick }: SignupModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useUser()
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const validateForm = () => {
    if (username.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return false
    }
    if (username.length > 50) {
      setError('El nombre no puede exceder 50 caracteres')
      return false
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await signup(email, password, username)
      setEmail('')
      setPassword('')
      setUsername('')
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className={styles.modalBackdrop}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={styles.modalContent}
        role="dialog"
        aria-labelledby="signup-title"
        aria-modal="true"
      >
        <div className={styles.modalHeader}>
          <h2 id="signup-title" className={styles.modalTitle}>
            Crear Cuenta
          </h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Cerrar diálogo"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.formLabel}>
              Nombre de Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.slice(0, 50))}
              placeholder="Tu nombre"
              disabled={isLoading}
              required
              className={styles.formInput}
              aria-describedby={error ? 'error-message' : 'char-counter'}
            />
            <small id="char-counter" className={styles.charCounter}>
              {username.length}/50
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              disabled={isLoading}
              required
              className={styles.formInput}
              aria-describedby={error ? 'error-message' : undefined}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              required
              className={styles.formInput}
              aria-describedby={error ? 'error-message' : undefined}
            />
            <small className={styles.helpText}>
              Mínimo 6 caracteres
            </small>
          </div>

          {error && (
            <div id="error-message" className={styles.errorMessage} role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
            aria-busy={isLoading}
          >
            {isLoading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <div className={styles.modalFooter}>
          <p>
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={() => {
                onClose()
                onLoginClick?.()
              }}
              className={styles.linkButton}
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
