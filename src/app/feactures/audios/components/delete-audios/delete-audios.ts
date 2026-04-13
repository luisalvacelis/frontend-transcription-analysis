import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { AudiosItem } from '@api/audios.interface';
import { AudiosService } from '@feactures/audios/services/audios.service';

@Component({
  selector: 'app-delete-audio',
  standalone: true,
  imports: [],
  templateUrl: './delete-audios.html',
})
export class DeleteAudios {
  private readonly _dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly _audiosService = inject(AudiosService);

  public readonly currentAudio = signal<AudiosItem | null>(null);
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  public open(dto: AudiosItem): void {
    this.currentAudio.set(dto);
    this.error.set(null);
    this._dialog().nativeElement.showModal();
  }

  public close(): void {
    this.currentAudio.set(null);
    this.error.set(null);
    this.loading.set(false);
    this._dialog().nativeElement.close();
  }

  public delete(): void {
    const current = this.currentAudio();
    if (!current) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this._audiosService.delete(current.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.close();
      },
      error: (err) => {
        this.error.set(`Error: ${err?.error?.detail || err?.message || 'Unknown error'}`);
        this.loading.set(false);
      },
    });
  }
}
