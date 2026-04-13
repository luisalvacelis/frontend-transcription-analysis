import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AudiosItem, AudiosStatsSummary } from '@api/audios.interface';
import { CampaignWithStatsItem } from '@api/campaigns.interface';
import { AudiosService } from '@feactures/audios/services/audios.service';
import { CampaignsService } from '@feactures/campaigns/services/campaigns.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly _audiosService = inject(AudiosService);
  private readonly _campaignsService = inject(CampaignsService);
  private readonly _destroyRef = inject(DestroyRef);

  public readonly loading = signal<boolean>(true);
  public readonly summary = signal<AudiosStatsSummary | null>(null);
  public readonly recentAudios = signal<AudiosItem[]>([]);
  public readonly campaigns = signal<CampaignWithStatsItem[]>([]);
  public readonly transcribedPercent = computed(() => {
    const total = Number(this.summary()?.total || 0);
    if (total <= 0) return 0;
    const transcribed = Number(this.summary()?.transcribed || 0);
    return Math.round((transcribed / total) * 100);
  });
  public readonly pendingPercent = computed(() => {
    const total = Number(this.summary()?.total || 0);
    if (total <= 0) return 0;
    const pending = Number(this.summary()?.pending || 0);
    return Math.round((pending / total) * 100);
  });
  public readonly campaignCostChart = computed(() => {
    const rows = this.campaigns()
      .map((campaign) => ({
        id: campaign.id,
        label: campaign.campaign_name,
        shortLabel: this.shortenAudioName(campaign.campaign_name),
        transcriptionCost: Number(campaign.transcription_cost ?? 0),
        analysisCost: Number(campaign.analysis_cost ?? 0),
        totalCost: Number(campaign.total_cost || 0),
        hasBreakdown:
          campaign.transcription_cost !== undefined && campaign.analysis_cost !== undefined,
        totalAudios: Number(campaign.total_audios || 0),
      }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 8);

    const max = rows.reduce((acc, row) => (row.totalCost > acc ? row.totalCost : acc), 0);
    return rows.map((row, index) => ({
      ...row,
      rank: index + 1,
      width: max > 0 ? Math.max(4, Math.round((row.totalCost / max) * 100)) : 4,
    }));
  });

  public readonly costBreakdown = computed(() => {
    const campaigns = this.campaigns();
    const hasBreakdown = campaigns.some(
      (campaign) =>
        campaign.transcription_cost !== undefined || campaign.analysis_cost !== undefined,
    );

    const transcription = campaigns.reduce(
      (acc, campaign) => acc + Number(campaign.transcription_cost ?? 0),
      0,
    );
    const analysis = campaigns.reduce(
      (acc, campaign) => acc + Number(campaign.analysis_cost ?? 0),
      0,
    );
    const total = campaigns.reduce((acc, campaign) => acc + Number(campaign.total_cost || 0), 0);

    return {
      hasBreakdown,
      transcription,
      analysis,
      total,
    };
  });

  constructor() {
    this.loadDashboard();
  }

  public loadDashboard(): void {
    this.loading.set(true);

    this._audiosService
      .getStatsSummary()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (data) => this.summary.set(data),
        error: () => this.summary.set(null),
      });

    this._audiosService
      .load({ page: 1, page_size: 5 })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (page) => {
          this.recentAudios.set(page.items);
          this.loading.set(false);
        },
        error: () => {
          this.recentAudios.set([]);
          this.loading.set(false);
        },
      });

    this._campaignsService
      .loadTop100WithStats()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (page) => this.campaigns.set(page.items),
        error: () => this.campaigns.set([]),
      });
  }

  public formatMinutes(value: number | null | undefined): string {
    const minutes = Number(value || 0);
    return minutes.toFixed(2);
  }

  public shortenAudioName(name: string): string {
    const value = String(name || '').trim();
    if (value.length <= 28) return value;
    return `${value.slice(0, 25)}...`;
  }
}
