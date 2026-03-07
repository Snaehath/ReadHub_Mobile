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
  reviews?: any[];
}

export interface StoriesResponse {
  stories: Story[];
}

export interface StoryResponse {
  message: string;
  story: DetailedStory;
}
