import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/rootNavigator";
import { getStoryById } from "../services/storyService";
import { DetailedStory, Chapter } from "../types/story";

type StoryDetailRouteProp = RouteProp<RootStackParamList, "StoryDetail">;

const StoryDetailScreen = () => {
  const route = useRoute<StoryDetailRouteProp>();
  const navigation = useNavigation();
  const { storyId } = route.params;

  const [story, setStory] = useState<DetailedStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(0);

  useEffect(() => {
    const fetchStoryDetail = async () => {
      try {
        setLoading(true);
        const data = await getStoryById(storyId);
        setStory(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoryDetail();
  }, [storyId]);

  if (loading) {
    return (
      <View style={styles.centerLoader}>
        <ActivityIndicator size="large" color="#1f2937" />
      </View>
    );
  }

  if (!story) {
    return (
      <View style={styles.centerLoader}>
        <Text>Story not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {story.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.storyInfo}>
          <View style={styles.badgeRow}>
            <View style={styles.genreBadge}>
              <Text style={styles.genreText}>{story.genre.toUpperCase()}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Feather name="star" size={14} color="#f59e0b" />
              <Text style={styles.ratingText}>
                {(story.rating || 0).toFixed(1)}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{story.title}</Text>
          <Text style={styles.author}>by {story.authorName}</Text>
          <Text style={styles.subject}>{story.subject}</Text>

          {story.review && (
            <View style={styles.reviewContainer}>
              <Text style={styles.reviewLabel}>AI Review:</Text>
              <Text style={styles.reviewText}>{story.review}</Text>
            </View>
          )}
        </View>

        <View style={styles.chaptersSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Chapters</Text>
            {story.isCompleted && (
              <View style={styles.completedBadgeInner}>
                <Text style={styles.completedTextInner}>COMPLETED</Text>
              </View>
            )}
          </View>
          {story.chapters.map((chapter: Chapter, index: number) => (
            <View key={index} style={styles.chapterCard}>
              <TouchableOpacity
                style={styles.chapterHeader}
                onPress={() =>
                  setExpandedChapter(expandedChapter === index ? null : index)
                }
              >
                <View style={styles.chapterTitleRow}>
                  <Text style={styles.chapterNumber}>
                    {chapter.chapterNumber}.
                  </Text>
                  <Text style={styles.chapterTitle}>{chapter.title}</Text>
                </View>
                <Feather
                  name={
                    expandedChapter === index ? "chevron-up" : "chevron-down"
                  }
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>

              {expandedChapter === index && (
                <View style={styles.chapterContent}>
                  <Text style={styles.contentText}>{chapter.content}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  storyInfo: {
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  genreBadge: {
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  genreText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#7e22ce",
    letterSpacing: 0.5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#d97706",
    marginLeft: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 15,
  },
  subject: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
    marginBottom: 20,
  },
  reviewContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 5,
  },
  reviewText: {
    fontSize: 14,
    color: "#4b5563",
    fontStyle: "italic",
    lineHeight: 20,
  },
  chaptersSection: {
    padding: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  completedBadgeInner: {
    backgroundColor: "#10b981",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedTextInner: {
    fontSize: 10,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 0.5,
  },
  chapterCard: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 12,
    overflow: "hidden",
  },
  chapterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
  },
  chapterTitleRow: {
    flexDirection: "row",
    flex: 1,
  },
  chapterNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7e22ce",
    marginRight: 10,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  chapterContent: {
    padding: 15,
    backgroundColor: "#f9fafb",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  contentText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 26,
  },
  backButtonText: {
    color: "#3b82f6",
    marginTop: 10,
    fontWeight: "600",
  },
});

export default StoryDetailScreen;
