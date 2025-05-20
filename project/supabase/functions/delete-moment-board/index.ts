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

    // ✅ Ownership check
    const { data: board, error: boardError } = await supabase
      .from('moment_boards')
      .select('id, created_by')
      .eq('id', moment_board_id)
      .single();

    if (boardError || board.created_by !== user.id) {
      return new Response(JSON.stringify({
        error: 'Not allowed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403
      });
    }

    // ✅ Fetch all cards for this board
    const { data: cards, error: cardError } = await supabase
      .from('moment_cards')
      .select('id, type, media_url')
      .eq('moment_board_id', moment_board_id);

    if (cardError) {
      return new Response(JSON.stringify({
        error: cardError.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    const cardIds = cards.map((c) => c.id);

    // ✅ 1. Delete favorites linked to these cards
    if (cardIds.length > 0) {
      await supabase.from('favorites').delete().in('moment_card_id', cardIds);
    }

    // ✅ 2. Delete moment_cards
    await supabase.from('moment_cards').delete().eq('moment_board_id', moment_board_id);

    // ✅ 3. Delete associated files from Supabase Storage
    const filesToDelete = cards
      .map((card) => {
        if (!card.media_url) return null;
        const base = 'https://ekwpzlzdjbfzjdtdfafk.supabase.co/storage/v1/object/public/';
        if (!card.media_url.startsWith(base)) return null;
        return card.media_url.replace(base, '');
      })
      .filter(Boolean);

    if (filesToDelete.length > 0) {
      await supabase.storage.from('momentcards').remove(filesToDelete);
    }

    // ✅ 4. Delete moment_shares
    await supabase.from('moment_shares').delete().eq('moment_board_id', moment_board_id);

    // ✅ 5. Delete the board itself
    await supabase.from('moment_boards').delete().eq('id', moment_board_id);

    return new Response(JSON.stringify({
      status: 'ok',
      deleted_cards: cards.length
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