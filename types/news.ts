export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  dateOriginal: string;
  source: {
    name: string;
  };
  category: string[];
}

export interface PaginatedNewsResponse {
  news: NewsArticle[];
  totalPages: number;
  currentPage: number;
  totalArticles: number;
}
