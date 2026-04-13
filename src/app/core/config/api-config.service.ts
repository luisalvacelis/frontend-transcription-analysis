import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiConfigService {

  private readonly _main = environment.url_api_main;

  public main(resource: string): string {
    if (!this._main) return resource;
    return `${this._main}${resource}`;
  }
}
