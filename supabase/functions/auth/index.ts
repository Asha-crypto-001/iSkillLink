import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('CLIENT_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const admin = createClient(supabaseUrl, serviceRoleKey);
const auth = createClient(supabaseUrl, anonKey);

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function profileFor(userId: string) {
  const { data, error } = await admin
    .from('user_profiles')
    .select('id,email,name,role,phone,location,avatar_url,created_at,updated_at')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await request.json();
    const action = body.action;
    let session;

    if (action === 'register') {
      if (!['learner', 'educator'].includes(body.role)) {
        return response({ error: 'Public registration is limited to learner or educator accounts.' }, 400);
      }
      const result = await auth.auth.signUp({
        email: String(body.email).trim().toLowerCase(),
        password: String(body.password),
        options: {
          data: {
            name: String(body.name).trim(),
            phone: String(body.phone ?? ''),
            location: String(body.location ?? 'Mbarara City, Uganda'),
            avatar_url: String(body.avatar_url ?? ''),
          },
        },
      });
      if (result.error) return response({ error: result.error.message }, 400);
      session = result.data.session;
    } else if (action === 'login') {
      const result = await auth.auth.signInWithPassword({
        email: String(body.email).trim().toLowerCase(),
        password: String(body.password),
      });
      if (result.error) return response({ error: 'Invalid email or password.' }, 401);
      session = result.data.session;
    } else if (action === 'google') {
      const result = await auth.auth.signInWithIdToken({
        provider: 'google',
        token: String(body.credential),
      });
      if (result.error) return response({ error: 'Google authentication could not be verified.' }, 401);
      session = result.data.session;
    } else if (action === 'me') {
      const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
      if (!token) return response({ error: 'Authentication required.' }, 401);
      const result = await auth.auth.getUser(token);
      if (result.error || !result.data.user) return response({ error: 'Invalid or expired session.' }, 401);
      return response({ user: await profileFor(result.data.user.id), learnerProfile: null, educatorProfile: null });
    } else if (action === 'logout') {
      return response({ success: true });
    } else {
      return response({ error: 'Unsupported authentication action.' }, 400);
    }

    if (!session?.user) {
      return response({ error: 'Email confirmation is required before signing in.' }, 403);
    }
    if (action === 'register' && ['learner', 'educator'].includes(body.role)) {
      await admin.from('user_profiles').update({ role: body.role }).eq('id', session.user.id);
    }
    const profile = await profileFor(session.user.id);
    return response({
      user: profile,
      learnerProfile: null,
      educatorProfile: null,
      token: session.access_token,
      session,
    });
  } catch (error) {
    console.error('[Supabase Auth]', error);
    return response({ error: 'Authentication service failed.' }, 500);
  }
});
