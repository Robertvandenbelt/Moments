import { createClient } from '@supabase/supabase-js';
import { MomentBoard, CreateMomentBoardData } from '../lib/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please connect to Supabase using the button in the top right.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (data.user) {
    // Insert into profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        display_name: displayName
      });

    if (profileError) {
      throw profileError;
    }
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    return null;
  }
  
  return data.user;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getProfileStats(userId: string) {
  try {
    const [
      { data: ownedBoards },
      { data: shares },
      { data: cards }
    ] = await Promise.all([
      // Get all boards owned by user
      supabase
        .from('moment_boards')
        .select('id, moment_shares(*)')
        .eq('created_by', userId),
      
      // Get all shares where user is a participant
      supabase
        .from('moment_shares')
        .select('moment_board_id')
        .eq('user_id', userId),
      
      // Get count of cards created by user
      supabase
        .from('moment_cards')
        .select('id')
        .eq('uploaded_by', userId)
    ]);

    // Initialize counts
    let privateCount = 0;
    let sharedCount = 0;
    let joinedCount = 0;
    const cardsAdded = cards?.length || 0;

    // Process owned boards
    if (ownedBoards) {
      ownedBoards.forEach(board => {
        if (board.moment_shares && board.moment_shares.length > 0) {
          sharedCount++;
        } else {
          privateCount++;
        }
      });
    }

    // Process joined boards (excluding owned ones)
    if (shares) {
      const ownedBoardIds = new Set(ownedBoards?.map(board => board.id) || []);
      joinedCount = shares.filter(share => !ownedBoardIds.has(share.moment_board_id)).length;
    }

    return {
      privateCount,
      sharedCount,
      joinedCount,
      cardsAdded
    };
  } catch (error) {
    console.error('Error computing profile stats:', error);
    return {
      privateCount: 0,
      sharedCount: 0,
      joinedCount: 0,
      cardsAdded: 0
    };
  }
}

export async function getMomentBoard(id: string): Promise<MomentBoard> {
  const { data, error } = await supabase
    .from('moment_boards')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function checkBoardMembership(boardId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('moment_shares')
    .select('id')
    .eq('moment_board_id', boardId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // not found
      return false;
    }
    throw error;
  }

  return !!data;
}

export const getUserTimeline = async (): Promise<MomentBoard[]> => {
  // Get all boards the user owns or has joined
  const { data: moments, error } = await supabase
    .from('moment_boards')
    .select(`
      id,
      title,
      description,
      date_start,
      date_end,
      is_public_preview,
      created_by,
      created_at,
      moment_cards (count)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return moments || [];
};

export async function updateLastTimelineSeen() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .update({ last_timeline_seen: new Date().toISOString() })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating last timeline seen:', error);
  }
}

export async function createMomentBoard(data: CreateMomentBoardData): Promise<MomentBoard> {
  const { data: user } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: board, error } = await supabase
    .from('moment_boards')
    .insert({
      title: data.title || null,
      description: data.description || null,
      date_start: data.date_start,
      date_end: data.date_end || null,
      created_by: user.user.id,
      is_public_preview: false
    })
    .select()
    .single();

  if (error) throw error;
  return board;
}

export function getShareLink(momentBoardId: string): string {
  return `${window.location.origin}/join/${momentBoardId}`;
}