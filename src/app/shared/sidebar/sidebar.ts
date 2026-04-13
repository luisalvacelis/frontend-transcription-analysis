import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@feactures/auth/services/auth.service';

type MenuItem = {
  label: string;
  route: string;
  icon: 'dashboard' | 'campaigns' | 'audios' | 'audios_analysis';
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, DatePipe],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private readonly _authService = inject(AuthService);
  private readonly _collapsed = signal<boolean>(false);

  public readonly me = this._authService.authMe;
  public readonly menu = signal<MenuGroup[]>([
    {
      title: 'PRINCIPAL',
      items: [
        {
          label: 'Inicio',
          route: '/dashboard',
          icon: 'dashboard',
        },
      ],
    },
    {
      title: 'GESTIÓN',
      items: [
        {
          label: 'Campañas',
          route: '/campaigns',
          icon: 'campaigns',
        },
        {
          label: 'Audios',
          route: '/audios',
          icon: 'audios',
        },
        {
          label: 'Centro Analisis',
          route: '/audios_analysis',
          icon: 'audios_analysis',
        },
      ],
    },
  ]);

  public readonly userInitials = computed(() => {
    const name = this.me()?.username ?? '';
    if (!name) return '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s: string) => s[0])
      .join('')
      .toUpperCase();
  });

  public toggleCollapsed(): void {
    this._collapsed.update((v) => !v);
  }

  public getCollapsed(): boolean {
    return this._collapsed();
  }
}
