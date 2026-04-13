import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthLogin, AuthMe, AuthResponse } from '@api/auth.interface';
import { TokenStorageService } from '@core/storage/token-storage.service';
import { ApiConfigService } from '@core/config/api-config.service';

import { catchError, map, Observable, of, shareReplay } from 'rxjs';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';

@Injectable({providedIn: 'root'})
export class AuthService {

  private readonly _http = inject(HttpClient);
  private readonly _api = inject(ApiConfigService);
  private readonly _authStatus = signal<AuthStatus>('checking');
  private readonly _authMe = signal<AuthMe | null>(null);
  private readonly _tokenService = new TokenStorageService();
  private readonly _token = signal<string | null>(this._tokenService.get());
  private meCache$: Observable<AuthMe | null> | null = null;

  public readonly authMe = computed(() => this._authMe());
  public readonly token = computed(() => this._token());
  public readonly authStatus = computed<AuthStatus>(() => {
    if(this._authStatus() === 'checking') return 'checking';
    if(this._authStatus() === 'authenticated') return 'authenticated';
    return 'not-authenticated';
  });

  public login(dto: AuthLogin): Observable<boolean> {
    const url = this._api.main('/auth/login');
    return this._http.post(url, dto).pipe(
      map((resp) => this.handleAuthSuccess(resp as AuthResponse)),
      catchError(() => this.handleAuthError())
    );
  }

  public logout(): void {
    this.clearSession();
  }

  public me(): Observable<AuthMe | null> {
    const token = this._tokenService.get();
    if(!token) {
      this.meCache$ = null;
      this._authStatus.set('not-authenticated');
      this._token.set(null);
      return of(null);
    }

    if(this.meCache$) return this.meCache$;

    const url = this._api.main('/auth/me');
    this.meCache$ = this._http.get<AuthMe>(url).pipe(
      map((resp) => {
        this._authStatus.set('authenticated');
        this._token.set(this._tokenService.get());
        this._authMe.set(resp);
        return resp;
      }),
      catchError(() => {
        this.handleAuthError();
        return of(null);
      }),
      shareReplay(1)
    );
    return this.meCache$;
  }

  public checkSession(): Observable<boolean> {
    return this.me().pipe(map(resp => !!resp));
  }

  public clearSessionState(): void {
    this.meCache$ = null;
    this.clearSession();
  }

  private clearSession(): void {
    this._authStatus.set('not-authenticated');
    this._tokenService.clear();
    this._token.set(null);
    this._authMe.set(null);
  }

  private handleAuthSuccess(resp: AuthResponse): boolean {
    this._authStatus.set('authenticated');
    this._token.set(resp.access_token);
    this._tokenService.set(resp.access_token);
    return true;
  }

  private handleAuthError(): Observable<boolean> {
    this.clearSession();
    return of(false);
  }
}
