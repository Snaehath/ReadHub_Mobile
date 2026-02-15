import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { getNewsPaginated } from "../services/news";
import { newsCategories } from "../constants/categories";
import { NewsArticle } from "../types/news";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hasMore, setHasMore] = useState(true);

  const fetchNews = useCallback(
    async (pageNum: number, category: string, shouldRefresh = false) => {
      try {
        if (pageNum === 1) setLoading(true);
        const data = await getNewsPaginated(pageNum, 12, category);

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
    fetchNews(1, selectedCategory);
  }, [selectedCategory, fetchNews]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchNews(1, selectedCategory, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNews(nextPage, selectedCategory);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    if (selectedCategory !== categoryId) {
      setSelectedCategory(categoryId);
      setPage(1);
      setNews([]);
    }
  };

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.userName}>Snaehath P</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Feather name="bell" size={24} color="#1f2937" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.searchContainer}>
        <Feather name="search" size={20} color="#9ca3af" />
        <Text style={styles.searchText}>Search news, topics...</Text>
      </TouchableOpacity>

      <FlatList
        data={newsCategories}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        keyExtractor={(item) => item.id}
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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === "all"
            ? "Featured News"
            : `${newsCategories.find((c) => c.id === selectedCategory)?.name} News`}
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 20 }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#1f2937" />
      </View>
    );
  };

  const renderItem = ({ item }: { item: NewsArticle }) => (
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
        <Text style={styles.newsCategory}>
          {item.category && item.category.length > 0
            ? item.category[0].toUpperCase()
            : "NEWS"}
        </Text>
        <Text style={styles.newsTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.newsFooter}>
          <Feather name="clock" size={14} color="#9ca3af" />
          <Text style={styles.newsTime}>
            {new Date(item.publishedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {loading && page === 1 ? (
        <View style={styles.centerLoader}>
          {/* Render header even while loading to keep UI stable, or just full screen loader */}
          {renderHeader()}
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
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#1f2937"]}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "400",
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2937",
  },
  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  notificationBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    marginBottom: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchText: {
    marginLeft: 10,
    color: "#9ca3af",
    fontSize: 16,
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
  newsCategory: {
    fontSize: 10,
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
  },
  newsTime: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 5,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  centerLoader: {
    flex: 1,
  },
});
