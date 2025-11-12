import { NextRequest, NextResponse } from 'next/server'

/**
 * Auth Callback Route for Supabase
 * Handles email confirmation and redirects after auth operations
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Handle errors
  if (error) {
    console.error('Auth error:', error, error_description)
    return NextResponse.redirect(
      new URL(`/app/perfil?error=${encodeURIComponent(error_description || error)}`, request.url)
    )
  }

  // Handle successful auth callback
  if (code) {
    console.log('Auth callback successful')
    // Redirect to profile page
    return NextResponse.redirect(new URL('/app/perfil?success=true', request.url))
  }

  // No code or error
  return NextResponse.redirect(new URL('/app/perfil', request.url))
}
