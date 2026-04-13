import { Component, Input, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnalysisResultItem, CampaignTranscriptionItem } from '@api/analysis.interface';

interface TranscriptionRow {
  time: string;
  speaker: string;
  text: string;
}

interface AudioSummaryRow {
  audio_id: string;
  audio_name: string;
  criteria_count: number;
}

@Component({
  selector: 'app-results-analysis-table',
  imports: [FormsModule],
  templateUrl: './results-analysis-table.html',
})
export class ResultsAnalysisTable {
  private readonly _results = signal<AnalysisResultItem[]>([]);
  private readonly _transcriptions = signal<CampaignTranscriptionItem[]>([]);

  @Input({ required: true })
  set results(value: AnalysisResultItem[]) {
    this._results.set(value ?? []);
    this.analysisPage.set(1);
  }
  get results(): AnalysisResultItem[] {
    return this._results();
  }

  @Input({ required: true })
  set transcriptions(value: CampaignTranscriptionItem[]) {
    this._transcriptions.set(value ?? []);
    this.transcriptionPage.set(1);
  }
  get transcriptions(): CampaignTranscriptionItem[] {
    return this._transcriptions();
  }

  public readonly pageSize = 10;

  public readonly analysisAudioFilter = signal<string>('');
  public readonly analysisCriteriaFilter = signal<string>('');
  public readonly transcriptionAudioFilter = signal<string>('');

  public readonly analysisPage = signal<number>(1);
  public readonly transcriptionPage = signal<number>(1);

  public readonly selectedAudioName = signal<string>('');
  public readonly selectedTranscriptionRows = signal<TranscriptionRow[]>([]);
  public readonly selectedAnalysisRows = signal<AnalysisResultItem[]>([]);

  public readonly filteredResults = computed(() => {
    const audioFilter = this.analysisAudioFilter().trim().toLowerCase();
    const criteriaFilter = this.analysisCriteriaFilter().trim().toLowerCase();

    return this._results().filter((row) => {
      const audioName = String(row.audio_name || '').toLowerCase();
      const matchesAudio = !audioFilter || audioName.includes(audioFilter);
      const criterio = String(row.criterio || row.data?.['criterio'] || '').toLowerCase();
      const matchesCriteria = !criteriaFilter || criterio.includes(criteriaFilter);
      return matchesAudio && matchesCriteria;
    });
  });

  public readonly filteredTranscriptions = computed(() => {
    const audioFilter = this.transcriptionAudioFilter().trim().toLowerCase();
    return this._transcriptions().filter((row) => {
      const audioName = String(row.audio_name || '').toLowerCase();
      return !audioFilter || audioName.includes(audioFilter);
    });
  });

  public readonly analysisAudioRows = computed(() => {
    const byAudio = new Map<string, AudioSummaryRow>();

    for (const item of this._transcriptions()) {
      byAudio.set(item.audio_id, {
        audio_id: item.audio_id,
        audio_name: item.audio_name,
        criteria_count: 0,
      });
    }

    for (const row of this.filteredResults()) {
      const existing = byAudio.get(row.audio_id);
      if (existing) {
        existing.criteria_count += 1;
      } else {
        byAudio.set(row.audio_id, {
          audio_id: row.audio_id,
          audio_name: row.audio_name,
          criteria_count: 1,
        });
      }
    }

    const rows = Array.from(byAudio.values());
    rows.sort((a, b) => a.audio_name.localeCompare(b.audio_name));
    return rows;
  });

  public readonly analysisTotalPages = computed(() => {
    return Math.max(1, Math.ceil(this.analysisAudioRows().length / this.pageSize));
  });

  public readonly transcriptionTotalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredTranscriptions().length / this.pageSize));
  });

  public readonly pagedResults = computed(() => {
    const page = Math.min(this.analysisPage(), this.analysisTotalPages());
    const start = (Math.max(1, page) - 1) * this.pageSize;
    return this.analysisAudioRows().slice(start, start + this.pageSize);
  });

  public readonly pagedTranscriptions = computed(() => {
    const page = Math.min(this.transcriptionPage(), this.transcriptionTotalPages());
    const start = (Math.max(1, page) - 1) * this.pageSize;
    return this.filteredTranscriptions().slice(start, start + this.pageSize);
  });

  public onAnalysisFilterChange(): void {
    this.analysisPage.set(1);
  }

  public onTranscriptionFilterChange(): void {
    this.transcriptionPage.set(1);
  }

  public goToAnalysisPage(page: number): void {
    const safePage = Math.max(1, Math.min(page, this.analysisTotalPages()));
    this.analysisPage.set(safePage);
  }

  public goToTranscriptionPage(page: number): void {
    const safePage = Math.max(1, Math.min(page, this.transcriptionTotalPages()));
    this.transcriptionPage.set(safePage);
  }

  public openTranscriptionModal(modal: HTMLDialogElement, item: CampaignTranscriptionItem): void {
    this.selectedAudioName.set(item.audio_name);
    this.selectedTranscriptionRows.set(this.parseTranscription(item.transcription));
    modal.showModal();
  }

  public openAnalysisModal(modal: HTMLDialogElement, audioId: string, audioName: string): void {
    const rows = this.filteredResults().filter((row) => row.audio_id === audioId);
    this.selectedAudioName.set(audioName);
    this.selectedAnalysisRows.set(rows);
    modal.showModal();
  }

  private parseTranscription(transcription: string): TranscriptionRow[] {
    const lines = (transcription || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const rows: TranscriptionRow[] = [];
    for (const line of lines) {
      const parts = line.split('|').map((part) => part.trim());
      if (parts.length >= 3) {
        const time = parts[0] || '-';
        const speaker = this.normalizeSpeaker(parts[1]);
        const text = parts.slice(2).join(' | ').trim();
        rows.push({ time, speaker, text: text || '-' });
      } else {
        rows.push({
          time: '-',
          speaker: 'SPEAKER_00',
          text: line,
        });
      }
    }

    return rows;
  }

  private normalizeSpeaker(raw: string): string {
    const value = (raw || '').trim();
    if (!value) return 'SPEAKER_00';

    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      const n = Math.max(0, Math.floor(numeric));
      return `SPEAKER_${String(n).padStart(2, '0')}`;
    }

    if (/^speaker_/i.test(value)) {
      return value.toUpperCase();
    }

    return value.toUpperCase();
  }
}
