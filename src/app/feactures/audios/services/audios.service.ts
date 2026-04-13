import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Page } from '@api/page.interface';
import { CacheService } from '@core/cache/cache.service';
import { ApiConfigService } from '@core/config/api-config.service';
import { Observable, Subject, tap } from 'rxjs';
import {
  AudiosDeleteResponse,
  AudiosItem,
  AudiosLoad,
  AudiosUpdate,
  AudiosUpdateResponse,
  AudiosUpload,
  AudiosUploadResponse,
  AudiosUploads,
  AudiosUploadsResponse,
  AudiosStatsSummary,
} from '@api/audios.interface';

@Injectable({ providedIn: 'root' })
export class AudiosService {
  private readonly _http = inject(HttpClient);
  private readonly _api = inject(ApiConfigService);
  private readonly _cache = inject(CacheService);
  private readonly _refreshSubject = new Subject<void>();

  public readonly refresh$ = this._refreshSubject.asObservable();

  public load(dto: AudiosLoad): Observable<Page<AudiosItem>> {
    const { page, page_size, campaign_id, search } = dto;
    const cacheKey = CacheService.getPaginateKeyV2('audios', page, page_size, campaign_id, search);
    const cached = this._cache.get<Page<AudiosItem>>(cacheKey);
    if (cached) {
      return new Observable((obs) => {
        obs.next(cached);
        obs.complete();
      });
    }

    let url = this._api.main(`/audios/?page=${page}&page_size=${page_size}`);
    if (campaign_id && campaign_id.trim()) {
      url += `&campaign_id=${encodeURIComponent(campaign_id.trim())}`;
    }
    if (search && search.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    return this._http
      .get<Page<AudiosItem>>(url)
      .pipe(tap((data) => this._cache.set(cacheKey, data)));
  }

  public uploadAudios(dto: AudiosUpload): Observable<AudiosUploadResponse> {
    const url = this._api.main('/audios/upload');
    const formData = new FormData();
    formData.append('file', dto.file);
    formData.append('campaign_id', dto.campaign_id);
    return this._http
      .post<AudiosUploadResponse>(url, formData)
      .pipe(tap(() => this.invalidateAudiosCache()));
  }

  public uploadMultiAudios(dto: AudiosUploads): Observable<AudiosUploadsResponse> {
    const url = this._api.main('/audios/upload-multiple');
    const formData = new FormData();
    dto.files.forEach((file) => formData.append('files', file));
    formData.append('campaign_id', dto.campaign_id);
    return this._http
      .post<AudiosUploadsResponse>(url, formData)
      .pipe(tap(() => this.invalidateAudiosCache()));
  }

  public delete(audio_id: string): Observable<AudiosDeleteResponse> {
    const url = this._api.main(`/audios/${audio_id}`);
    return this._http
      .delete<AudiosDeleteResponse>(url)
      .pipe(tap(() => this.invalidateAudiosCache()));
  }

  public update(audio_id: string, dto: AudiosUpdate): Observable<AudiosUpdateResponse> {
    const url = this._api.main(`/audios/${audio_id}`);
    return this._http
      .put<AudiosUpdateResponse>(url, dto)
      .pipe(tap(() => this.invalidateAudiosCache()));
  }

  public getStatsSummary(): Observable<AudiosStatsSummary> {
    return this._http.get<AudiosStatsSummary>(this._api.main('/audios/stats/summary'));
  }

  private invalidateAudiosCache(): void {
    this._cache.invalidate(/^audios_/);
    this._refreshSubject.next();
  }
}
