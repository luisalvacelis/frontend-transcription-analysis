import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PromptTemplateItem } from '@api/analysis.interface';
import { AnalysisService } from '@feactures/analysis/services/analysis.service';
import { PromptManager } from '@feactures/analysis/components/prompt-manager/prompt-manager';

@Component({
  selector: 'app-prompts-home',
  imports: [PromptManager],
  templateUrl: './prompts-home.html',
  styleUrl: './prompts-home.css',
})
export class PromptsHome {
  private readonly _analysisService = inject(AnalysisService);
  private readonly _destroyRef = inject(DestroyRef);

  public readonly prompts = signal<PromptTemplateItem[]>([]);
  public readonly newPromptName = signal<string>('');
  public readonly newPromptText = signal<string>('');
  public readonly promptMessage = signal<string>('');
  public readonly promptMessageType = signal<'error' | 'success' | ''>('');
  public readonly working = signal<boolean>(false);

  constructor() {
    this.refreshPrompts();
  }

  public refreshPrompts(): void {
    this._analysisService
      .listPrompts()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (items) => this.prompts.set(items),
        error: () => this.promptMessage.set('No se pudieron cargar prompts'),
      });
  }

  public createPrompt(): void {
    this.clearMessages();
    const name = this.newPromptName().trim();
    const promptText = this.newPromptText().trim();

    if (!name || promptText.length < 10) {
      this.promptMessage.set('Nombre y prompt son obligatorios (minimo 10 caracteres en prompt).');
      this.promptMessageType.set('error');
      return;
    }

    this.working.set(true);
    this._analysisService
      .createPrompt({ name, prompt_text: promptText })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this.promptMessage.set('Prompt registrado correctamente');
          this.promptMessageType.set('success');
          this.newPromptName.set('');
          this.newPromptText.set('');
          this.working.set(false);
          this.refreshPrompts();
        },
        error: (err) => {
          this.promptMessage.set(err?.error?.detail || 'No se pudo registrar prompt');
          this.promptMessageType.set('error');
          this.working.set(false);
        },
      });
  }

  public deletePrompt(promptId: string): void {
    this.clearMessages();
    this._analysisService
      .deletePrompt(promptId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this.promptMessage.set('Prompt eliminado');
          this.promptMessageType.set('success');
          this.refreshPrompts();
        },
        error: (err) => {
          this.promptMessage.set(err?.error?.detail || 'No se pudo eliminar prompt');
          this.promptMessageType.set('error');
        },
      });
  }

  private clearMessages(): void {
    this.promptMessage.set('');
    this.promptMessageType.set('');
  }
}