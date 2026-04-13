import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AudiosItem } from '@api/audios.interface';
import { AudiosService } from '@feactures/audios/services/audios.service';

@Component({
  selector: 'app-update-audio',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './update-audios.html',
})
export class UpdateAudios {
  private readonly _dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly _audiosService = inject(AudiosService);

  public readonly currentAudio = signal<AudiosItem | null>(null);
  public readonly audioName = signal<string>('');
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  public open(dto: AudiosItem): void {
    this.currentAudio.set(dto);
    this.audioName.set(dto.audio_name || '');
    this.error.set(null);
    this.loading.set(false);
    this._dialog().nativeElement.showModal();
  }

  public close(): void {
    this.currentAudio.set(null);
    this.audioName.set('');
    this.error.set(null);
    this.loading.set(false);
    this._dialog().nativeElement.close();
  }

  public save(): void {
    const current = this.currentAudio();
    const name = this.audioName().trim();

    if (!current) {
      return;
    }

    if (!name) {
      this.error.set('El nombre del audio es obligatorio');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this._audiosService.update(current.id, { audio_name: name }).subscribe({
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
