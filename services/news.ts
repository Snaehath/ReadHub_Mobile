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

    const baseUrl = "https://readhub-backend.onrender.com/api";
    // using the render endpoint

    const endpoint =
      country === "in"
        ? `${baseUrl}/news/newIn/pagination`
        : `${baseUrl}/news/new/pagination`;

    const res = await fetch(`${endpoint}?${params.toString()}`, {
      // cache: "no-store", // React Native fetch doesn't support 'cache: no-store' like fetch in Next.js Server Components
    });

    if (!res.ok) {
      // If not OK, try to extract error message, else use default message
      let errorMessage = `Failed to fetch news for ${country}`;
      try {
        const errorBody = await res.text();
        errorMessage += `: ${errorBody}`;
      } catch (e) {
        // ignore
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();

    const formattedNews: NewsArticle[] = data.articles.map((article: any) => ({
      id: article._id.toString(),
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      dateOriginal: article.publishedAt,
      source: article.source ?? { name: "Unknown" },
      category: article.category ?? [],
    }));

    return {
      news: formattedNews,
      totalPages: data.totalPages,
      currentPage: data.currentPage,
      totalArticles: data.totalArticles,
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
