import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class CacheService {

  private cache = new Map<string, unknown>();

  public get<T>(key: string): T | null {
    return this.cache.has(key) ? (this.cache.get(key) as T) : null;
  }

  public set<T>(key: string, data: T): void {
    this.cache.set(key, data as unknown);
  }

  public has(key: string): boolean {
    return this.cache.has(key);
  }

  public invalidate(key: string | RegExp): void {
    if (typeof key === 'string') {
      this.cache.delete(key);
    } else {
      Array.from(this.cache.keys()).forEach((cacheKey) => {
        if(key.test(cacheKey)) {
          this.cache.delete(cacheKey);
        }
      });
    }
  }

  public clear(): void {
    this.cache.clear();
  }

  public static getPaginateKey(resource: string, page: number, pageSize: number, search?: string): string {
    const searchPart = search ? `_${search}` : '';
    return `${resource}_page${page}_size${pageSize}${searchPart}`;
  }

  public static getPaginateKeyV2(resource: string, page: number, pageSize: number, campaign_id?: string | null, search?: string): string {
    const searchPart = search ? `_${search}` : '';
    const campaignIdPart = campaign_id ? `_${campaign_id}` : '';
    return `${resource}_page${page}_size${pageSize}${searchPart}_${campaignIdPart}`;
  }

  public static getItemKey(resource: string, id: number): string {
    return `${resource}_item_${id}`;
  }

  public static getListKey(resource: string, search?: string): string {
    const searchPart = search ? `_${search}` : '';
    return `${resource}_list${searchPart}`;
  }
}
