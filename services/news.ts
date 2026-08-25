import { PaginatedNewsResponse, NewsArticle } from "../types/news";

export async function getNewsPaginated(
  page: number = 1,
  limit: number = 12,
  category: string = "all",
  country: string = "us",
): Promise<PaginatedNewsResponse> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (category !== "all") {
      params.append("category", category);
    }

    const baseUrl =
      process.env.EXPO_PUBLIC_API_BASE_URL ||
      "https://readhub-backend.onrender.com/api";

    const endpoint =
      country === "in"
        ? `${baseUrl}/news/newIn/pagination`
        : `${baseUrl}/news/new/pagination`;

    const res = await fetch(`${endpoint}?${params.toString()}`);

    if (!res.ok) {
      let errorMessage = `Failed to fetch news for ${country}`;
      try {
        const errorBody = await res.text();
        errorMessage += `: ${errorBody}`;
      } catch {
        // ignore
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();
    const rawArticles = Array.isArray(data?.articles) ? data.articles : [];

    const formattedNews: NewsArticle[] = rawArticles.map((article: any) => ({
      id: (article._id || article.id || Math.random()).toString(),
      title: article.title || "No Title",
      description: article.description || "",
      content: article.content || "",
      url: article.url || "",
      urlToImage: article.urlToImage || null,
      publishedAt: article.publishedAt || new Date().toISOString(),
      dateOriginal: article.publishedAt || new Date().toISOString(),
      source:
        typeof article.source === "object" && article.source !== null
          ? article.source
          : { name: article.source || "Unknown" },
      category: Array.isArray(article.category)
        ? article.category
        : typeof article.category === "string"
          ? [article.category]
          : [],
    }));

    return {
      news: formattedNews,
      totalPages: data.totalPages ?? 0,
      currentPage: data.currentPage ?? 1,
      totalArticles: data.totalArticles ?? 0,
    };
  } catch (error) {
    console.error("Error fetching paginated news:", error);
    return {
      news: [],
      totalPages: 0,
      currentPage: 1,
      totalArticles: 0,
    };
  }
}

export async function fetchLatestNews(country: "us" | "in"): Promise<boolean> {
  try {
    const baseUrl =
      process.env.EXPO_PUBLIC_API_BASE_URL ||
      "https://readhub-backend.onrender.com/api";

    const endpoint = `${baseUrl}/news/fetch-categories/${country}`;

    const res = await fetch(endpoint, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error(`Failed to refresh latest news for ${country}`);
    }

    return true;
  } catch (error) {
    console.error("Error refreshing latest news:", error);
    return false;
  }
}

export async function searchNews(
  query: string,
  country: string = "us",
  page: number = 1,
  limit: number = 12,
): Promise<PaginatedNewsResponse> {
  try {
    const params = new URLSearchParams({
      q: query,
      page: String(page),
      limit: String(limit),
    });

    const baseUrl =
      process.env.EXPO_PUBLIC_API_BASE_URL ||
      "https://readhub-backend.onrender.com/api";

    const endpoint =
      country === "in"
        ? `${baseUrl}/news/search/in`
        : `${baseUrl}/news/search/us`;

    const res = await fetch(`${endpoint}?${params.toString()}`);

    if (!res.ok) {
      throw new Error(`Failed to search news for ${country}`);
    }

    const data = await res.json();
    const rawArticles = Array.isArray(data?.articles) ? data.articles : [];

    const formattedNews: NewsArticle[] = rawArticles.map((article: any) => ({
      id: (article._id || article.id || Math.random()).toString(),
      title: article.title || "No Title",
      description: article.description || "",
      content: article.content || "",
      url: article.url || "",
      urlToImage: article.urlToImage || null,
      publishedAt: article.publishedAt || new Date().toISOString(),
      dateOriginal: article.publishedAt || new Date().toISOString(),
      source:
        typeof article.source === "object" && article.source !== null
          ? article.source
          : { name: article.source || "Unknown" },
      category: Array.isArray(article.category)
        ? article.category
        : typeof article.category === "string"
          ? [article.category]
          : [],
    }));

    return {
      news: formattedNews,
      totalPages: data.totalPages ?? 0,
      currentPage: data.currentPage ?? 1,
      totalArticles: data.totalArticles ?? 0,
    };
  } catch (error) {
    console.error("Error searching news:", error);
    return {
      news: [],
      totalPages: 0,
      currentPage: 1,
      totalArticles: 0,
    };
  }
}
