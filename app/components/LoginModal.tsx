'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser } from '@/app/context/UserContext'
import styles from '@/app/styles/modals.module.css'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSignupClick?: () => void
}

export default function LoginModal({ isOpen, onClose, onSignupClick }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useUser()
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
    if (!email.trim()) {
      setError('El email es requerido')
      return false
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un email válido')
      return false
    }
    if (!password.trim()) {
      setError('La contraseña es requerida')
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
      await login(email, password)
      setEmail('')
      setPassword('')
      onClose()
    } catch (err) {
      console.error('Login error:', err)
      let message = 'Login failed'
      if (err instanceof Error) {
        message = err.message
      } else if (typeof err === 'object' && err !== null) {
        message = (err as any).message || (err as any).msg || JSON.stringify(err)
      }
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
        aria-labelledby="login-title"
        aria-modal="true"
      >
        <div className={styles.modalHeader}>
          <h2 id="login-title" className={styles.modalTitle}>
            Iniciar Sesión
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
            {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className={styles.modalFooter}>
          <p>
            ¿No tienes cuenta?{' '}
            <button
              onClick={() => {
                onClose()
                onSignupClick?.()
              }}
              className={styles.linkButton}
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
