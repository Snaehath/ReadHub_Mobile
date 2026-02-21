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
  Alert,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/rootNavigator";
import { getNewsPaginated } from "../services/news";
import { newsCategories } from "../constants/categories";
import { NewsArticle } from "../types/news";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../store/useAuthStore";
import UserDrawer from "../components/UserDrawer";

const HomeScreen = () => {
  // hooks
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // states
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("us");
  const [hasMore, setHasMore] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // actions

  const fetchNews = useCallback(
    async (
      pageNum: number,
      category: string,
      country: string,
      shouldRefresh = false,
    ) => {
      try {
        if (pageNum === 1) setLoading(true);
        const data = await getNewsPaginated(pageNum, 12, category, country);

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
    fetchNews(1, selectedCategory, selectedCountry);
  }, [selectedCategory, selectedCountry, fetchNews]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchNews(1, selectedCategory, selectedCountry, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNews(nextPage, selectedCategory, selectedCountry);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    if (selectedCategory !== categoryId) {
      setSelectedCategory(categoryId);
      setPage(1);
      setNews([]);
    }
  };

  const handleCountryPress = (countryId: string) => {
    if (selectedCountry !== countryId) {
      setSelectedCountry(countryId);
      setPage(1);
      setNews([]);
    }
  };

  // helpers
  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    setIsDrawerOpen(false); // close drawer
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" as any }],
          });
        },
      },
    ]);
  };

  // render helpers
  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.userName}>{user?.username || "Guest"}</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => setIsDrawerOpen(true)}
        >
          {user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={styles.avatarImageSmall}
            />
          ) : (
            <Text style={styles.initialsText}>
              {getInitials(user?.username || "GU")}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <UserDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
        onLogout={handleLogout}
        getInitials={getInitials}
      />

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
            ? `${selectedCountry === "in" ? "India" : "US"} Featured News`
            : `${selectedCountry === "in" ? "India" : "US"} ${newsCategories.find((c) => c.id === selectedCategory)?.name} News`}
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
  // render
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {isDrawerOpen && (
        <Pressable
          style={styles.staticBackdrop}
          onPress={() => setIsDrawerOpen(false)}
        />
      )}
      {loading && page === 1 ? (
        <View style={styles.centerLoader}>
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

// styles
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
    borderRadius: 22.5,
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
  avatarImageSmall: {
    width: "100%",
    height: "100%",
    borderRadius: 22.5,
  },
  initialsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  drawerBackdrop: {
    flex: 1,
  },
  staticBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 10,
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
});
