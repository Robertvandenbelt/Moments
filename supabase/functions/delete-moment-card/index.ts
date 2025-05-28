import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'), {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization')
        }
      }
    });

    const { card_id } = await req.json();
    if (!card_id) {
      return new Response(
        JSON.stringify({
          error: 'Missing card_id'
        }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 1: Fetch card
    const { data: card, error: fetchError } = await supabase
      .from('moment_cards')
      .select('id, moment_board_id, media_url')
      .eq('id', card_id)
      .single();

    if (fetchError || !card) {
      return new Response(
        JSON.stringify({
          error: 'Card not found',
          details: fetchError?.message
        }), 
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 2: Delete favorites
    const { error: favError, count: favCount } = await supabase
      .from('favorites')
      .delete({ count: 'exact' })
      .eq('moment_card_id', card_id);

    if (favError) {
      return new Response(
        JSON.stringify({
          error: 'Failed to delete favorites',
          details: favError.message
        }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 3: Delete media from storage (if any)
    let storageDeleted = false;
    const bucket = 'momentcards';
    if (card.media_url) {
      let path = card.media_url;
      // Strip full URL if needed
      if (path.includes('supabase.co/storage/v1/object/public/')) {
        path = path.split('/object/public/')[1].split(`${bucket}/`)[1];
      }
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (!storageError) {
        storageDeleted = true;
      } else {
        console.log('⚠️ Storage delete failed:', storageError.message);
      }
    }

    // Step 4: Delete the card
    const { error: deleteError } = await supabase
      .from('moment_cards')
      .delete()
      .eq('id', card_id);

    if (deleteError) {
      return new Response(
        JSON.stringify({
          error: 'Failed to delete moment_card',
          details: deleteError.message
        }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        status: 'deleted',
        deleted_favorites: favCount ?? 0,
        deleted_storage: storageDeleted
      }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: err.message
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 