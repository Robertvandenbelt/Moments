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

export type MomentBoard = {
  id: string;
  title: string | null;
  description: string | null;
  date_start: string;
  date_end: string | null;
  is_public_preview: boolean;
  created_by: string;
  created_at: string;
  moment_cards: { count: number } | null;
  is_owner: boolean;
  participant_count: number;
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
  uploaded_by: string;
  created_at: string;
  type: 'photo' | 'text';
  uploader_initial: string;
  is_favorited: boolean;
  is_own_card: boolean;
  uploader_display_name: string;
};

export type MomentCardViewerProps = {
  cards: MomentCard[];
  currentCardIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onFavorite: (cardId: string) => Promise<void>;
  canDelete?: boolean;
  onDelete?: (cardId: string) => Promise<void>;
};

export type MomentCardProps = {
  card: MomentCard;
  onFavorite: (cardId: string) => Promise<void>;
  onClick?: () => void;
  canDelete?: boolean;
  onDelete?: (cardId: string) => Promise<void>;
};