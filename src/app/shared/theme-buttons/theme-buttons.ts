import { Component, inject } from '@angular/core';
import { Theme, ThemeService } from '@core/theme/theme.service';

@Component({
  selector: 'app-theme-buttons',
  templateUrl: './theme-buttons.html',
})
export class ThemeButtons {

  private readonly _theme = inject(ThemeService);
  public readonly theme = this._theme.theme;

  public setTheme(theme: Theme): void {
    this._theme.setTheme(theme);
  }

  public getTheme(): Theme {
    return this.theme();
  }
}
