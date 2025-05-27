import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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

    const { moment_board_id } = await req.json();
    if (!moment_board_id) {
      return new Response(JSON.stringify({
        error: 'Missing moment_board_id'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const { data: board, error: boardError } = await supabase.from('moment_boards').select('*').eq('id', moment_board_id).single();
    if (boardError || !board) {
      return new Response(JSON.stringify({
        error: 'Board not found'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    const isOwner = board.created_by === user.id;
    const { data: shares } = await supabase.from('moment_shares').select('user_id').eq('moment_board_id', moment_board_id);
    const isParticipant = shares?.some((s) => s.user_id === user.id);

    if (!isOwner && !isParticipant) {
      return new Response(JSON.stringify({
        error: 'Forbidden'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403
      });
    }

    const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', board.created_by).single();
    const { data: participants } = await supabase.from('profiles').select('id, display_name').in('id', shares?.map((s) => s.user_id) || []);
    const { data: cards } = await supabase.from('moment_cards').select('id, moment_board_id, media_url, uploaded_by, created_at, type, description').eq('moment_board_id', moment_board_id).order('created_at', {
      ascending: true
    });

    const { data: favorites } = await supabase.from('favorites').select('moment_card_id').eq('user_id', user.id);
    const { data: allProfiles } = await supabase.from('profiles').select('id, display_name');
    const profileMap = Object.fromEntries((allProfiles || []).map((p) => [
      p.id,
      p.display_name
    ]));

    const favoriteIds = new Set((favorites || []).map((f) => f.moment_card_id));
    const enrichedCards = (cards || []).map((card) => ({
      ...card,
      uploader_initial: (profileMap[card.uploaded_by] || 'U')[0],
      is_favorited: favoriteIds.has(card.id),
      is_own_card: card.uploaded_by === user.id,
      uploader_display_name: card.uploaded_by === user.id ? 'You' : profileMap[card.uploaded_by] || 'Unknown'
    }));

    return new Response(JSON.stringify({
      board: {
        ...board,
        owner_display_name: profile?.display_name,
        role: isOwner ? 'owner' : 'participant',
        participant_count: shares?.length || 0,
        card_count: cards?.length || 0
      },
      cards: enrichedCards
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