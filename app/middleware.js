import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not logged in and tries to access dashboard, redirect to auth
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // If user is already logged in and visits auth page, redirect to dashboard
  // if (session && req.nextUrl.pathname === '/auth') {
  //   return NextResponse.redirect(new URL('/dashboard', req.url))
  // }
  // If logged in and visits auth page → check plan
if (session && req.nextUrl.pathname === '/auth') {
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: business } = await supabase
    .from('businesses')
    .select('plan')
    .eq('user_id', session.user.id)
    .single()

  const plan = business?.plan
  if (plan === 'growth' || plan === 'pro') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  } else {
    return NextResponse.redirect(new URL('/pricing', req.url))
  }
}

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth'],
}
