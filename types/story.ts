export interface Review {
  userId: string;
  reviewerName: string;
  rating: number;
  review: string;
  createdAt: string;
}

export interface Story {
  id: string;
  title: string;
  genre: string;
  subject: string;
  synopsis?: string;
  worldBuilding?: any;
  characters?: any;
  authorName: string;
  coverImage?: string;
  isCompleted: boolean;
  currentChapterCount: number;
  maxChapters?: number;
  averageRating?: number;
  reviewCount?: number;
  ratingSum?: number;
  index: string;
}

export interface Chapter {
  chapterNumber: number;
  title: string;
  content: string;
  publishedAt: string;
}

export interface DetailedStory extends Story {
  chapters: Chapter[];
  tableOfContents?: any[];
  reviews?: Review[];
}

export interface StoriesResponse {
  stories: Story[];
}

export interface StoryResponse {
  message: string;
  story: DetailedStory;
}
