export interface Story {
  id: string;
  title: string;
  genre: string;
  subject: string;
  authorName: string;
  isCompleted: boolean;
  currentChapterCount: number;
  rating: number;
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
  maxChapters: number;
  review?: string;
}

export interface StoriesResponse {
  stories: Story[];
}

export interface StoryResponse {
  message: string;
  story: DetailedStory;
}
