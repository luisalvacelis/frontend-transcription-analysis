export type PageMeta = {
  page: number;
  page_size: number;
  total: number;
  pages: number;
}

export type Page<TItem> = {
  items: TItem[];
  meta: PageMeta;
}
