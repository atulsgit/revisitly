import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return Response.json({ error: 'No slug provided' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, business_type, google_review_url')
    .eq('slug', slug)
    .maybeSingle()

  return Response.json({ data, error })
}