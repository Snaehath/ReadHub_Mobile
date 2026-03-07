import { Story, DetailedStory } from "../types/story";
import { useAuthStore } from "../store/useAuthStore";

const baseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "https://readhub-backend.onrender.com/api";

export function getStoryCoverUrl(id: string): string {
  const coverBaseUrl = baseUrl.replace("/api", "") + "/covers";
  return `${coverBaseUrl}/cover_${id}.jpg`;
}

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

export async function getMyStory(
  storyId?: string,
  force?: boolean,
): Promise<{ story: Story; isInitializing?: boolean } | null> {
  try {
    const token = useAuthStore.getState().token;
    let url = `${baseUrl}/story/myStory`;
    if (force) {
      url += "?force=true";
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ storyId }),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch my story: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      story: data.story,
      isInitializing: data.isInitializing,
    };
  } catch (error) {
    console.error("Error fetching my story:", error);
    return null;
  }
}
