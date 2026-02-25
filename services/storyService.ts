import { Story, DetailedStory } from "../types/story";

const baseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "https://readhub-backend.onrender.com/api";

export async function getAllStories(): Promise<Story[]> {
  try {
    const res = await fetch(`${baseUrl}/story/allStories`);

    if (!res.ok) {
      throw new Error(`Failed to fetch stories: ${res.statusText}`);
    }

    const data = await res.json();
    return data.stories || [];
  } catch (error) {
    console.error("Error fetching stories:", error);
    return [];
  }
}

export async function getStoryById(id: string): Promise<DetailedStory | null> {
  try {
    const res = await fetch(`${baseUrl}/story/${id}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch story: ${res.statusText}`);
    }

    const data = await res.json();
    return data.story || null;
  } catch (error) {
    console.error("Error fetching story detail:", error);
    return null;
  }
}
