import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AnalysisResultItem,
  AnalysisStatusResponse,
  CampaignTranscriptionItem,
  MetadataExtractionTypeItem,
  OutputFormatItem,
  PipelineMode,
  PromptFormatSuggestionItem,
  PromptTemplateItem,
} from '@api/analysis.interface';
import { CampaignsItem } from '@api/campaigns.interface';
import { AnalysisService } from '@feactures/analysis/services/analysis.service';
import { CampaignsService } from '@feactures/campaigns/services/campaigns.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HeaderAnalysis } from '@feactures/analysis/components/header-analysis/header-analysis';
import { ProcessAnalysis } from '@feactures/analysis/components/process-analysis/process-analysis';
import { FormatManager } from '@feactures/analysis/components/format-manager/format-manager';
import { ResultsAnalysisTable } from '@feactures/analysis/components/results-analysis-table/results-analysis-table';

@Component({
  selector: 'app-analysis-home',
  imports: [FormsModule, HeaderAnalysis, ProcessAnalysis, FormatManager, ResultsAnalysisTable],
  templateUrl: './analysis-home.html',
  styleUrl: './analysis-home.css',
})
export class AnalysisHome {
  private readonly _analysisService = inject(AnalysisService);
  private readonly _campaignsService = inject(CampaignsService);
  private readonly _destroyRef = inject(DestroyRef);

  public readonly campaigns = signal<CampaignsItem[]>([]);
  public readonly prompts = signal<PromptTemplateItem[]>([]);
  public readonly formats = signal<OutputFormatItem[]>([]);
  public readonly results = signal<AnalysisResultItem[]>([]);
  public readonly transcriptions = signal<CampaignTranscriptionItem[]>([]);
  public readonly status = signal<AnalysisStatusResponse | null>(null);
  public readonly promptFormatSuggestions = signal<Record<string, PromptFormatSuggestionItem>>({});
  public readonly metadataExtractionTypes = signal<MetadataExtractionTypeItem[]>([]);

  public readonly selectedCampaignId = signal<string>('');
  public readonly selectedPromptId = signal<string>('');
  public readonly selectedFormatId = signal<string>('');
  public readonly processMode = signal<PipelineMode>('transcribe');
  public readonly transcribeProvider = signal<'deepgram' | 'whisperx'>('deepgram');

  public readonly newPromptName = signal<string>('');
  public readonly newPromptText = signal<string>('');
  public readonly promptMessage = signal<string>('');
  public readonly promptMessageType = signal<'error' | 'success' | ''>('');
  public readonly newFormatName = signal<string>('');
  public readonly newFormatFields = signal<string>(
    'criterio,evaluacion,justificacion,obs_adicional',
  );
  public readonly newFormatDescription = signal<string>('');
  public readonly selectedMetadataExtractionType = signal<string>('model_default');
  public readonly newFormatLayoutConfig = signal<string>(
    '{\n  "transcription": {\n    "enabled": true,\n    "chunk_size": 32000,\n    "column_prefix": "TRANSCRIPCION_LLAMADA"\n  },\n  "observation_groups": [\n    { "from": 1, "to": 16, "column": "observaciones_1_al_16", "include_evaluations": ["No cumple"] },\n    { "from": 17, "to": 26, "column": "observaciones_17_al_26", "include_evaluations": ["No cumple"] },\n    { "from": 27, "to": 32, "column": "observaciones_27_al_32", "include_evaluations": ["No cumple"] },\n    { "from": 33, "to": 37, "column": "observaciones_33_al_37", "include_evaluations": ["No cumple"] }\n  ]\n}',
  );
  public readonly formatMessage = signal<string>('');
  public readonly formatMessageType = signal<'error' | 'success' | ''>('');

  public readonly loading = signal<boolean>(false);
  public readonly working = signal<boolean>(false);
  public readonly error = signal<string>('');
  public readonly success = signal<string>('');

  private pollingId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this._destroyRef.onDestroy(() => this.stopPolling());
    this.loadInitialData();

