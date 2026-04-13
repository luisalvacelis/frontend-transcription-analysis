import { DatePipe } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AudiosItem } from '@api/audios.interface';
import { CampaignsItem } from '@api/campaigns.interface';
import { PageMeta } from '@api/page.interface';
import { AudiosService } from '@feactures/audios/services/audios.service';
import { CampaignsService } from '@feactures/campaigns/services/campaigns.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { AddAudios } from '../add-audios/add-audios';
import { DeleteAudios } from '../delete-audios/delete-audios';
import { UpdateAudios } from '../update-audios/update-audios';

@Component({
  selector: 'app-table-audios',
  imports: [DatePipe, AddAudios, DeleteAudios, UpdateAudios],
  templateUrl: './table-audios.html',
  styles: [
    `
      .campaign-select,
      .campaign-select option {
        background-color: hsl(var(--b1));
        color: hsl(var(--bc));
      }
    `,
  ],
})
export class TableAudios {
  private readonly _addAudiosModal = viewChild.required(AddAudios);
  private readonly _deleteAudiosModal = viewChild.required(DeleteAudios);
  private readonly _updateAudiosModal = viewChild.required(UpdateAudios);

  private readonly _audiosService = inject(AudiosService);
  private readonly _campaignsService = inject(CampaignsService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _searchSubject = new Subject<string>();

  public readonly page = signal<number>(1);
  public readonly pageSize = signal<number>(10);
  public readonly campaignIdTerm = signal<string | null>(null);
  public readonly campaigns = signal<CampaignsItem[]>([]);
  public readonly searchTerm = signal<string>('');
  public readonly refreshCounter = signal<number>(0);
  public readonly audios = signal<AudiosItem[]>([]);
  public readonly meta = signal<PageMeta | null>(null);
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  constructor() {
    this._campaignsService
      .loadTop100()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (data) => this.campaigns.set(data.items),
        error: () => this.campaigns.set([]),
      });

    effect((onCleanup) => {
      const page = this.page();
      const page_size = this.pageSize();
      const campaign_id = this.campaignIdTerm();
      const search = this.searchTerm();
      const _ = this.refreshCounter();

      this.loading.set(true);
      this.error.set(null);

      const sub = this._audiosService
        .load({ page, page_size, campaign_id, search })
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (data) => {
            this.audios.set(data.items);
            this.meta.set(data.meta);
            this.loading.set(false);
          },
          error: (error) => {
            this.error.set(`Error: ${error.message || 'Unknown error'}`);
            this.loading.set(false);
          },
        });

      onCleanup(() => sub.unsubscribe());

      this._searchSubject
        .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this._destroyRef))
        .subscribe((term) => {
          this.searchTerm.set(term);
          this.page.set(1);
        });

      this._audiosService.refresh$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
        this.refreshCounter.set(this.refreshCounter() + 1);
      });
    });
  }

  public onSearchChange(term: string): void {
    this._searchSubject.next(term);
  }

  public clearSearch(): void {
    this.searchTerm.set('');
    this.page.set(1);
  }

  public onCampaignChange(campaignId: string): void {
    this.campaignIdTerm.set(campaignId || null);
    this.page.set(1);
  }

  public clearCampaign(): void {
    this.campaignIdTerm.set(null);
    this.page.set(1);
  }

  public refreshTable(): void {
    this.refreshCounter.set(this.refreshCounter() + 1);
  }

  public nextPage(): void {
    const m = this.meta();
    if (!m) return;
    if (this.page() < m.pages) this.page.set(this.page() + 1);
  }

  public prevPage(): void {
    if (this.page() > 1) this.page.set(this.page() - 1);
  }

  public setPageSize(pageSize: number): void {
    this.pageSize.set(pageSize);
    this.page.set(1);
  }

  public addAudio(): void {
    this._addAudiosModal().open(this.campaignIdTerm() ?? undefined);
  }

  public updateAudio(dto: AudiosItem): void {
    this._updateAudiosModal().open(dto);
  }

  public deleteAudio(dto: AudiosItem): void {
    this._deleteAudiosModal().open(dto);
  }
}
