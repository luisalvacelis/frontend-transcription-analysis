export interface PromptTemplateItem {
  id: string;
  user_id: string;
  name: string;
  prompt_text: string;
  is_active: boolean;
  register_date: Date;
  updated_date?: Date | null;
}

export interface PromptTemplateCreate {
  name: string;
  prompt_text: string;
}

export interface PromptTemplateUpdate {
  name?: string;
  prompt_text?: string;
  is_active?: boolean;
}

export interface OutputFormatItem {
  id: string;
  user_id: string;
  name: string;
  fields_json: string;
  description?: string | null;
  is_active: boolean;
  register_date: Date;
  updated_date?: Date | null;
}

export interface OutputFormatCreate {
  name: string;
  fields: string[];
  description?: string;
  layout_config?: Record<string, unknown>;
}

export interface MetadataExtractionTypeItem {
  id: string;
  name: string;
  description: string;
}

export interface AnalysisStartRequest {
  prompt_template_id: string;
  output_format_id: string;
  provider: string;
}

export type PipelineMode = 'transcribe' | 'analyze' | 'both';

export interface PipelineStartRequest {
  mode: PipelineMode;
  transcribe_provider: 'deepgram' | 'whisperx';
  analysis_provider: 'openai';
  prompt_template_id?: string;
  output_format_id?: string;
  metadata_extraction_type?: string;
}

export interface PromptFormatSuggestionItem {
  prompt_id: string;
  prompt_name: string;
  format_id?: string | null;
  format_name?: string | null;
  score: number;
  reason: string;
}

export interface AnalysisStatusResponse {
  campaign_id: string;
  campaign_name: string;
  active_analysis: boolean;
  total: number;
  completed: number;
  failed: number;
  pending: number;
  progress_percentage: number;
  cancelled: boolean;
  message?: string;
}

export interface AnalysisResultItem {
  audio_id: string;
  audio_name: string;
  criterio: string;
  evaluacion: string;
  justificacion: string;
  obs_adicional?: string | null;
  cost?: number | null;
  data?: Record<string, string | number | boolean | null>;
}

export interface AnalysisResultsResponse {
  campaign_id: string;
  campaign_name: string;
  total_rows: number;
  items: AnalysisResultItem[];
}

export interface CampaignTranscriptionItem {
  audio_id: string;
  audio_name: string;
  transcription: string;
  minutes?: number;
}

export interface CampaignTranscriptionsResponse {
  campaign_id: string;
  campaign_name: string;
  total_rows: number;
  items: CampaignTranscriptionItem[];
}
