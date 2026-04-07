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
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  handleSearchSubmit: () => void;
  clearSearch: () => void;
  updatingLatest: boolean;
  handleGetLatest: (refresh?: boolean) => void;
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
}: Omit<
  NewsHeaderProps,
  | "searchQuery"
  | "setSearchQuery"
  | "handleSearchSubmit"
  | "clearSearch"
  | "updatingLatest"
  | "handleGetLatest"
>) {
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
            ? `Search Results for "${activeSearch}"`
            : selectedCategory === "all"
              ? `${selectedCountry === "in" ? "India" : "US"} Featured News`
              : `${selectedCountry === "in" ? "India" : "US"} ${
                  newsCategories.find((c) => c.id === selectedCategory)?.name
                } News`}
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
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Interaction handlers
  const handleToggleLike = async (newsId: string) => {
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
  };

  const handleToggleBookmark = async (newsId: string) => {
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
  };

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
          data = await searchNews(query, country, pageNum, 12);
        } else {
          data = await getNewsPaginated(pageNum, 12, category, country);
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
    setPage(1); // Reset page on query/category/country change
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
          `Latest ${selectedCountry.toUpperCase()} news updated!`,
        );
        handleRefresh(); // fetch the updated list from the DB
      } else {
        Alert.alert(
          "Notice",
          "Failed to fetch new articles. Used fallback cache.",
        );
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

  const handleSearchSubmit = () => {
    setActiveSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
    setPage(1);
    setNews([]);
  };

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 20 }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#1f2937" />
      </View>
    );
  };

  const renderItem = ({ item }: { item: NewsArticle }) => {
    const isLiked =
      selectedCountry === "us"
        ? user?.likes_us?.includes(item.id)
        : user?.likes_in?.includes(item.id);
    const isBookmarked =
      selectedCountry === "us"
        ? user?.bookmarks_us?.includes(item.id)
        : user?.bookmarks_in?.includes(item.id);

    return (
      <TouchableOpacity style={styles.newsCard}>
        <View style={styles.newsImagePlaceholder}>
          {item.urlToImage ? (
            <Image
              source={{ uri: item.urlToImage }}
              style={styles.newsImage}
              resizeMode="cover"
            />
          ) : (
            <Feather name="image" size={32} color="#d1d5db" />
          )}
        </View>
        <View style={styles.newsContent}>
          <View style={styles.categoriesWrapper}>
            {item.category && item.category.length > 0 ? (
              item.category.slice(0, 3).map((cat, index) => (
                <View key={index} style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {cat.toUpperCase()}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>NEWS</Text>
              </View>
            )}
          </View>
          <Text style={styles.newsTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.newsFooter}>
            <View style={styles.newsTimeWrapper}>
              <Feather name="clock" size={14} color="#9ca3af" />
              <Text style={styles.newsTime}>
                {new Date(item.publishedAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => handleToggleLike(item.id)}
                style={styles.actionBtn}
              >
                <Feather
                  name="heart"
                  size={18}
                  color={isLiked ? "#ef4444" : "#9ca3af"}
                  fill={isLiked ? "#ef4444" : "transparent"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleToggleBookmark(item.id)}
                style={styles.actionBtn}
              >
                <Feather
                  name="bookmark"
                  size={18}
                  color={isBookmarked ? "#3b82f6" : "#9ca3af"}
                  fill={isBookmarked ? "#3b82f6" : "transparent"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topActionsRow}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search news, topics..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
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
            color="#1f2937"
            style={{ marginTop: 50 }}
          />
        </View>
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
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
              colors={["#1f2937"]}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Feather name="search" size={50} color="#d1d5db" />
                <Text style={styles.emptyText}>
                  No news found for your query.
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
    marginBottom: 25,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#1f2937",
    fontSize: 16,
    height: 38,
    padding: 0,
  },
  getLatestBtn: {
    backgroundColor: "#4f46e5",
    width: 48,
    height: 48,
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
    marginBottom: 25,
  },
  categoryItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  categoryItemActive: {
    backgroundColor: "#1f2937",
    borderColor: "#1f2937",
  },
  categoryText: {
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
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
    marginRight: 10,
  },
  newsCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
    marginHorizontal: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  newsImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  newsImage: {
    width: "100%",
    height: "100%",
  },
  newsContent: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  categoriesWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#3b82f6",
    letterSpacing: 0.5,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    lineHeight: 22,
  },
  newsFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  newsTimeWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  newsTime: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 5,
  },
  actionRow: {
    flexDirection: "row",
    gap: 15,
  },
  actionBtn: {
    padding: 4,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  centerLoader: {
    flex: 1,
  },
  countrySwitcher: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 4,
  },
  countryItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  emptyContainer: {
    padding: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 15,
    color: "#9ca3af",
    textAlign: "center",
    fontSize: 16,
  },
});
