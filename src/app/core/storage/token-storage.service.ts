import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class TokenStorageService {

  private readonly _key =  'token';
  private readonly _storage = sessionStorage;

  public get(): string | null {
    return this._storage.getItem(this._key);
  }

  public set(token: string): void {
    this._storage.setItem(this._key, token);
  }

  public clear(): void {
    this._storage.removeItem(this._key);
  }

  public hasToken(): boolean {
    return !!this.get();
  }
}
