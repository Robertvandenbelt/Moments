-- Drop any existing functions with this name
DROP FUNCTION IF EXISTS get_user_timeline_boards(uuid);

CREATE OR REPLACE FUNCTION get_user_timeline_boards(
  IN user_id uuid,
  OUT id uuid,
  OUT title text,
  OUT description text,
  OUT date_start timestamptz,
  OUT date_end timestamptz,
  OUT created_by uuid,
  OUT created_at timestamptz,
  OUT participant_count bigint,
  OUT card_count bigint,
  OUT access_type text,
  OUT latest_card_at timestamptz,
  OUT preview_photo_url text
)
RETURNS SETOF record AS $$
#variable_conflict use_variable
BEGIN
  RETURN QUERY
  WITH board_participants AS (
    -- Count participants for each board (excluding owner)
    SELECT 
      moment_board_id,
      COUNT(DISTINCT ms.user_id) as other_participants
    FROM moment_shares ms
    GROUP BY moment_board_id
  ),
  board_cards AS (
    -- Get card count and latest card for each board
    SELECT 
      mc.moment_board_id,
      COUNT(*) as total_cards,
      MAX(mc.created_at) as latest_card,
      -- Get the URL of the most recent photo card as preview
      (
        SELECT media_url 
        FROM moment_cards mc2 
        WHERE mc2.moment_board_id = mc.moment_board_id 
          AND mc2.type = 'photo' 
          AND mc2.media_url IS NOT NULL
        ORDER BY mc2.created_at DESC 
        LIMIT 1
      ) as preview_photo
    FROM moment_cards mc
    GROUP BY mc.moment_board_id
  )
  SELECT 
    mb.id::uuid,
    mb.title::text,
    mb.description::text,
    mb.date_start::timestamptz,
    mb.date_end::timestamptz,
    mb.created_by::uuid,
    mb.created_at::timestamptz,
    -- Always add 1 to include the owner in the total count
    (1 + COALESCE(bp.other_participants, 0))::bigint as participant_count,
    COALESCE(bc.total_cards, 0)::bigint as card_count,
    CASE 
      WHEN mb.created_by = get_user_timeline_boards.user_id THEN 'owner'::text
      ELSE 'participant'::text
    END as access_type,
    bc.latest_card::timestamptz,
    bc.preview_photo::text
  FROM moment_boards mb
  LEFT JOIN board_participants bp ON bp.moment_board_id = mb.id
  LEFT JOIN board_cards bc ON bc.moment_board_id = mb.id
  WHERE 
    mb.created_by = get_user_timeline_boards.user_id  -- Boards owned by user
    OR EXISTS (  -- Boards where user is a participant
      SELECT 1 
      FROM moment_shares ms2 
      WHERE ms2.moment_board_id = mb.id 
      AND ms2.user_id = get_user_timeline_boards.user_id
    )
  ORDER BY COALESCE(bc.latest_card, mb.created_at) DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql; 