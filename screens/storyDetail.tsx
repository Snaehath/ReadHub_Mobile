import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/rootNavigator";
import {
  getStoryById,
  getStoryCoverUrl,
  submitReview,
} from "../services/storyService";
import { DetailedStory, Chapter } from "../types/story";
import { useAuthStore } from "../store/useAuthStore";

type StoryDetailRouteProp = RouteProp<RootStackParamList, "StoryDetail">;

const StoryDetailScreen = () => {
  const route = useRoute<StoryDetailRouteProp>();
  const navigation = useNavigation();
  const { storyId } = route.params;
  const user = useAuthStore((state) => state.user);

  const [story, setStory] = useState<DetailedStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(0);
  const [imageError, setImageError] = useState(false);

  // Review states
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

  const handleRatingPress = (rating: number) => {
    setUserRating(rating);
  };

  const onSubmitReview = async () => {
    if (userRating === 0) {
      Alert.alert("Error", "Please select a rating.");
      return;
    }

    try {
      setIsSubmittingReview(true);
      const success = await submitReview(
        storyId,
        userRating,
        reviewText,
        user?.username || "Anonymous",
      );

      if (success) {
        Alert.alert("Success", "Your review has been submitted.");
        setReviewText("");
        setUserRating(0);
        // Refresh story to show new review and updated rating
        const data = await getStoryById(storyId);
        setStory(data);
      } else {
        Alert.alert("Error", "Failed to submit review. Please try again.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
        {!imageError ? (
          <Image
            source={{ uri: getStoryCoverUrl(story.id) }}
            style={styles.coverImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : null}
        <View style={styles.storyInfo}>
          <View style={styles.badgeRow}>
            <View style={styles.genreBadge}>
              <Text style={styles.genreText} numberOfLines={1}>
                {story.genre.toUpperCase()}
              </Text>
            </View>
            <View style={styles.ratingContainer}>
              <Feather name="star" size={14} color="#f59e0b" />
              <Text style={styles.ratingText}>
                {(story.averageRating || 0).toFixed(1)}
              </Text>
              {story.reviewCount !== undefined && (
                <Text style={styles.reviewCountText}>
                  ({story.reviewCount})
                </Text>
              )}
            </View>
          </View>

          <Text style={styles.title}>{story.title}</Text>
          <Text style={styles.author}>by {story.authorName}</Text>
          <Text style={styles.subject}>{story.subject}</Text>

          {/* Review Submission Section */}
          <View style={styles.submitReviewSection}>
            <Text style={styles.sectionTitleSmall}>Rate this story</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRatingPress(star)}
                >
                  <Feather
                    name={userRating >= star ? "star" : "star"}
                    size={28}
                    color={userRating >= star ? "#f59e0b" : "#d1d5db"}
                    fill={userRating >= star ? "#f59e0b" : "transparent"}
                    style={{ marginRight: 8 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.reviewInput}
              placeholder="Write a review (optional)..."
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (isSubmittingReview || userRating === 0) && { opacity: 0.6 },
              ]}
              onPress={onSubmitReview}
              disabled={isSubmittingReview || userRating === 0}
            >
              {isSubmittingReview ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>

          {story.reviews && story.reviews.length > 0 && (
            <View style={styles.reviewContainer}>
              <Text style={styles.reviewLabel}>Recent Reviews:</Text>
              {story.reviews.map((rev, idx) => (
                <View key={idx} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>
                      {rev.reviewerName || "Reader"}
                    </Text>
                    <View style={styles.miniRating}>
                      <Feather name="star" size={10} color="#f59e0b" />
                      <Text style={styles.miniRatingText}>{rev.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{rev.review}</Text>
                </View>
              ))}
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
  coverImage: {
    width: "100%",
    height: 300,
    backgroundColor: "#e5e7eb",
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
    flexShrink: 1,
    marginRight: 10,
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
  reviewCountText: {
    fontSize: 12,
    color: "#92400e",
    marginLeft: 4,
    opacity: 0.7,
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
  submitReviewSection: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitleSmall: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 10,
  },
  starRow: {
    flexDirection: "row",
    marginBottom: 15,
  },
  reviewInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 15,
  },
  submitBtn: {
    backgroundColor: "#7e22ce",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
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
    marginBottom: 15,
  },
  reviewItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  miniRating: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniRatingText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#d97706",
    marginLeft: 4,
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