    effect(() => {
      const campaignId = this.selectedCampaignId();
      if (!campaignId) {
        this.results.set([]);
        this.transcriptions.set([]);
        this.status.set(null);
        return;
      }
      this.refreshStatusesAndResults();
    });
  }

  private loadInitialData(): void {
    this.loading.set(true);
    this.error.set('');

    this._campaignsService
      .loadTop100()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (data) => {
          this.campaigns.set(data.items);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.message || 'No se pudieron cargar campañas');
          this.loading.set(false);
        },
      });

    this.refreshConfigLists();
  }

  public refreshConfigLists(): void {
    this._analysisService
      .listPrompts()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (items) => this.prompts.set(items),
        error: () => this.error.set('No se pudieron cargar prompts'),
      });

    this._analysisService
      .listFormats()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (items) => this.formats.set(items),
        error: () => this.error.set('No se pudieron cargar formatos'),
      });

    this._analysisService
      .listPromptFormatSuggestions()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (items) => {
          const mapping = items.reduce<Record<string, PromptFormatSuggestionItem>>((acc, item) => {
            acc[item.prompt_id] = item;
            return acc;
          }, {});
          this.promptFormatSuggestions.set(mapping);
        },
        error: () => this.promptFormatSuggestions.set({}),
      });

    this._analysisService
      .listMetadataExtractionTypes()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (items) => {
          this.metadataExtractionTypes.set(items);
          const exists = items.some((item) => item.id === this.selectedMetadataExtractionType());
          if (!exists) {
            const fallback =
              items.find((item) => item.id === 'model_default')?.id ?? items[0]?.id ?? '';
            this.selectedMetadataExtractionType.set(fallback);
          }
        },
        error: () =>
          this.metadataExtractionTypes.set([
            { id: 'none', name: 'Sin extraccion automatica', description: '' },
          ]),
      });
  }

  public onPromptSelected(promptId: string): void {
    this.selectedPromptId.set(promptId);
    if (!promptId) {
      return;
    }

    const suggestion = this.promptFormatSuggestions()[promptId];
    if (!suggestion?.format_id) {
      return;
    }

    const exists = this.formats().some((item) => item.id === suggestion.format_id);
    if (!exists) {
      return;
    }

    this.success.set(`Sugerencia disponible para este prompt: ${suggestion.format_name}`);
  }

  public createPrompt(): void {
    this.clearMessages();
    this.promptMessage.set('');
    this.promptMessageType.set('');
    const name = this.newPromptName().trim();
    const promptText = this.newPromptText().trim();
    if (!name || promptText.length < 10) {
      this.promptMessage.set('Nombre y prompt son obligatorios (minimo 10 caracteres en prompt).');
      this.promptMessageType.set('error');
      return;
    }

    this.working.set(true);
    this._analysisService
      .createPrompt({ name, prompt_text: promptText })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this.promptMessage.set('Prompt registrado correctamente');
          this.promptMessageType.set('success');
          this.newPromptName.set('');
          this.newPromptText.set('');
          this.working.set(false);
          this.refreshConfigLists();
        },
        error: (err) => {
          this.promptMessage.set(err?.error?.detail || 'No se pudo registrar prompt');
          this.promptMessageType.set('error');
          this.working.set(false);
        },
      });
  }

  public createFormat(): void {
    this.clearMessages();
    this.formatMessage.set('');
    this.formatMessageType.set('');
    const name = this.newFormatName().trim();
    const description = this.newFormatDescription().trim();
    const layoutText = this.newFormatLayoutConfig().trim();
    const fields = this.newFormatFields()
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

    if (!name || fields.length === 0) {
      this.formatMessage.set('Nombre y campos del formato son obligatorios.');
      this.formatMessageType.set('error');
      return;
    }

    let layoutConfig: Record<string, unknown> | undefined;
    if (layoutText) {
      try {
        const parsed = JSON.parse(layoutText) as Record<string, unknown>;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          const selectedType = this.selectedMetadataExtractionType().trim();
          if (selectedType) {
            parsed['metadata_extraction_type'] = selectedType;
          } else {
            delete parsed['metadata_extraction_type'];
          }
          layoutConfig = parsed;
        } else {
          this.formatMessage.set('La configuracion de Excel debe ser un JSON valido.');
          this.formatMessageType.set('error');
          return;
        }
      } catch {
        this.formatMessage.set('La configuracion de Excel debe ser un JSON valido.');
        this.formatMessageType.set('error');
        return;
      }
    } else {
      const selectedType = this.selectedMetadataExtractionType().trim();
      layoutConfig = selectedType ? { metadata_extraction_type: selectedType } : {};
    }

    this.working.set(true);
    this._analysisService
      .createFormat({ name, fields, description, layout_config: layoutConfig })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this.formatMessage.set('Formato registrado correctamente');
          this.formatMessageType.set('success');
          this.newFormatName.set('');
          this.newFormatDescription.set('');
          this.newFormatFields.set('criterio,evaluacion,justificacion,obs_adicional');
          this.selectedMetadataExtractionType.set('model_default');
          this.newFormatLayoutConfig.set(
            '{\n  "transcription": {\n    "enabled": true,\n    "chunk_size": 32000,\n    "column_prefix": "TRANSCRIPCION_LLAMADA"\n  },\n  "observation_groups": [\n    { "from": 1, "to": 16, "column": "observaciones_1_al_16", "include_evaluations": ["No cumple"] },\n    { "from": 17, "to": 26, "column": "observaciones_17_al_26", "include_evaluations": ["No cumple"] },\n    { "from": 27, "to": 32, "column": "observaciones_27_al_32", "include_evaluations": ["No cumple"] },\n    { "from": 33, "to": 37, "column": "observaciones_33_al_37", "include_evaluations": ["No cumple"] }\n  ]\n}',
          );
          this.working.set(false);
          this.refreshConfigLists();
        },
        error: (err) => {
          this.formatMessage.set(err?.error?.detail || 'No se pudo registrar formato');
          this.formatMessageType.set('error');
          this.working.set(false);
        },
      });
  }

  public deletePrompt(promptId: string): void {
    this.clearMessages();
    this._analysisService
      .deletePrompt(promptId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this.promptMessage.set('Prompt eliminado');
          this.promptMessageType.set('success');
          this.refreshConfigLists();
        },
        error: () => {
          this.promptMessage.set('No se pudo eliminar prompt');
          this.promptMessageType.set('error');
        },
      });
  }

  public deleteFormat(formatId: string): void {
    this.clearMessages();
    this._analysisService
      .deleteFormat(formatId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this.formatMessage.set('Formato eliminado');
          this.formatMessageType.set('success');
          this.refreshConfigLists();
        },
        error: () => {
          this.formatMessage.set('No se pudo eliminar formato');
          this.formatMessageType.set('error');
        },
      });
  }

  public startPipeline(): void {
    const campaignId = this.selectedCampaignId();
    const mode = this.processMode();
    const promptId = this.selectedPromptId();
    const formatId = this.selectedFormatId();

    if (!campaignId) {
      this.error.set('Selecciona una campaña primero.');
      return;
    }

    if ((mode === 'analyze' || mode === 'both') && (!promptId || !formatId)) {
      this.error.set('Para analizar, selecciona prompt y formato.');
      return;
    }

    this.clearMessages();
    this.working.set(true);
    this._analysisService
      .startCampaignPipeline(campaignId, {
        mode,
        transcribe_provider: this.transcribeProvider(),
        analysis_provider: 'openai',
        prompt_template_id: promptId || undefined,
        output_format_id: formatId || undefined,
        metadata_extraction_type: this.selectedMetadataExtractionType() || undefined,
      })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this.success.set(`Proceso ${mode} iniciado`);
          this.working.set(false);
          this.refreshStatusesAndResults();
          if (mode === 'transcribe' || mode === 'both') {
            this.startPolling();
          }
        },
        error: (err) => {
          this.error.set(err?.error?.detail || 'No se pudo iniciar proceso');
          this.working.set(false);
        },
      });
  }

  public stopAnalysis(): void {
    const campaignId = this.selectedCampaignId();
    if (!campaignId) return;

    this._analysisService
      .stopCampaignAnalysis(campaignId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this.success.set('Solicitud de detencion enviada');
          this.stopPolling();
          this.refreshStatusesAndResults();
        },
        error: () => this.error.set('No se pudo detener el analisis'),
      });
  }

  public refreshStatusesAndResults(): void {
    const campaignId = this.selectedCampaignId();
    if (!campaignId) return;

    this._analysisService
      .getCampaignAnalysisStatus(campaignId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (status) => this.status.set(status),
        error: () => this.error.set('No se pudo obtener estado de analisis'),
      });

    this._analysisService
      .getCampaignAnalysisResults(campaignId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (data) => this.results.set(data.items),
        error: () => this.results.set([]),
      });

    this._analysisService
      .getCampaignTranscriptions(campaignId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (data) => this.transcriptions.set(data.items),
        error: () => this.transcriptions.set([]),
      });

    this._analysisService
      .getTranscribeStatus(campaignId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (transcribeStatus) => {
          const mode = this.processMode();
          const hasTranscribe = mode === 'transcribe' || mode === 'both';
          const transcribeActive = !!transcribeStatus?.active_transcription;
          const analysisActive = !!this.status()?.active_analysis;
          if (hasTranscribe && !transcribeActive && !analysisActive) {
            this.stopPolling();
          }
        },
        error: () => {
          this.stopPolling();
        },
      });
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollingId = setInterval(() => {
      this.refreshStatusesAndResults();
    }, 3000);
  }

  private stopPolling(): void {
    if (this.pollingId) {
      clearInterval(this.pollingId);
      this.pollingId = null;
    }
  }

  public downloadExcel(): void {
    const campaignId = this.selectedCampaignId();
    if (!campaignId) {
      this.error.set('Selecciona una campaña para exportar.');
      return;
    }

    this._analysisService
      .downloadCampaignExcel(campaignId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `analysis_${campaignId}.xlsx`;
          anchor.click();
          window.URL.revokeObjectURL(url);
          this.success.set('Excel descargado');
        },
        error: (err) => {
          this.error.set(err?.error?.detail || 'No se pudo descargar excel');
        },
      });
  }

  private clearMessages(): void {
    this.error.set('');
    this.success.set('');
    this.formatMessage.set('');
    this.formatMessageType.set('');
    this.promptMessage.set('');
    this.promptMessageType.set('');
  }
}
