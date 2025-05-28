import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: 'Missing Authorization header'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'), {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }

    const { momentBoardId } = await req.json();
    if (!momentBoardId) {
      return new Response(JSON.stringify({
        error: 'Missing momentBoardId'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Check if already joined
    const { data: existing, error: checkError } = await supabase
      .from('moment_shares')
      .select('id')
      .eq('moment_board_id', momentBoardId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (checkError) {
      return new Response(JSON.stringify({
        error: 'Failed to check membership'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    if (existing) {
      return new Response(JSON.stringify({
        status: 'already_joined'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // Insert share
    const { error: insertError } = await supabase
      .from('moment_shares')
      .insert({
        moment_board_id: momentBoardId,
        user_id: user.id
      });

    if (insertError) {
      return new Response(JSON.stringify({
        error: 'Failed to join moment',
        details: insertError.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    return new Response(JSON.stringify({
      status: 'joined'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: err.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}); 