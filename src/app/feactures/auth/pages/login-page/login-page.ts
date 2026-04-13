import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@feactures/auth/services/auth.service';
import { FormUtils } from '@shared/utils/form.utils';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
})
export class LoginPage {

  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _fb = inject(FormBuilder);

  public readonly formUtils = FormUtils;
  public readonly showPassword = signal<boolean>(false);
  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string>('');
  public readonly loginForm = this._fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern(FormUtils.notOnlySpacesPattern)]],
  });

  public togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  public onSubmit(): void {
    this.error.set('');
    if(this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const username = (this.loginForm.get('username')?.value || '').trim();
    const password = this.loginForm.get('password')?.value || '';

    this.loading.set(true);

    this._authService.login({username, password}).subscribe((isAuthenticated) =>{
      if(isAuthenticated) {
        this._router.navigate(['/']);
        return;
      } else {
        this.error.set('Error: Credenciales inválidas.');
      }
      this.loading.set(false);;
    });
  }
}
