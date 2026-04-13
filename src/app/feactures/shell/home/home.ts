import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@feactures/auth/services/auth.service';
import { Loading } from '@shared/loading/loading';
import { Footer } from "@shared/footer/footer";
import { Navbar } from "@shared/navbar/navbar";
import { Sidebar } from "@shared/sidebar/sidebar";

@Component({
  selector: 'app-home',
  imports: [Loading, RouterOutlet, Footer, Navbar, Sidebar],
  templateUrl: './home.html',
})
export class Home {

  private readonly _authService = inject(AuthService);

  public readonly authStatus = this._authService.authStatus;
}
