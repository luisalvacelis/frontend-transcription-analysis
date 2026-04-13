export interface CampaignsLoad {
  page: number;
  page_size: number;
  search?: string;
}

export interface CampaignsItem {
  id: string;
  campaign_name: string;
  description: string;
  register_date: Date;
  updated_date?: Date;
}

export interface CampaignsCreate {
  campaign_name: string;
  description: string;
}

export interface CampaignsDeleteResponse {
  message: string;
  detail: string;
}

export interface CampaignsUpdate {
  campaign_name: string;
  description: string;
}

export interface CampaignsStats {
  campaign_id: string;
  campaign_name: string;
  user_id: string;
  total_audios: number;
  done: number;
  total_cost: number;
  total_duration_minutes: number;
}

export interface CampaignWithStatsItem {
  id: string;
  campaign_name: string;
  description?: string | null;
  total_audios: number;
  transcribed: number;
  pending: number;
  status: 'EMPTY' | 'COMPLETED' | 'PARTIAL' | 'PENDING' | string;
  transcription_cost?: number;
  analysis_cost?: number;
  total_cost: number;
  total_duration_minutes: number;
  register_date: string;
  updated_date: string;
}
