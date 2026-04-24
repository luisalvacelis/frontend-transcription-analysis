import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PromptTemplateItem } from '@api/analysis.interface';

@Component({
  selector: 'app-prompt-manager',
  imports: [FormsModule],
  templateUrl: './prompt-manager.html',
})
export class PromptManager {
  private readonly _protectedKeywords = ['vector store', 'vector_store', 'scotiabank'];

  @Input({ required: true }) prompts: PromptTemplateItem[] = [];
  @Input({ required: true }) newPromptName = '';
  @Input({ required: true }) newPromptText = '';
  @Input({ required: true }) working = false;
  @Input() promptMessage = '';
  @Input() promptMessageType: 'error' | 'success' | '' = '';
  @Input() editingPromptId = '';

  @Output() newPromptNameChange = new EventEmitter<string>();
  @Output() newPromptTextChange = new EventEmitter<string>();
  @Output() createPrompt = new EventEmitter<void>();
  @Output() refreshPrompts = new EventEmitter<void>();
  @Output() editPrompt = new EventEmitter<string>();
  @Output() deletePrompt = new EventEmitter<string>();

  public isProtectedPrompt(name: string): boolean {
    const low = (name || '').trim().toLowerCase();
    return this._protectedKeywords.some((keyword) => low.includes(keyword));
  }

  public isEditingPrompt(promptId: string): boolean {
    return this.editingPromptId === promptId;
  }
}
