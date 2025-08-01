import { createClient } from '@supabase/supabase-js'

const SUPABASE_KEY = 'SUPABASE_CLIENT_API_KEY'
const SUPABASE_URL = 'https://jmpnptkxtmbhiqhwqtkh.supabase.co'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// signup using facebook integration
export async function testFacebookLogin() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: window.location.origin, // Đảm bảo trùng với Redirect URI trong Meta Developer
    },
  })

  if (error) {
    console.error('Login failed:', error.message)
  } else {
    console.log('Redirecting to Facebook login...')
  }
}