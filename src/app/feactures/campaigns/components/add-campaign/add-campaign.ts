import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CampaignsService } from '@feactures/campaigns/services/campaigns.service';
import { FormUtils } from '@shared/utils/form.utils';

@Component({
  selector: 'app-add-campaign',
  imports: [ReactiveFormsModule],
  templateUrl: './add-campaign.html',
})
export class AddCampaign {

  private readonly _dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly _campaignsService = inject(CampaignsService);
  private readonly _fb = inject(FormBuilder);

  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);
  public readonly formUtils = FormUtils;
  public readonly campaignForm = this._fb.group({
    campaign_name: ['', [Validators.required]],
    description: ['']
  });

  public onSubmit(): void {
    this.error.set('');
    if(this.campaignForm.invalid) {
      this.campaignForm.markAllAsTouched();
      return;
    }

    const campaign_name = (this.campaignForm.get('campaign_name')?.value || '').trim();
    const description = (this.campaignForm.get('description')?.value || '').trim();

    this.loading.set(true);

    this._campaignsService.create({campaign_name, description}).subscribe({
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

  public open(): void {
    this._dialog().nativeElement.showModal();
  }

  public close(): void {
    this.campaignForm.reset();
    this.error.set(null);
    this.loading.set(false);
    this._dialog().nativeElement.close();
  }

}
