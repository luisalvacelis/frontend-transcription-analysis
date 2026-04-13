import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { CampaignsItem } from '@api/campaigns.interface';
import { CampaignsService } from '@feactures/campaigns/services/campaigns.service';

@Component({
  selector: 'app-delete-campaign',
  imports: [],
  templateUrl: './delete-campaign.html',
})
export class DeleteCampaign {

  private readonly _dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly _campaignsService = inject(CampaignsService);

  public readonly currentCampaign = signal<CampaignsItem | null>(null);
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  public open(dto: CampaignsItem): void {
    this.currentCampaign.set(dto);
    this._dialog().nativeElement.showModal();
  }

  public close(): void {
    this.currentCampaign.set(null);
    this._dialog().nativeElement.close();
  }

  public delete(): void {
    const current = this.currentCampaign();
    if(!current) return;

    this.loading.set(true);

    this._campaignsService.delete(current.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.close();
      },
      error: (err) => {
        this.error.set(`Error: ${err.message || 'Unknown error'}`);
        this.loading.set(false);
      }
    });
  }
}
