import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .eq('slug', 'test-busiones')
    .maybeSingle()

  return Response.json({ data, error })
}
