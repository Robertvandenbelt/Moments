import { supabase } from '../lib/supabaseClient';

export const deleteMomentBoard = async (momentBoardId: string) => {
  console.log('Deleting moment board with ID:', momentBoardId);
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No session found');

  console.log('Got session, making API call...');
  const response = await fetch(
    'https://ekwpzlzdjbfzjdtdfafk.supabase.co/functions/v1/delete-moment-board',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ moment_board_id: momentBoardId }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('API error:', error);
    throw new Error(`Failed to delete moment board: ${error}`);
  }

  const result = await response.json();
  console.log('API response:', result);
  return result;
}; 