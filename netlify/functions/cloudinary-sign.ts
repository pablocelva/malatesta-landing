import crypto from 'crypto'

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY!
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY!
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET!

function generateCloudinarySignature(params: Record<string, string | number>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')

  return crypto.createHash('sha1').update(sorted + cloudinaryApiSecret).digest('hex')
}

async function verifyToken(token: string): Promise<boolean> {
  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseKey,
    },
  })
  return res.ok
}

export default async function handler(request: Request): Promise<Response> {
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing authorization token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const token = authHeader.slice(7)
  const isValid = await verifyToken(token)

  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const paramsToSign: Record<string, string | number> = {
    timestamp,
    upload_preset: process.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
  }

  const signature = generateCloudinarySignature(paramsToSign)

  return new Response(JSON.stringify({
    signature,
    timestamp,
    api_key: cloudinaryApiKey,
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
