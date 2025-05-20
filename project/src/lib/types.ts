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