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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../store/useAuthStore";
import { getCurrentUser } from "../services/userService";
import UserDrawer from "../components/UserDrawer";
import NewsFeed from "../components/NewsFeed";

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { user, token, setUser } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
    setIsDrawerOpen(false);
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleProfilePress = () => {
    setIsDrawerOpen(false);
    router.push("/profile");
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {isDrawerOpen && (
        <Pressable
          className="absolute inset-0 z-10"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onPress={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Persistant Top Header */}
      <View className="flex-row justify-between items-center px-5 pt-2.5 pb-4 bg-gray-50">
        <View>
          <Text className="text-[15px] text-gray-500 font-normal">
            Good Morning,
          </Text>
          <Text className="text-[22px] font-bold text-gray-800">
            {user?.username || "Guest"}
          </Text>
        </View>
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
        onProfilePress={handleProfilePress}
        getInitials={getInitials}
      />

      <NewsFeed />
    </View>
  );
};

export default HomeScreen;
