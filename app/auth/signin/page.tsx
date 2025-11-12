'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/context/UserContext'
import LoginModal from '@/app/components/LoginModal'

/**
 * Sign In Page
 * Displays login modal for existing users to login directly from Landing
 * Redirects to dashboard after successful login
 */
export default function SignInPage() {
  const router = useRouter()
  const { user, isLoading } = useUser()
  const [showModal, setShowModal] = useState(true)

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (!isLoading && user?.id) {
      router.push('/app')
    }
  }, [user?.id, isLoading, router])

  const handleClose = () => {
    // If user closes the modal, redirect back to landing
    router.push('/')
  }

  const handleSignupClick = () => {
    // Redirect to onboarding for new users
    router.push('/app/onboarding')
  }

  return (
    <LoginModal
      isOpen={showModal}
      onClose={handleClose}
      onSignupClick={handleSignupClick}
    />
  )
}
