import { createClient } from 'npm:@supabase/supabase-js@2.110.6'

const allowedOrigin = Deno.env.get('APP_ORIGIN') ?? 'https://geezfully.com'
const bucketName = Deno.env.get('ACT_SIGNATURE_BUCKET') ?? 'private-act-assets'
const objectPath = Deno.env.get('ACT_SIGNATURE_PATH') ?? 'beneficiary-signature-stamp.png'

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  }
}

function jsonResponse(
  request: Request,
  status: number,
  error: string,
): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('Origin')
  if (origin && origin !== allowedOrigin) {
    return jsonResponse(request, 403, 'Origin neautorizat.')
  }
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }
  if (request.method !== 'GET') {
    return jsonResponse(request, 405, 'Metodă neacceptată.')
  }

  const authorization = request.headers.get('Authorization') ?? ''
  if (!authorization.startsWith('Bearer ')) {
    return jsonResponse(request, 401, 'Autentificare necesară.')
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const publishableKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
    return jsonResponse(request, 500, 'Funcția nu este configurată complet.')
  }

  const token = authorization.slice('Bearer '.length)
  const userClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: userData, error: userError } = await userClient.auth.getUser(token)
  if (userError || !userData.user) {
    return jsonResponse(request, 401, 'Sesiune invalidă sau expirată.')
  }

  const { data: profile, error: profileError } = await userClient
    .from('profiles')
    .select('approved')
    .eq('id', userData.user.id)
    .single()
  if (profileError || profile?.approved !== true) {
    return jsonResponse(request, 403, 'Contul nu are acces aprobat.')
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: image, error: imageError } = await adminClient.storage
    .from(bucketName)
    .download(objectPath)
  if (imageError || !image) {
    console.error('Private act signature download failed', imageError?.message)
    return jsonResponse(request, 503, 'Semnătura protejată nu este disponibilă.')
  }

  return new Response(await image.arrayBuffer(), {
    status: 200,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'image/png',
      'Content-Length': String(image.size),
      'Cache-Control': 'private, no-store, max-age=0',
      'Content-Disposition': 'inline; filename="act-signature.png"',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'X-Content-Type-Options': 'nosniff',
    },
  })
})
