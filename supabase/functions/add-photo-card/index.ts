// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_server

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';

// List of allowed origins for CORS
const allowedOrigins = [
  "https://getmoments.net",
  "https://www.getmoments.net",
  "http://localhost:3000" // for local dev
];

// Helper to build CORS headers dynamically
function getCorsHeaders(origin: string | null) {
  if (!origin || !allowedOrigins.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400' // 24 hours
    };
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400' // 24 hours
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: 'Missing Authorization header'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_ANON_KEY') ?? '', 
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('JSON parse error:', e);
      return new Response(JSON.stringify({
        error: 'Invalid JSON body'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const { moment_board_id, media_url } = body;
    if (!moment_board_id || !media_url) {
      console.error('Missing required fields:', { moment_board_id, media_url });
      return new Response(JSON.stringify({
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Derive filename from URL
    const pathParts = media_url.split('/');
    const filename = pathParts[pathParts.length - 1];

    // Fix the storage path to match the upload path (Originals instead of original)
    const transformedUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/render/image/public/momentcards/PhotoCards/Originals/${filename}?width=800&quality=80`;

    // Create the card in the database
    const cardId = uuidv4();
    console.log('Attempting to create card with data:', {
      id: cardId,
      moment_board_id,
      uploaded_by: user.id,
      media_url,
      type: 'photo'
    });

    // First, verify the moment board exists and user has access
    const { data: board, error: boardError } = await supabase
      .from('moment_boards')
      .select('id, created_by')
      .eq('id', moment_board_id)
      .single();

    if (boardError) {
      console.error('Board lookup error:', boardError);
      return new Response(JSON.stringify({
        error: 'Failed to verify board access',
        details: boardError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    if (!board) {
      console.error('Board not found:', moment_board_id);
      return new Response(JSON.stringify({
        error: 'Board not found'
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if user has access to the board
    const { data: share, error: shareError } = await supabase
      .from('moment_shares')
      .select('user_id')
      .eq('moment_board_id', moment_board_id)
      .eq('user_id', user.id)
      .single();

    if (board.created_by !== user.id && (!share || shareError)) {
      console.error('Access denied:', { user: user.id, board: board.created_by });
      return new Response(JSON.stringify({
        error: 'Access denied to board'
      }), {
        status: 403,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Now create the card
    const { data, error } = await supabase
      .from('moment_cards')
      .insert({
        id: cardId,
        moment_board_id,
        uploaded_by: user.id,
        media_url,
        type: 'photo'
      })
      .select(`
        id,
        moment_board_id,
        media_url,
        optimized_url,
        description,
        uploaded_by,
        created_at,
        type
      `)
      .single();

    if (error) {
      console.error('Database error details:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        constraint: error.constraint
      });
      return new Response(JSON.stringify({
        error: 'Failed to create photo card',
        details: error.message,
        hint: error.hint
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('Successfully created card:', data);

    // Enrich the response with user metadata and transformed URL
    const enrichedData = {
      ...data,
      uploader_initial: user.email?.[0].toUpperCase() || 'U',
      is_favorited: false,
      is_own_card: true,
      uploader_display_name: user.user_metadata?.full_name || 'You',
      optimized_url: data.optimized_url || data.media_url,
      description: data.description || '',
      photo_transformed_url: transformedUrl
    };

    return new Response(JSON.stringify(enrichedData), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: err instanceof Error ? err.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}); 