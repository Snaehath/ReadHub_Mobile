import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/rootNavigator";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../store/useAuthStore";
import { getCurrentUser } from "../services/userService";
import UserDrawer from "../components/UserDrawer";
import NewsFeed from "../components/NewsFeed";
import StoriesFeed from "../components/StoriesFeed";

const HomeScreen = () => {
  // hooks
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // states
  const { user, token, setUser } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"news" | "stories">("news");

  // Sync user data on mount
  useEffect(() => {
    const syncUser = async () => {
      if (token) {
        try {
          const freshUser = await getCurrentUser(token);
          setUser(freshUser);
        } catch {
          console.error("Failed to sync user");
        }
      }
    };
    syncUser();
  }, [token, setUser]);

  // helpers
  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  // actions
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

  // render
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {isDrawerOpen && (
        <Pressable
          style={styles.staticBackdrop}
          onPress={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Persistant Top Header */}
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

      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === "news" && styles.activeTabItem]}
          onPress={() => setActiveTab("news")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "news" && styles.activeTabText,
            ]}
          >
            News
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === "stories" && styles.activeTabItem,
          ]}
          onPress={() => setActiveTab("stories")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "stories" && styles.activeTabText,
            ]}
          >
            AI Stories
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "news" ? <NewsFeed /> : <StoriesFeed />}
    </View>
  );
};

// styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: "#f9fafb",
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
  staticBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 10,
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabItem: {
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#1f2937",
  },
});

export default HomeScreen;
