import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@feactures/auth/services/auth.service';
import { ThemeButtons } from "@shared/theme-buttons/theme-buttons";

@Component({
  selector: 'app-navbar',
  imports: [ThemeButtons],
  templateUrl: './navbar.html',
})
export class Navbar {

  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  public readonly loading = signal<boolean>(false);

  public isLoggedIn(): boolean {
    return this._authService.authStatus() === 'authenticated';
  }

  public logout(): void {
    this.loading.set(true);
    this._authService.logout();
    this.loading.set(false);
    this._router.navigate(['/auth/login']);
  }
}
