import { CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CampaignsItem, CampaignWithStatsItem } from '@api/campaigns.interface';
import { PageMeta } from '@api/page.interface';
import { CampaignsService } from '@feactures/campaigns/services/campaigns.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { AddCampaign } from '@feactures/campaigns/components/add-campaign/add-campaign';
import { DeleteCampaign } from '@feactures/campaigns/components/delete-campaign/delete-campaign';
import { UpdateCampaign } from '@feactures/campaigns/components/update-campaign/update-campaign';

@Component({
  selector: 'app-table-campaigns',
  imports: [CurrencyPipe, AddCampaign, DeleteCampaign, UpdateCampaign],
  templateUrl: './table-campaigns.html',
})
export class TableCampaigns {
  private readonly _addCampaignModal = viewChild.required(AddCampaign);
  private readonly _deleteCampaignModal = viewChild.required(DeleteCampaign);
  private readonly _updateCampaignModal = viewChild.required(UpdateCampaign);

  private readonly _campaignsService = inject(CampaignsService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _searchSubject = new Subject<string>();

  public readonly page = signal<number>(1);
  public readonly pageSize = signal<number>(10);
  public readonly searchTerm = signal<string>('');
  public readonly refreshCounter = signal<number>(0);
  public readonly campaigns = signal<CampaignWithStatsItem[]>([]);
  public readonly meta = signal<PageMeta | null>(null);
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  constructor() {
    effect((onCleanup) => {
      const search = this.searchTerm();
      const page = this.page();
      const page_size = this.pageSize();
      const _ = this.refreshCounter();

      this.loading.set(true);
      this.error.set(null);

      const sub = this._campaignsService
        .loadWithStats({ page, page_size, search })
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (data) => {
            this.campaigns.set(data.items);
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

      this._campaignsService.refresh$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
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

  public refreshTable(): void {
    this._campaignsService.invalidateCache();
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

  public addCampaign(): void {
    this._addCampaignModal().open();
  }

  public updateCampaign(dto: CampaignWithStatsItem): void {
    this._updateCampaignModal().open(dto as unknown as CampaignsItem);
  }

  public deleteCampaign(dto: CampaignWithStatsItem): void {
    this._deleteCampaignModal().open(dto as unknown as CampaignsItem);
  }
}
