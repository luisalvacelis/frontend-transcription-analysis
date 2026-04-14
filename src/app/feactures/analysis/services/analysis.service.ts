import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AnalysisResultsResponse,
  AnalysisStartRequest,
  AnalysisStatusResponse,
  CampaignTranscriptionsResponse,
  OutputFormatCreate,
  OutputFormatItem,
  PipelineStartRequest,
  PromptFormatSuggestionItem,
  MetadataExtractionTypeItem,
  PromptTemplateCreate,
  PromptTemplateItem,
  PromptTemplateUpdate,
} from '@api/analysis.interface';
import { ApiConfigService } from '@core/config/api-config.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  private readonly _http = inject(HttpClient);
  private readonly _api = inject(ApiConfigService);

  public listPrompts(): Observable<PromptTemplateItem[]> {
    return this._http.get<PromptTemplateItem[]>(this._api.main('/analysis-configs/prompts'));
  }

  public createPrompt(dto: PromptTemplateCreate): Observable<PromptTemplateItem> {
    return this._http.post<PromptTemplateItem>(this._api.main('/analysis-configs/prompts'), dto);
  }

  public updatePrompt(promptId: string, dto: PromptTemplateUpdate): Observable<PromptTemplateItem> {
    return this._http.put<PromptTemplateItem>(
      this._api.main(`/analysis-configs/prompts/${promptId}`),
      dto,
    );
  }

  public deletePrompt(promptId: string): Observable<{ message: string; detail?: string | null }> {
    return this._http.delete<{ message: string; detail?: string | null }>(
      this._api.main(`/analysis-configs/prompts/${promptId}`),
    );
  }

  public listFormats(): Observable<OutputFormatItem[]> {
    return this._http.get<OutputFormatItem[]>(this._api.main('/analysis-configs/formats'));
  }

  public listMetadataExtractionTypes(): Observable<MetadataExtractionTypeItem[]> {
    return this._http.get<MetadataExtractionTypeItem[]>(
      this._api.main('/analysis-configs/metadata-extraction-types'),
    );
  }

  public listPromptFormatSuggestions(): Observable<PromptFormatSuggestionItem[]> {
    return this._http.get<PromptFormatSuggestionItem[]>(
      this._api.main('/analysis-configs/prompt-format-suggestions'),
    );
  }

  public createFormat(dto: OutputFormatCreate): Observable<OutputFormatItem> {
    return this._http.post<OutputFormatItem>(this._api.main('/analysis-configs/formats'), dto);
  }

  public deleteFormat(formatId: string): Observable<{ message: string; detail?: string | null }> {
    return this._http.delete<{ message: string; detail?: string | null }>(
      this._api.main(`/analysis-configs/formats/${formatId}`),
    );
  }

  public startCampaignAnalysis(
    campaignId: string,
    dto: AnalysisStartRequest,
  ): Observable<{ message: string }> {
    return this._http.post<{ message: string }>(
      this._api.main(`/campaigns/${campaignId}/analyze-all-async`),
      dto,
    );
  }

  public startCampaignPipeline(
    campaignId: string,
    dto: PipelineStartRequest,
  ): Observable<{ message: string }> {
    return this._http.post<{ message: string }>(
      this._api.main(`/campaigns/${campaignId}/pipeline-async`),
      dto,
    );
  }

  public stopCampaignAnalysis(campaignId: string): Observable<{ message: string }> {
    return this._http.post<{ message: string }>(
      this._api.main(`/campaigns/${campaignId}/analyze-stop`),
      {},
    );
  }

  public getCampaignAnalysisStatus(campaignId: string): Observable<AnalysisStatusResponse> {
    return this._http.get<AnalysisStatusResponse>(
      this._api.main(`/campaigns/${campaignId}/analyze-status`),
    );
  }

  public getCampaignAnalysisResults(campaignId: string): Observable<AnalysisResultsResponse> {
    return this._http.get<AnalysisResultsResponse>(
      this._api.main(`/campaigns/${campaignId}/analysis-results`),
    );
  }

  public getCampaignTranscriptions(campaignId: string): Observable<CampaignTranscriptionsResponse> {
    return this._http.get<CampaignTranscriptionsResponse>(
      this._api.main(`/campaigns/${campaignId}/transcriptions`),
    );
  }

  public transcribeCampaign(
    campaignId: string,
    provider: 'deepgram' | 'whisperx' = 'deepgram',
  ): Observable<{ message: string }> {
    return this._http.post<{ message: string }>(
      this._api.main(`/campaigns/${campaignId}/transcribe-all`),
      { provider },
    );
  }

  public getTranscribeStatus(campaignId: string): Observable<any> {
    return this._http.get<any>(this._api.main(`/campaigns/${campaignId}/transcribe-status`));
  }

  public downloadCampaignExcel(campaignId: string): Observable<Blob> {
    return this._http.get(this._api.main(`/campaigns/${campaignId}/analysis-export`), {
      responseType: 'blob',
    });
  }
}
