export interface AudiosLoad {
  page: number;
  page_size: number;
  campaign_id?: string | null;
  search?: string;
}

export interface AudiosItem {
  id: string;
  campaign_id: string;
  audio_name: string;
  transcription: string;
  cost: number;
  minutes: number;
  register_date: Date;
  updated_date?: Date | null;
}

export interface AudiosUpload {
  file: File;
  campaign_id: string;
}

export interface AudiosUploads {
  files: File[];
  campaign_id: string;
}

export interface AudiosUploadResponse {
  id: string;
  campaign_id: string;
  audio_name: string;
  transcription: string;
  cost: number;
  minutes: number;
  register_date: Date;
  updated_date: Date;
}

export interface AudiosUploadsResponse {
  message: string;
  audios: AudiosUploadResponse[];
}

export interface AudiosDeleteResponse {
  message: string;
  detail: string;
}

export interface AudiosUpdate {
  audio_name: string;
}

export interface AudiosUpdateResponse {
  id: string;
  campaign_id: string;
  audio_name: string;
  transcription: string;
  cost: number;
  minutes: number;
  register_date: Date;
  updated_date?: Date | null;
}

export interface AudiosStatsSummary {
  total: number;
  transcribed: number;
  pending: number;
  total_cost: number;
  total_duration_minutes: number;
}
