import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CampaignsItem } from '@api/campaigns.interface';
import { CampaignsService } from '@feactures/campaigns/services/campaigns.service';
import { FormUtils } from '@shared/utils/form.utils';

@Component({
  selector: 'app-update-campaign',
  imports: [ReactiveFormsModule],
  templateUrl: './update-campaign.html',
})
export class UpdateCampaign {

  private readonly _dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly _campaignsService = inject(CampaignsService);
  private readonly _fb = inject(FormBuilder);

  public readonly currentCampaign = signal<CampaignsItem | null>(null);
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);
  public readonly formUtils = FormUtils;
  public readonly campaignForm = this._fb.group({
    campaign_name: ['', [Validators.required]],
    description: ['']
  });

  public onSubmit(): void {
    const current = this.currentCampaign();
    if(!current) return;

    this.loading.set(true);

    const campaign_name = (this.campaignForm.get('campaign_name')?.value || '').trim();
    const description = (this.campaignForm.get('description')?.value || '').trim();

    this._campaignsService.update(current.id, {campaign_name, description}).subscribe({
      next: () => {
        this.loading.set(false);
        this.close();
      },
      error: (error) => {
        this.error.set(`Error: ${error.message || 'Unknown error'}`);
        this.loading.set(false);
      }
    });
  }

  public open(dto: CampaignsItem): void {
    this.currentCampaign.set(dto);
    this.campaignForm.patchValue({
      campaign_name: dto.campaign_name,
      description: dto.description,
    });
    this._dialog().nativeElement.showModal();
  }

  public close(): void {
    this.campaignForm.reset();
    this.currentCampaign.set(null);
    this._dialog().nativeElement.close();
  }
}
