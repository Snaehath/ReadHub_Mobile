import React, { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
  Alert,
  TextInput,
  Linking,
  Share,
  Modal,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
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
          contentContainerClassName="px-4 mb-3.5"
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const isActive = selectedCategory === item.id;
            return (
              <TouchableOpacity
                className={`px-4 py-2 rounded-full mx-1 border ${
                  isActive
                    ? "bg-indigo-600 border-indigo-600"
                    : "bg-white border-gray-200"
                }`}
                onPress={() => handleCategoryPress(item.id)}
              >
                <Text
                  className={`text-[13px] font-semibold ${
                    isActive ? "text-white" : "text-gray-600"
                  }`}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <View className="flex-row justify-between items-center px-5 mb-3.5">
        <Text className="text-[17px] font-bold text-gray-800 flex-1 mr-2.5">
          {activeSearch
            ? `Results for "${activeSearch}"`
            : selectedCategory === "all"
              ? `${selectedCountry === "in" ? "India" : "US"} Flash Feed`
              : `${selectedCountry === "in" ? "India" : "US"} ${
                  newsCategories.find((c) => c.id === selectedCategory)?.name
                }`}
        </Text>
        <View className="flex-row bg-gray-100 rounded-xl p-0.5">
          <TouchableOpacity
            className={`px-2.5 py-1.5 rounded-lg ${
              selectedCountry === "us" ? "bg-white" : ""
            }`}
            style={selectedCountry === "us" ? { elevation: 2 } : undefined}
            onPress={() => handleCountryPress("us")}
          >
            <Text
              className={`text-xs font-semibold ${
                selectedCountry === "us" ? "text-gray-800" : "text-gray-500"
              }`}
            >
              🇺🇸 US
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-2.5 py-1.5 rounded-lg ${
              selectedCountry === "in" ? "bg-white" : ""
            }`}
            style={selectedCountry === "in" ? { elevation: 2 } : undefined}
            onPress={() => handleCountryPress("in")}
          >
            <Text
              className={`text-xs font-semibold ${
                selectedCountry === "in" ? "text-gray-800" : "text-gray-500"
              }`}
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

    const bullet1 =
      words.slice(0, chunkSize).join(" ") ||
      "Major developments reported in recent hours.";
    const bullet2 =
      words.slice(chunkSize, chunkSize * 2).join(" ") ||
      "Key stakeholders and analysts react to current events.";
    const bullet3 =
      words.slice(chunkSize * 2).join(" ") ||
      "Further updates and market response expected soon.";

    return { bullet1, bullet2, bullet3 };
  };

  const takeaways = getTakeaways();

  return (
    <View className="mx-5 mb-5">
      {!isFlipped ? (
        /* Front Face of Flashcard */
        <View
          className="bg-white rounded-2xl overflow-hidden border border-gray-100"
          style={{ elevation: 3 }}
        >
          {/* Card Hero Image */}
          <View className="h-[180px] w-full bg-gray-100 relative">
            {item.urlToImage ? (
              <Image
                source={{ uri: item.urlToImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="flex-1 justify-center items-center">
                <Feather name="layers" size={36} color="#9ca3af" />
              </View>
            )}

            {/* Badges on Hero Image */}
            <View className="absolute top-3 left-3 right-3 flex-row justify-between items-center">
              {item.category &&
              item.category.length > 0 &&
              typeof item.category[0] === "string" ? (
                <View
                  className="px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: "rgba(15, 23, 42, 0.8)" }}
                >
                  <Text className="text-[11px] font-extrabold text-white tracking-wider">
                    {item.category[0].toUpperCase()}
                  </Text>
                </View>
              ) : (
                <View
                  className="px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: "rgba(15, 23, 42, 0.8)" }}
                >
                  <Text className="text-[11px] font-extrabold text-white tracking-wider">
                    FLASH
                  </Text>
                </View>
              )}

              <TouchableOpacity
                className="w-8 h-8 rounded-full justify-center items-center"
                style={{ backgroundColor: "rgba(15, 23, 42, 0.75)" }}
                onPress={toggleAudio}
              >
                <Feather
                  name={isPlayingAudio ? "pause" : "volume-2"}
                  size={16}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Body Content */}
          <View className="p-4">
            <Text
              className="text-[17px] font-bold text-gray-800 mb-2"
              numberOfLines={3}
            >
              {item.title}
            </Text>

            {!!item.description && (
              <Text className="text-sm text-gray-600 mb-3.5" numberOfLines={2}>
                {item.description}
              </Text>
            )}

            {/* Footer Bar */}
            <View className="flex-row items-center justify-between pt-2.5 border-t border-gray-100">
              <View className="flex-row items-center">
                <Feather name="clock" size={13} color="#9ca3af" />
                <Text className="text-xs text-gray-400 ml-1">
                  {new Date(item.publishedAt).toLocaleDateString()}
                </Text>
              </View>

              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  onPress={() => onToggleLike(item.id)}
                  className="p-1"
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
                  className="p-1"
                >
                  <Feather
                    name="bookmark"
                    size={18}
                    color={isBookmarked ? "#3b82f6" : "#6b7280"}
                    fill={isBookmarked ? "#3b82f6" : "transparent"}
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleShare} className="p-1">
                  <Feather name="share-2" size={18} color="#6b7280" />
                </TouchableOpacity>

                {/* Flip Action Button */}
                <TouchableOpacity
                  className="flex-row items-center bg-indigo-600 px-3 py-1.5 rounded-xl gap-1.5"
                  onPress={() => setIsFlipped(true)}
                >
                  <Feather name="rotate-cw" size={14} color="#fff" />
                  <Text className="text-xs font-bold text-white">
                    3 Takeaways
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      ) : (
        /* Back Face / Expanded Breakdown of Flashcard */
        <View
          className="bg-purple-50 rounded-2xl p-4 border border-indigo-100"
          style={{ elevation: 3 }}
        >
          <View className="flex-row justify-between items-center mb-2.5">
            <View className="bg-indigo-100 px-2.5 py-1 rounded-lg">
              <Text className="text-xs font-bold text-indigo-700">
                Key Bullet Takeaways
              </Text>
            </View>
            <TouchableOpacity
              className="p-1"
              onPress={() => setIsFlipped(false)}
            >
              <Feather name="x" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text
            className="text-base font-bold text-indigo-950 mb-3.5"
            numberOfLines={2}
          >
            {item.title}
          </Text>

          <View className="gap-3 mb-4">
            <View className="flex-row bg-white p-2.5 rounded-xl border border-purple-100">
              <Text className="text-[15px] mr-2.5">📌</Text>
              <View className="flex-1">
                <Text className="text-[11px] font-extrabold text-indigo-500 uppercase mb-0.5">
                  Why It Matters
                </Text>
                <Text className="text-[13px] text-gray-700">
                  {takeaways.bullet1}
                </Text>
              </View>
            </View>

            <View className="flex-row bg-white p-2.5 rounded-xl border border-purple-100">
              <Text className="text-[15px] mr-2.5">💡</Text>
              <View className="flex-1">
                <Text className="text-[11px] font-extrabold text-indigo-500 uppercase mb-0.5">
                  Key Context
                </Text>
                <Text className="text-[13px] text-gray-700">
                  {takeaways.bullet2}
                </Text>
              </View>
            </View>

            <View className="flex-row bg-white p-2.5 rounded-xl border border-purple-100">
              <Text className="text-[15px] mr-2.5">🔮</Text>
              <View className="flex-1">
                <Text className="text-[11px] font-extrabold text-indigo-500 uppercase mb-0.5">
                  Outlook
                </Text>
                <Text className="text-[13px] text-gray-700">
                  {takeaways.bullet3}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between items-center pt-2 border-t border-indigo-100">
            <TouchableOpacity
              className="flex-row items-center gap-1.5 bg-indigo-100 px-3 py-1.5 rounded-xl"
              onPress={handleOpenSource}
            >
              <Text className="text-xs font-bold text-indigo-700">
                Read Full Source
              </Text>
              <Feather name="external-link" size={14} color="#4f46e5" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center gap-1.5 px-2 py-1"
              onPress={() => setIsFlipped(false)}
            >
              <Feather name="rotate-ccw" size={14} color="#4b5563" />
              <Text className="text-xs font-semibold text-gray-600">
                Card View
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
});

const NewsFeed = () => {
  const router = useRouter();
  // states
  const { user, token, updateUser } = useAuthStore();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [showAuthNudge, setShowAuthNudge] = useState(false);
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
      if (!token) {
        setShowAuthNudge(true);
        return;
      }
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
      if (!token) {
        setShowAuthNudge(true);
        return;
      }
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
    if (!loadingMore) return <View className="h-7" />;
    return (
      <View className="py-5 items-center">
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
    <View className="flex-1">
      {/* Guest Auth Nudge Modal */}
      <Modal
        visible={showAuthNudge}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAuthNudge(false)}
      >
        <Pressable
          className="flex-1"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onPress={() => setShowAuthNudge(false)}
        />
        <View
          className="bg-white rounded-t-3xl px-6 pt-6 pb-10"
          style={{ elevation: 20 }}
        >
          <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-6" />
          <View className="w-14 h-14 rounded-2xl bg-indigo-100 justify-center items-center self-center mb-4">
            <Feather name="user" size={28} color="#4f46e5" />
          </View>
          <Text className="text-[20px] font-bold text-gray-900 text-center mb-2">
            Sign in to interact
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-6 leading-5">
            Like and bookmark articles to build your personalised reading list. Takes 10 seconds.
          </Text>
          <TouchableOpacity
            className="bg-indigo-600 py-3.5 rounded-2xl items-center mb-3"
            onPress={() => {
              setShowAuthNudge(false);
              router.push("/login");
            }}
          >
            <Text className="text-white font-bold text-[15px]">Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="py-3 items-center"
            onPress={() => {
              setShowAuthNudge(false);
              router.push("/register");
            }}
          >
            <Text className="text-indigo-600 font-semibold text-[14px]">Create an account</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <View className="flex-row mx-5 mb-3.5 gap-2.5">
        <View
          className="flex-1 flex-row items-center bg-white px-3 py-2 rounded-xl"
          style={{ elevation: 2 }}
        >
          <Feather name="search" size={18} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-gray-800 text-[15px] h-9 p-0"
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
          className="bg-indigo-600 w-11 h-11 rounded-xl justify-center items-center"
          style={{
            elevation: 3,
            opacity: updatingLatest ? 0.8 : 1,
          }}
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
        <View className="flex-1">
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
          contentContainerClassName="pb-5"
          ListEmptyComponent={
            !loading ? (
              <View className="p-12 items-center justify-center">
                <Feather name="layers" size={44} color="#d1d5db" />
                <Text className="mt-4 text-gray-400 text-center text-[15px]">
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
