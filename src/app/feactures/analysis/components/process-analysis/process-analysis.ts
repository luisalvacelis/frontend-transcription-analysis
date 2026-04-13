import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PipelineMode, AnalysisStatusResponse } from '@api/analysis.interface';
import { CampaignsItem } from '@api/campaigns.interface';

@Component({
  selector: 'app-process-analysis',
  imports: [FormsModule],
  templateUrl: './process-analysis.html',
})
export class ProcessAnalysis {
  @Input({ required: true }) campaigns: CampaignsItem[] = [];
  @Input({ required: true }) selectedCampaignId = '';
  @Input({ required: true }) selectedPromptId = '';
  @Input({ required: true }) selectedFormatId = '';
  @Input({ required: true }) mode: PipelineMode = 'transcribe';
  @Input({ required: true }) transcribeProvider: 'deepgram' | 'whisperx' = 'deepgram';
  @Input({ required: true }) working = false;
  @Input() status: AnalysisStatusResponse | null = null;

  @Output() selectedCampaignIdChange = new EventEmitter<string>();
  @Output() selectedPromptIdChange = new EventEmitter<string>();
  @Output() selectedFormatIdChange = new EventEmitter<string>();
  @Output() modeChange = new EventEmitter<PipelineMode>();
  @Output() transcribeProviderChange = new EventEmitter<'deepgram' | 'whisperx'>();
  @Output() runPipeline = new EventEmitter<void>();
  @Output() stopAnalysis = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();
  @Output() downloadExcel = new EventEmitter<void>();

  public onModeChange(value: string): void {
    this.modeChange.emit(value as PipelineMode);
  }

  public onTranscribeProviderChange(value: string): void {
    this.transcribeProviderChange.emit(value as 'deepgram' | 'whisperx');
  }

  public get canStopAnalysis(): boolean {
    return !!this.status?.active_analysis;
  }
}
