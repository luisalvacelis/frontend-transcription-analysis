import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dracula';

@Injectable({providedIn: 'root'})
export class ThemeService {

  private readonly _theme = signal<Theme>('light');
  public readonly theme = this._theme.asReadonly();

  public init(): void {
    const saved = localStorage.getItem('theme') as Theme | null;
    let prefersLight = false;
    if(typeof window !== 'undefined') {
      const mm = (window as any).matchMedia;
      if(typeof mm === 'function') {
        prefersLight = mm('(prefers-color-scheme: light)').matches;
      }
    }
    const fallback = prefersLight ? 'dracula' : 'light';
    this.setTheme(saved ?? fallback);
  }

  public setTheme(theme: Theme): void {
    this._theme.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
}
