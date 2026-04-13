import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CampaignsItem } from '@api/campaigns.interface';
import { AudiosService } from '@feactures/audios/services/audios.service';
import { CampaignsService } from '@feactures/campaigns/services/campaigns.service';
import { FormUtils } from '@shared/utils/form.utils';

@Component({
  selector: 'app-add-audios',
  imports: [ReactiveFormsModule],
  templateUrl: './add-audios.html',
})
export class AddAudios {
  private readonly _dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly _fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  private readonly _audiosService = inject(AudiosService);
  private readonly _campaignsService = inject(CampaignsService);
  private readonly _fb = inject(FormBuilder);

  public readonly campaigns = signal<CampaignsItem[]>([]);
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);
  public readonly formUtils = FormUtils;
  public selectedFiles: File[] = [];
  public isDragging = false;
  public readonly audiosForm: FormGroup = this._fb.group({
    campaign_id: ['', [Validators.required]],
    files: [null as File[] | null, [Validators.required]],
  });

  public open(defaultCampaignId?: string): void {
    this.loading.set(true);
    this._campaignsService.loadTop100().subscribe({
      next: (data) => {
        this.campaigns.set(data.items);
        if (defaultCampaignId) {
          this.audiosForm.patchValue({ campaign_id: defaultCampaignId });
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(`Error: ${error.message || 'Unknown error'}`);
        this.loading.set(false);
      },
    });
    this._dialog().nativeElement.showModal();
  }

  public close(): void {
    this._dialog().nativeElement.close();
    this.audiosForm.reset();
    this.selectedFiles = [];
    if (this._fileInput) {
      this._fileInput().nativeElement.innerText = '';
    }
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  public onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]): void {
    const validFiles = files.filter(
      (file) => file.type.startsWith('audio/') || file.type === 'video/mp4',
    );

    this.selectedFiles = [...this.selectedFiles, ...validFiles];
    this.audiosForm.patchValue({ files: this.selectedFiles });
    this.audiosForm.get('files')?.markAsTouched();
  }

  public removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    if (this.selectedFiles.length === 0) {
      this.audiosForm.patchValue({ files: null });
    }
  }

  public onSubmit(): void {
    this.error.set('');
    if (this.audiosForm.invalid) {
      this.audiosForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const { campaign_id } = this.audiosForm.value;
    if (this.selectedFiles.length === 1) {
      const file = this.selectedFiles[0];
      this._audiosService.uploadAudios({ file, campaign_id }).subscribe({
        next: () => {
          this.loading.set(false);
          this.close();
        },
        error: (error) => {
          this.error.set(`Error: ${error.message || 'Unknown error'}`);
          this.loading.set(false);
        },
      });
    } else {
      const files = this.selectedFiles;
      this._audiosService.uploadMultiAudios({ files, campaign_id }).subscribe({
        next: () => {
          this.loading.set(false);
          this.close();
        },
        error: (error) => {
          this.error.set(`Error: ${error.message || 'Unknown error'}`);
          this.loading.set(false);
        },
      });
    }
  }
}
