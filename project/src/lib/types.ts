export type User = {
  id: string;
  email: string;
  display_name?: string;
};

export type Profile = {
  id: string;
  display_name: string;
  created_at: string;
};

export type AuthError = {
  message: string;
};

export type RouteProps = {
  children: React.ReactNode;
};

export type BasicMomentBoard = {
  id: string;
  title: string | null;
  description: string | null;
  date_start: string;
  date_end: string | null;
  created_by: string;
  created_at?: string;
  is_public_preview?: boolean;
};

export type MomentBoard = {
  id: string;
  title: string | null;
  description: string | null;
  date_start: string;
  date_end: string | null;
  created_by: string;
  is_owner: boolean;
  participant_count: number;
  total_card_count: number;
  unseen_card_count: number;
  access_type: string;
  preview_photo_url?: string;
  moment_cards?: {
    count: number;
  };
  created_by_display_name?: string;
};

export type GroupedMoments = {
  [key: string]: MomentBoard[];
};

export type CreateMomentBoardData = {
  title?: string;
  description?: string;
  date_start: string;
  date_end?: string;
};

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

export interface MomentCardProps {
  card: MomentCard;
  onFavorite: (cardId: string) => Promise<void>;
  onClick?: () => void;
  canDelete?: boolean;
  onDelete?: (cardId: string) => Promise<void>;
}

export interface MomentCardViewerProps {
  cards: MomentCard[];
  currentCardIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onFavorite: (cardId: string) => Promise<void>;
  canDelete?: boolean;
  onDelete?: (cardId: string) => Promise<void>;
}