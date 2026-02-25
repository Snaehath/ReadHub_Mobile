import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { getAllStories } from "../services/storyService";
import { Story } from "../types/story";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/rootNavigator";

const StoriesFeed = () => {
  // states
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // actions
  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllStories();
      setStories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStories();
  };

  // render helpers
  const renderItem = ({ item }: { item: Story }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => navigation.navigate("StoryDetail", { storyId: item.id })}
    >
      <View style={styles.genreContainer}>
        <View style={styles.genreBadge}>
          <Text style={styles.genreText}>
            {(item.genre || "GENRE").toUpperCase()}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          <Feather name="star" size={12} color="#f59e0b" />
          <Text style={styles.ratingText}>{(item.rating || 0).toFixed(1)}</Text>
        </View>
      </View>

      <Text style={styles.storyTitle} numberOfLines={2}>
        {item.title}
      </Text>

      <Text style={styles.subjectText} numberOfLines={2}>
        {item.subject}
      </Text>

      <View style={styles.storyFooter}>
        <View style={styles.authorContainer}>
          <Feather name="user" size={14} color="#6b7280" />
          <Text style={styles.authorName}>{item.authorName || "AI Agent"}</Text>
        </View>
        <View style={styles.chaptersContainer}>
          <Feather name="book-open" size={14} color="#6b7280" />
          <Text style={styles.chaptersText}>
            {item.currentChapterCount || 0} Chapters
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>AI Agent Stories</Text>
      <Text style={styles.headerSubtitle}>
        Explore infinite worlds created by AI
      </Text>
    </View>
  );

  // render
  if (loading && stories.length === 0) {
    return (
      <View style={styles.centerLoader}>
        <ActivityIndicator size="large" color="#1f2937" />
      </View>
    );
  }

  return (
    <FlatList
      data={stories}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={["#1f2937"]}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
  },
  centerLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  storyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    marginHorizontal: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  genreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  genreBadge: {
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  genreText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#7e22ce",
    letterSpacing: 0.5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#d97706",
    marginLeft: 4,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    lineHeight: 24,
    marginBottom: 8,
  },
  subjectText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 12,
  },
  storyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorName: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 6,
    fontWeight: "500",
  },
  chaptersContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chaptersText: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 6,
    fontWeight: "500",
  },
  completedBadge: {
    position: "absolute",
    top: -8,
    right: 16,
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  completedText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#fff",
  },
});

export default StoriesFeed;
