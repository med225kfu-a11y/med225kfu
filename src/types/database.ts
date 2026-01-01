export type LessonStatus = 
  | 'uploaded_transcription'
  | 'will_be_transcribed'
  | 'no_transcription'
  | 'previous_batch_sufficient'
  | 'not_studied_yet';

export interface Category {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface Unit {
  id: string;
  category_id: string;
  name: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  unit_id: string;
  title: string;
  status: LessonStatus;
  transcription_url: string | null;
  transcription_link: string | null;
  summary_url: string | null;
  summary_link: string | null;
  notes: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  site_title: string;
  logo_url: string | null;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

export const LESSON_STATUS_CONFIG: Record<LessonStatus, { label: string; color: string }> = {
  uploaded_transcription: { label: 'Uploaded transcription', color: 'bg-status-uploaded' },
  will_be_transcribed: { label: 'Will be transcribed', color: 'bg-status-will-transcribe' },
  no_transcription: { label: 'No transcription available', color: 'bg-status-no-transcription' },
  previous_batch_sufficient: { label: 'Previous batch transcription is sufficient', color: 'bg-status-previous-batch' },
  not_studied_yet: { label: 'Not studied yet', color: 'bg-status-not-studied' },
};

export interface LessonQuizLink {
  id: string;
  lesson_id: string;
  url: string;
  display_order: number;
  created_at: string;
}

export interface LessonVideoLink {
  id: string;
  lesson_id: string;
  title: string;
  url: string;
  display_order: number;
  created_at: string;
}

export interface LessonAdditionalFile {
  id: string;
  lesson_id: string;
  label: string;
  file_url: string | null;
  link_url: string | null;
  display_order: number;
  created_at: string;
}

export interface LessonHelpCenterEntry {
  id: string;
  lesson_id: string;
  entry_type: 'text' | 'link';
  content: string;
  link_url: string | null;
  created_at: string;
}

export interface CountdownEvent {
  id: string;
  name: string;
  event_datetime: string;
  created_at: string;
  updated_at: string;
}
