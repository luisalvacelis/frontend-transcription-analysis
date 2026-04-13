import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MetadataExtractionTypeItem, OutputFormatItem } from '@api/analysis.interface';

@Component({
  selector: 'app-format-manager',
  imports: [FormsModule],
  templateUrl: './format-manager.html',
})
export class FormatManager {
  @Input({ required: true }) formats: OutputFormatItem[] = [];
  @Input({ required: true }) newFormatName = '';
  @Input({ required: true }) newFormatFields = '';
  @Input({ required: true }) newFormatDescription = '';
  @Input({ required: true }) newFormatLayoutConfig = '';
  @Input({ required: true }) metadataExtractionTypes: MetadataExtractionTypeItem[] = [];
  @Input({ required: true }) selectedMetadataExtractionType = 'none';
  @Input({ required: true }) working = false;
  @Input() formatMessage = '';
  @Input() formatMessageType: 'error' | 'success' | '' = '';

  @Output() newFormatNameChange = new EventEmitter<string>();
  @Output() newFormatFieldsChange = new EventEmitter<string>();
  @Output() newFormatDescriptionChange = new EventEmitter<string>();
  @Output() newFormatLayoutConfigChange = new EventEmitter<string>();
  @Output() selectedMetadataExtractionTypeChange = new EventEmitter<string>();
  @Output() createFormat = new EventEmitter<void>();
  @Output() deleteFormat = new EventEmitter<string>();

  public getFormatSummary(format: OutputFormatItem): string {
    try {
      const parsed = JSON.parse(format.fields_json) as {
        fields?: unknown;
        layout?: {
          observation_groups?: unknown[];
          metadata_columns?: unknown[];
          fixed_columns?: unknown[];
          metadata_extraction_type?: unknown;
          transcription?: Record<string, unknown>;
        };
      };

      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const fields = Array.isArray(parsed.fields)
          ? parsed.fields.map((value) => String(value).trim()).filter(Boolean)
          : [];
        const groups = Array.isArray(parsed.layout?.observation_groups)
          ? parsed.layout?.observation_groups.length
          : 0;
        const metadataColumns = Array.isArray(parsed.layout?.metadata_columns)
          ? parsed.layout?.metadata_columns.length
          : Array.isArray(parsed.layout?.fixed_columns)
            ? parsed.layout?.fixed_columns.length
            : 0;
        const hasTranscription = Boolean(parsed.layout?.transcription);
        const chunkSize = parsed.layout?.transcription?.['chunk_size'];
        const extractionType = String(parsed.layout?.metadata_extraction_type || '').trim();

        const parts = [`Campos: ${fields.join(', ') || 'sin campos'}`];
        if (metadataColumns > 0) {
          parts.push(`Metadatos: ${metadataColumns}`);
        }
        if (extractionType && extractionType !== 'none') {
          parts.push(`Extraccion: ${extractionType}`);
        }
        if (groups > 0) {
          parts.push(`Rangos: ${groups}`);
        }
        if (hasTranscription) {
          parts.push(
            `Transcripcion: activa${typeof chunkSize === 'number' ? ` (${chunkSize})` : ''}`,
          );
        }
        return parts.join(' | ');
      }

      if (Array.isArray(parsed)) {
        return `Campos: ${parsed
          .map((value) => String(value).trim())
          .filter(Boolean)
          .join(', ')}`;
      }
    } catch {
      // Fallback al texto crudo cuando el contenido no es JSON valido.
    }

    return format.fields_json;
  }
}
