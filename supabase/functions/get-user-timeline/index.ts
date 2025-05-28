import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { DateTime } from 'https://esm.sh/luxon@3';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({
      error: 'Missing Authorization header'
    }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'), {
    global: {
      headers: {
        Authorization: authHeader
      }
    }
  });

  // ✅ Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({
      error: 'Unauthorized'
    }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const userId = user.id;

  // 🔄 Get last_timeline_seen from profile
  const { data: profile, error: profileError } = await supabase.from('profiles').select('last_timeline_seen').eq('id', userId).single();
  if (profileError) {
    return new Response(JSON.stringify({
      error: profileError.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const lastTimelineSeen = profile?.last_timeline_seen ? DateTime.fromISO(profile.last_timeline_seen) : null;

  // 🗂 Get all MomentBoards (via RPC)
  const { data: boards, error: boardError } = await supabase.rpc('get_user_timeline_boards', {
    user_id: userId
  });
  if (boardError) {
    return new Response(JSON.stringify({
      error: boardError.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  console.log('Raw boards from RPC:', boards);

  // 🛠 Enrich board data
  const result = (boards ?? []).map((b) => {
    const latestCard = b.latest_card_at ? DateTime.fromISO(b.latest_card_at) : null;
    const unseenCardCount = lastTimelineSeen && latestCard && latestCard > lastTimelineSeen ? b.card_count : 0;
    const activityMonth = latestCard ? latestCard.toFormat('yyyy-MM') : null;

    return {
      id: b.id,
      title: b.title,
      description: b.description,
      date_start: b.date_start,
      date_end: b.date_end,
      created_by: b.created_by,
      is_owner: b.created_by === userId,
      participant_count: b.participant_count,
      total_card_count: b.card_count,
      unseen_card_count: unseenCardCount,
      access_type: b.access_type,
      activity_month: activityMonth
    };
  });

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}); 