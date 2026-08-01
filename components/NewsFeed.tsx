import React, { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
  Alert,
  TextInput,
  Linking,
  Share,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  getNewsPaginated,
  fetchLatestNews,
  searchNews,
} from "../services/news";
import { toggleLike, toggleBookmark } from "../services/userService";
import { useAuthStore } from "../store/useAuthStore";
import { newsCategories } from "../constants/categories";
import { NewsArticle } from "../types/news";

interface NewsHeaderProps {
  activeSearch: string;
  selectedCategory: string;
  selectedCountry: string;
  handleCategoryPress: (id: string) => void;
  handleCountryPress: (id: string) => void;
}

const NewsHeader = memo(function NewsHeader({
  activeSearch,
  selectedCategory,
  selectedCountry,
  handleCategoryPress,
  handleCountryPress,
}: NewsHeaderProps) {
  return (
    <View>
      {!activeSearch && (
        <FlatList
          data={newsCategories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryItem,
                selectedCategory === item.id && styles.categoryItemActive,
              ]}
              onPress={() => handleCategoryPress(item.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item.id && styles.categoryTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {activeSearch
            ? `Results for "${activeSearch}"`
            : selectedCategory === "all"
              ? `${selectedCountry === "in" ? "India" : "US"} Flash Feed`
              : `${selectedCountry === "in" ? "India" : "US"} ${
                  newsCategories.find((c) => c.id === selectedCategory)?.name
                }`}
        </Text>
        <View style={styles.countrySwitcher}>
          <TouchableOpacity
            style={[
              styles.countryItem,
              selectedCountry === "us" && styles.countryItemActive,
            ]}
            onPress={() => handleCountryPress("us")}
          >
            <Text
              style={[
                styles.countryText,
                selectedCountry === "us" && styles.countryTextActive,
              ]}
            >
              🇺🇸 US
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.countryItem,
              selectedCountry === "in" && styles.countryItemActive,
            ]}
            onPress={() => handleCountryPress("in")}
          >
            <Text
              style={[
                styles.countryText,
                selectedCountry === "in" && styles.countryTextActive,
              ]}
            >
              🇮🇳 IN
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

interface FlashNewsCardProps {
  item: NewsArticle;
  isLiked: boolean;
  isBookmarked: boolean;
  onToggleLike: (id: string) => void;
  onToggleBookmark: (id: string) => void;
}

const FlashNewsCard = memo(function FlashNewsCard({
  item,
  isLiked,
  isBookmarked,
  onToggleLike,
  onToggleBookmark,
}: FlashNewsCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleOpenSource = async () => {
    if (item.url) {
      try {
        await Linking.openURL(item.url);
      } catch {
        Alert.alert("Error", "Could not open source URL");
      }
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: item.title,
        message: `📌 ${item.title}\n\nRead more on ReadHub: ${item.url}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const toggleAudio = () => {
    setIsPlayingAudio((prev) => !prev);
    if (!isPlayingAudio) {
      Alert.alert("🎙️ Audio Summary", "Playing 15s AI audio brief...");
    }
  };

  // Generate synthetic bullet takeaways if backend summary is absent
  const getTakeaways = () => {
    const desc = item.description || item.title || "";
    const words = desc.split(" ");
    const chunkSize = Math.max(3, Math.ceil(words.length / 3));

    const bullet1 = words.slice(0, chunkSize).join(" ") || "Major developments reported in recent hours.";
    const bullet2 = words.slice(chunkSize, chunkSize * 2).join(" ") || "Key stakeholders and analysts react to current events.";
    const bullet3 = words.slice(chunkSize * 2).join(" ") || "Further updates and market response expected soon.";

    return { bullet1, bullet2, bullet3 };
  };

  const takeaways = getTakeaways();

  return (
    <View style={styles.flashcardContainer}>
      {!isFlipped ? (
        /* Front Face of Flashcard */
        <View style={styles.cardFront}>
          {/* Card Hero Image */}
          <View style={styles.imageContainer}>
            {item.urlToImage ? (
              <Image
                source={{ uri: item.urlToImage }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Feather name="layers" size={36} color="#9ca3af" />
              </View>
            )}

            {/* Badges on Hero Image */}
            <View style={styles.imageBadgeOverlay}>
              {item.category && item.category.length > 0 ? (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    ⚡ {item.category[0].toUpperCase()}
                  </Text>
                </View>
              ) : (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>⚡ FLASH</Text>
                </View>
              )}

              <TouchableOpacity style={styles.audioBtn} onPress={toggleAudio}>
                <Feather
                  name={isPlayingAudio ? "pause" : "volume-2"}
                  size={16}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Body Content */}
          <View style={styles.cardBody}>
            <Text style={styles.newsTitle} numberOfLines={3}>
              {item.title}
            </Text>

            {!!item.description && (
              <Text style={styles.newsDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            {/* Footer Bar */}
            <View style={styles.cardFooter}>
              <View style={styles.newsTimeWrapper}>
                <Feather name="clock" size={13} color="#9ca3af" />
                <Text style={styles.newsTime}>
                  {new Date(item.publishedAt).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.actionGroup}>
                <TouchableOpacity
                  onPress={() => onToggleLike(item.id)}
                  style={styles.iconBtn}
                >
                  <Feather
                    name="heart"
                    size={18}
                    color={isLiked ? "#ef4444" : "#6b7280"}
                    fill={isLiked ? "#ef4444" : "transparent"}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onToggleBookmark(item.id)}
                  style={styles.iconBtn}
                >
                  <Feather
                    name="bookmark"
                    size={18}
                    color={isBookmarked ? "#3b82f6" : "#6b7280"}
                    fill={isBookmarked ? "#3b82f6" : "transparent"}
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
                  <Feather name="share-2" size={18} color="#6b7280" />
                </TouchableOpacity>

                {/* Flip Action Button */}
                <TouchableOpacity
                  style={styles.flipBtn}
                  onPress={() => setIsFlipped(true)}
                >
                  <Feather name="rotate-cw" size={14} color="#fff" />
                  <Text style={styles.flipBtnText}>3 Takeaways</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      ) : (
        /* Back Face / Expanded Breakdown of Flashcard */
        <View style={styles.cardBack}>
          <View style={styles.cardBackHeader}>
            <View style={styles.backHeaderBadge}>
              <Feather name="zap" size={14} color="#4f46e5" />
              <Text style={styles.backHeaderTitle}>Key Bullet Takeaways</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBackBtn}
              onPress={() => setIsFlipped(false)}
            >
              <Feather name="x" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.backNewsTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.takeawaysList}>
            <View style={styles.takeawayItem}>
              <Text style={styles.takeawayDot}>📌</Text>
              <View style={styles.takeawayTextContainer}>
                <Text style={styles.takeawayLabel}>Why It Matters</Text>
                <Text style={styles.takeawayContent}>{takeaways.bullet1}</Text>
              </View>
            </View>

            <View style={styles.takeawayItem}>
              <Text style={styles.takeawayDot}>💡</Text>
              <View style={styles.takeawayTextContainer}>
                <Text style={styles.takeawayLabel}>Key Context</Text>
                <Text style={styles.takeawayContent}>{takeaways.bullet2}</Text>
              </View>
            </View>

            <View style={styles.takeawayItem}>
              <Text style={styles.takeawayDot}>🔮</Text>
              <View style={styles.takeawayTextContainer}>
                <Text style={styles.takeawayLabel}>Outlook</Text>
                <Text style={styles.takeawayContent}>{takeaways.bullet3}</Text>
              </View>
            </View>
          </View>

          <View style={styles.backFooterRow}>
            <TouchableOpacity
              style={styles.sourceBtn}
              onPress={handleOpenSource}
            >
              <Text style={styles.sourceBtnText}>Read Full Source</Text>
              <Feather name="external-link" size={14} color="#4f46e5" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.returnFrontBtn}
              onPress={() => setIsFlipped(false)}
            >
              <Feather name="rotate-ccw" size={14} color="#4b5563" />
              <Text style={styles.returnFrontText}>Card View</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
});

const NewsFeed = () => {
  // states
  const { user, token, updateUser } = useAuthStore();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("us");
  const [hasMore, setHasMore] = useState(true);
  const [updatingLatest, setUpdatingLatest] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSearch(searchQuery);
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Interaction handlers
  const handleToggleLike = useCallback(
    async (newsId: string) => {
      if (!token) return;
      try {
        const updatedLikes = await toggleLike(
          newsId,
          selectedCountry as "us" | "in",
          token,
        );
        updateUser({
          [selectedCountry === "us" ? "likes_us" : "likes_in"]: updatedLikes,
        });
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Could not update like.");
      }
    },
    [token, selectedCountry, updateUser],
  );

  const handleToggleBookmark = useCallback(
    async (newsId: string) => {
      if (!token) return;
      try {
        const updatedBookmarks = await toggleBookmark(
          newsId,
          selectedCountry as "us" | "in",
          token,
        );
        updateUser({
          [selectedCountry === "us" ? "bookmarks_us" : "bookmarks_in"]:
            updatedBookmarks,
        });
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Could not update bookmark.");
      }
    },
    [token, selectedCountry, updateUser],
  );

  // actions
  const fetchNews = useCallback(
    async (
      pageNum: number,
      category: string,
      country: string,
      shouldRefresh = false,
      query = "",
    ) => {
      try {
        if (pageNum === 1) setLoading(true);

        let data;
        if (query.trim()) {
          data = await searchNews(query, country, pageNum, 10);
        } else {
          data = await getNewsPaginated(pageNum, 10, category, country);
        }

        if (shouldRefresh || pageNum === 1) {
          setNews(data.news);
        } else {
          setNews((prev) => [...prev, ...data.news]);
        }

        setHasMore(data.currentPage < data.totalPages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    setPage(1);
    fetchNews(1, selectedCategory, selectedCountry, false, activeSearch);
  }, [selectedCategory, selectedCountry, activeSearch, fetchNews]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchNews(1, selectedCategory, selectedCountry, true, activeSearch);
  };

  const handleGetLatest = async (isPullToRefresh: boolean = false) => {
    if (updatingLatest || (refreshing && !isPullToRefresh)) return;

    if (isPullToRefresh) {
      setRefreshing(true);
    } else {
      setUpdatingLatest(true);
    }

    try {
      const success = await fetchLatestNews(selectedCountry as "us" | "in");
      if (success) {
        Alert.alert(
          "Success",
          `Latest ${selectedCountry.toUpperCase()} flashcards updated!`,
        );
        handleRefresh();
      } else {
        Alert.alert("Notice", "Failed to fetch new articles. Used cache.");
        if (isPullToRefresh) setRefreshing(false);
      }
    } catch {
      Alert.alert("Error", "Could not fetch latest news.");
      if (isPullToRefresh) setRefreshing(false);
    } finally {
      if (!isPullToRefresh) setUpdatingLatest(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNews(
        nextPage,
        selectedCategory,
        selectedCountry,
        false,
        activeSearch,
      );
    }
  };

  const handleCategoryPress = useCallback((categoryId: string) => {
    setSelectedCategory((prev) => {
      if (prev !== categoryId) {
        setPage(1);
        setNews([]);
        setSearchQuery("");
        setActiveSearch("");
        return categoryId;
      }
      return prev;
    });
  }, []);

  const handleCountryPress = useCallback((countryId: string) => {
    setSelectedCountry((prev) => {
      if (prev !== countryId) {
        setPage(1);
        setNews([]);
        return countryId;
      }
      return prev;
    });
  }, []);

  const clearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
    setPage(1);
    setNews([]);
  };

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 30 }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4f46e5" />
      </View>
    );
  };

  const renderItem = useCallback(
    ({ item }: { item: NewsArticle }) => {
      const isLiked =
        selectedCountry === "us"
          ? user?.likes_us?.includes(item.id)
          : user?.likes_in?.includes(item.id);
      const isBookmarked =
        selectedCountry === "us"
          ? user?.bookmarks_us?.includes(item.id)
          : user?.bookmarks_in?.includes(item.id);

      return (
        <FlashNewsCard
          item={item}
          isLiked={!!isLiked}
          isBookmarked={!!isBookmarked}
          onToggleLike={handleToggleLike}
          onToggleBookmark={handleToggleBookmark}
        />
      );
    },
    [
      selectedCountry,
      user?.likes_us,
      user?.likes_in,
      user?.bookmarks_us,
      user?.bookmarks_in,
      handleToggleLike,
      handleToggleBookmark,
    ],
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topActionsRow}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search flashcards..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            placeholderTextColor="#9ca3af"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Feather name="x" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.getLatestBtn, updatingLatest && { opacity: 0.8 }]}
          onPress={() => handleGetLatest(false)}
          disabled={updatingLatest}
        >
          {updatingLatest ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Feather name="refresh-ccw" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {loading && page === 1 ? (
        <View style={styles.centerLoader}>
          <NewsHeader
            activeSearch={activeSearch}
            selectedCategory={selectedCategory}
            selectedCountry={selectedCountry}
            handleCategoryPress={handleCategoryPress}
            handleCountryPress={handleCountryPress}
          />
          <ActivityIndicator
            size="large"
            color="#4f46e5"
            style={{ marginTop: 50 }}
          />
        </View>
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={5}
          removeClippedSubviews={true}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <NewsHeader
              activeSearch={activeSearch}
              selectedCategory={selectedCategory}
              selectedCountry={selectedCountry}
              handleCategoryPress={handleCategoryPress}
              handleCountryPress={handleCountryPress}
            />
          }
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => handleRefresh()}
              colors={["#4f46e5"]}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Feather name="layers" size={44} color="#d1d5db" />
                <Text style={styles.emptyText}>
                  No flashcards found for your query.
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

export default NewsFeed;

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
  },
  topActionsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 15,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#1f2937",
    fontSize: 15,
    height: 36,
    padding: 0,
  },
  getLatestBtn: {
    backgroundColor: "#4f46e5",
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  categoryItemActive: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
  },
  categoryTextActive: {
    color: "#fff",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
    marginRight: 10,
  },
  countrySwitcher: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 3,
  },
  countryItem: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  countryItemActive: {
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  countryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  countryTextActive: {
    color: "#1f2937",
  },

  /* Flashcard Component Styles */
  flashcardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cardFront: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  imageContainer: {
    height: 180,
    width: "100%",
    backgroundColor: "#f3f4f6",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageBadgeOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  audioBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1f2937",
    lineHeight: 23,
    marginBottom: 8,
  },
  newsDescription: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  newsTimeWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  newsTime: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 4,
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    padding: 3,
  },
  flipBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4f46e5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  flipBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },

  /* Card Back Styles */
  cardBack: {
    backgroundColor: "#faf5ff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#e0e7ff",
    elevation: 4,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardBackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  backHeaderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  backHeaderTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4338ca",
  },
  closeBackBtn: {
    padding: 4,
  },
  backNewsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e1b4b",
    lineHeight: 22,
    marginBottom: 14,
  },
  takeawaysList: {
    gap: 12,
    marginBottom: 16,
  },
  takeawayItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f3e8ff",
  },
  takeawayDot: {
    fontSize: 15,
    marginRight: 10,
  },
  takeawayTextContainer: {
    flex: 1,
  },
  takeawayLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6366f1",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  takeawayContent: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
  },
  backFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e7ff",
  },
  sourceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  sourceBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4338ca",
  },
  returnFrontBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  returnFrontText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
  },

  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  centerLoader: {
    flex: 1,
  },
  emptyContainer: {
    padding: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 15,
    color: "#9ca3af",
    textAlign: "center",
    fontSize: 15,
  },
});
