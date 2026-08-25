import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../store/useAuthStore";
import { getCurrentUser } from "../services/userService";
import UserDrawer from "../components/UserDrawer";
import NewsFeed from "../components/NewsFeed";

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { user, token, setUser, isGuest, setGuest } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Set guest mode on first render if no token
  useEffect(() => {
    if (!token && !isGuest) {
      setGuest(true);
    }
  }, [token, isGuest, setGuest]);

  // Sync user data on mount when authenticated
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

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    setIsDrawerOpen(false);
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          // After logout → stay on home as guest
          setGuest(true);
        },
      },
    ]);
  };

  const handleProfilePress = () => {
    setIsDrawerOpen(false);
    router.push("/profile");
  };

  const isAuthenticated = !!token;

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {isDrawerOpen && (
        <Pressable
          className="absolute inset-0 z-10"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onPress={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Top Header */}
      <View className="flex-row justify-between items-center px-5 pt-2.5 pb-4 bg-gray-50">
        <View>
          <Text className="text-[15px] text-gray-500 font-normal">
            {isAuthenticated ? "Good Morning," : "Welcome to"}
          </Text>
          <Text className="text-[22px] font-bold text-gray-800">
            {isAuthenticated ? (user?.username ?? "Reader") : "ReadHub"}
          </Text>
        </View>

        {isAuthenticated ? (
          /* Avatar button → opens drawer */
          <TouchableOpacity
            className="w-[45px] h-[45px] rounded-full bg-white justify-center items-center"
            style={{ elevation: 2 }}
            onPress={() => setIsDrawerOpen(true)}
          >
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                className="w-full h-full rounded-full"
              />
            ) : (
              <Text className="text-lg font-bold text-gray-800">
                {getInitials(user?.username ?? "RH")}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          /* Guest → Sign In button */
          <TouchableOpacity
            className="flex-row items-center bg-indigo-600 px-4 py-2 rounded-xl gap-1.5"
            onPress={() => router.push("/login")}
          >
            <Feather name="user" size={15} color="#fff" />
            <Text className="text-sm font-bold text-white">Sign In</Text>
          </TouchableOpacity>
        )}
      </View>

      {isAuthenticated && (
        <UserDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          user={user}
          onLogout={handleLogout}
          onProfilePress={handleProfilePress}
          getInitials={getInitials}
        />
      )}

      <NewsFeed />
    </View>
  );
};

export default HomeScreen;
