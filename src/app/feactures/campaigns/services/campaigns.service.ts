import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  CampaignsLoad,
  CampaignsItem,
  CampaignsCreate,
  CampaignsDeleteResponse,
  CampaignsUpdate,
  CampaignsStats,
  CampaignWithStatsItem,
} from '@api/campaigns.interface';
import { Page } from '@api/page.interface';
import { CacheService } from '@core/cache/cache.service';
import { ApiConfigService } from '@core/config/api-config.service';
import { map, Observable, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CampaignsService {
  private readonly _http = inject(HttpClient);
  private readonly _api = inject(ApiConfigService);
  private readonly _cache = inject(CacheService);
  private readonly _refreshSubject = new Subject<void>();

  public readonly refresh$ = this._refreshSubject.asObservable();

  public load(dto: CampaignsLoad): Observable<Page<CampaignsItem>> {
    const { page, page_size, search } = dto;
    const cacheKey = CacheService.getPaginateKey('campaigns', page, page_size, search);
    const cached = this._cache.get<Page<CampaignsItem>>(cacheKey);
    if (cached) {
      return new Observable((obs) => {
        obs.next(cached);
        obs.complete();
      });
    }

    let url = this._api.main(`/campaigns/?page=${page}&page_size=${page_size}`);
    if (search && search.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    return this._http
      .get<Page<CampaignsItem>>(url)
      .pipe(tap((data) => this._cache.set(cacheKey, data)));
  }

  public loadTop100(): Observable<Page<CampaignsItem>> {
    const cacheKey = CacheService.getPaginateKey('campaigns', 1, 100, '');
    const cached = this._cache.get<Page<CampaignsItem>>(cacheKey);
    if (cached) {
      return new Observable((obs) => {
        obs.next(cached);
        obs.complete();
      });
    }

    let url = this._api.main(`/campaigns/?page=1&page_size=100`);
    return this._http
      .get<Page<CampaignsItem>>(url)
      .pipe(tap((data) => this._cache.set(cacheKey, data)));
  }

  public loadWithStats(dto: CampaignsLoad): Observable<Page<CampaignWithStatsItem>> {
    const { page, page_size, search } = dto;
    const cacheKey = CacheService.getPaginateKey('campaigns_with_stats', page, page_size, search);
    const cached = this._cache.get<Page<CampaignWithStatsItem>>(cacheKey);
    if (cached) {
      return new Observable((obs) => {
        obs.next(cached);
        obs.complete();
      });
    }

    let url = this._api.main(`/campaigns/with-stats?page=${page}&page_size=${page_size}`);
    if (search && search.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    return this._http
      .get<Page<CampaignWithStatsItem>>(url)
      .pipe(tap((data) => this._cache.set(cacheKey, data)));
  }

  public loadTop100WithStats(): Observable<Page<CampaignWithStatsItem>> {
    return this.loadWithStats({ page: 1, page_size: 100 });
  }

  public loadCampaignStats(campaign_id: string): Observable<CampaignsStats> {
    const url = this._api.main(`/campaigns/${campaign_id}`);
    return this._http.get<CampaignsStats>(url);
  }

  public create(dto: CampaignsCreate): Observable<CampaignsItem> {
    const url = this._api.main('/campaigns');
    return this._http
      .post<CampaignsItem>(url, dto)
      .pipe(tap(() => this.invalidateCampaignsCache()));
  }

  public delete(campaign_id: string): Observable<CampaignsDeleteResponse> {
    const url = this._api.main(`/campaigns/${campaign_id}`);
    return this._http
      .delete<CampaignsDeleteResponse>(url)
      .pipe(tap(() => this.invalidateCampaignsCache()));
  }

  public update(campaign_id: string, dto: CampaignsUpdate): Observable<CampaignsItem> {
    const url = this._api.main(`/campaigns/${campaign_id}`);
    return this._http.put<CampaignsItem>(url, dto).pipe(tap(() => this.invalidateCampaignsCache()));
  }

  public invalidateCache(): void {
    this._cache.invalidate(/^campaigns_/);
  }

  private invalidateCampaignsCache(): void {
    this._cache.invalidate(/^campaigns_/);
    this._refreshSubject.next();
  }
}
