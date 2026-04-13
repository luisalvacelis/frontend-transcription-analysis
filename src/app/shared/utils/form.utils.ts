import { AbstractControl, FormGroup } from "@angular/forms";

type ErrorKey =
  | 'required'
  | 'minlength'
  | 'min'
  | 'duplicate'
  | 'email'
  | 'pattern'
  | 'passwordsNotEqual'
  | 'emailTaken';

export class FormUtils {

  static emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$';
  // static notOnlySpacesPattern = '^[a-zA-Z0-9]+$';
  static notOnlySpacesPattern = '^\\S+$';

  private static normalizePattern(pattern: string): string {
    return (pattern || '').trim();
  }

  private static patternMessage(error: unknown): string {
    const e = error as Record<string, any> | undefined;
    const req = this.normalizePattern(e && e['requiredPattern']);

    const patterns: Array<{ pattern: string; msg: string }> = [
      { pattern: this.normalizePattern(this.emailPattern), msg: 'Error: Correo electrónico no válido.' },
      { pattern: this.normalizePattern(this.notOnlySpacesPattern), msg: 'Error: No debe tener espacios.' },
    ];

    const found = patterns.find(x => x.pattern === req);
    return found?.msg ?? 'Error: Formato inválido.';
  }

  private static readonly ERROR_MESSAGES: Record<ErrorKey, string | ((error: unknown) => string)> = {
    required: 'Error: Campo requerido',
    minlength: (err: unknown) => {
      const ev = err as Record<string, any> | undefined;
      return `Error: Debe tener al menos ${ev?.['requiredLength']} caracteres.`;
    },
    min: (err: unknown) => {
      const ev = err as Record<string, any> | undefined;
      return `Error: Valor mínimo de ${ev?.['min']}`;
    },
    duplicate: 'Error: Valor ya existente en lista.',
    email: 'Error: Valor no es un correo electrónico.',
    pattern: (e: unknown) => this.patternMessage(e),
    passwordsNotEqual: 'Error: Las contraseñas no coinciden.',
    emailTaken: 'Error: Correo electrónico ya está siendo usado por otro usuario.',
  };

  static isValidField(form: FormGroup, fieldName: string): boolean | null {
    const control = form.controls[fieldName];
    return control ? !!control.errors && control.touched : null;
  }

  static getFieldError(form: FormGroup, fieldName: string): string | null {
    const control = form.controls[fieldName];
    return control ? this.getControlError(control) : null;
  }

  static getControlError(formControl: AbstractControl): string | null {
    const errors = formControl.errors as Record<string, any> | null;
    if (!errors) return null;

    for (const key of Object.keys(errors)) {
      const handler = this.ERROR_MESSAGES[key as ErrorKey];
      if (!handler) continue;
      return typeof handler === 'function' ? handler(errors[key]) : handler;
    }

    return null;
  }
}
