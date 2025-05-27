import { supabase } from '../lib/supabaseClient';

export type MomentCard = {
  id: string;
  moment_board_id: string;
  media_url: string | null;
  optimized_url: string | null;
  description: string | null;
  uploaded_by: string;
  created_at: string;
  type: 'photo' | 'text';
  uploader_initial: string;
  is_favorited: boolean;
  is_own_card: boolean;
  uploader_display_name: string;
};

export async function addTextCard(moment_board_id: string, text: string): Promise<MomentCard> {
  if (!text.trim()) {
    throw new Error('Text is required');
  }

  if (text.length > 500) {
    throw new Error('Text exceeds maximum length of 500 characters');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not logged in');

  const { data, error } = await supabase
    .from('moment_cards')
    .insert({
      moment_board_id,
      uploaded_by: user.id,
      type: 'text',
      description: text.trim()
    })
    .select(`
      id,
      moment_board_id,
      media_url,
      description,
      uploaded_by,
      created_at,
      type
    `)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create text card');

  // Enrich the card with additional fields
  return {
    ...data,
    optimized_url: null,
    uploader_initial: 'Y',  // Will be replaced by the actual initial in the UI
    is_favorited: false,
    is_own_card: true,
    uploader_display_name: 'You'
  };
}

export async function deleteMomentCard(cardId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No session');
  }

  const response = await fetch('https://ekwpzlzdjbfzjdtdfafk.supabase.co/functions/v1/delete-moment-card', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ card_id: cardId })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (errorData?.error) {
      throw new Error(errorData.error);
    } else if (response.status === 404) {
      throw new Error('Card not found');
    } else {
      throw new Error('Failed to delete card');
    }
  }

  const result = await response.json();
  console.log('Delete result:', result);
} 