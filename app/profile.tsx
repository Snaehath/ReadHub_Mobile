import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/useAuthStore";
import { updateProfile, resetPassword } from "../services/userService";
import { avatarOptions } from "../constants/user";

const ProfileScreen = () => {
  const router = useRouter();
  const { user, token, setUser } = useAuthStore();

  // Guard: guests cannot access profile
  useEffect(() => {
    if (!token) {
      router.replace("/home");
    }
  }, [token, router]);

  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [joinedDate, setJoinedDate] = useState("");

  // Password reset states
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (user) {
      setNewUsername(user.username);
      setNewAvatar(user.avatar);

      // format date
      if (user.createdAt) {
        try {
          const date = new Date(user.createdAt);
          const formatted = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          setJoinedDate(formatted);
        } catch {
          setJoinedDate("Unknown");
        }
      }
    }
  }, [user]);

  if (!user || !token) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-5">
        <Feather name="user-x" size={64} color="#d1d5db" />
        <Text className="text-base text-gray-500 mt-4 mb-6">
          No user found or session expired.
        </Text>
        <TouchableOpacity
          className="bg-gray-800 px-5 py-3 rounded-lg"
          onPress={() => router.replace("/login")}
        >
          <Text className="text-white font-bold text-base">Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    Keyboard.dismiss();
    if (!newUsername.trim()) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const data = await updateProfile(user.id, newUsername, newAvatar, token);

      setUser({
        ...user,
        username: data.user.username,
        avatar: data.user.avatar,
      });

      Alert.alert("Success", "Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert("Update Failed", error.message || "Could not update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const success = await resetPassword(user.email, newPassword);
      if (success) {
        Alert.alert("Success", "Password reset successfully!");
        setNewPassword("");
        setIsResettingPassword(false);
      } else {
        Alert.alert("Error", "Failed to reset password.");
      }
    } catch {
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNewUsername(user.username);
    setNewAvatar(user.avatar);
    setIsEditing(false);
  };

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  const getInteractionCount = () => {
    const likes = (user.likes_us?.length || 0) + (user.likes_in?.length || 0);
    const bookmarks =
      (user.bookmarks_us?.length || 0) + (user.bookmarks_in?.length || 0);
    return { likes, bookmarks };
  };

  const { likes, bookmarks } = getInteractionCount();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3.5">
        <TouchableOpacity
          className="p-1"
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">Profile</Text>
        <View className="w-6" />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView contentContainerClassName="p-5 pb-10">
            <View
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 mb-5"
              style={{ elevation: 3 }}
            >
              <View className="h-20 w-full bg-indigo-600" />

              <View className="items-center -mt-12 mb-3.5">
                {isEditing ? (
                  newAvatar ? (
                    <Image
                      source={{ uri: newAvatar }}
                      className="w-[100px] h-[100px] rounded-full border-4 border-white bg-white"
                    />
                  ) : (
                    <View className="w-[100px] h-[100px] rounded-full border-4 border-white bg-indigo-50 justify-center items-center">
                      <Text className="text-3xl font-bold text-indigo-600">
                        {getInitials(user.username)}
                      </Text>
                    </View>
                  )
                ) : user.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    className="w-[100px] h-[100px] rounded-full border-4 border-white bg-white"
                  />
                ) : (
                  <View className="w-[100px] h-[100px] rounded-full border-4 border-white bg-indigo-50 justify-center items-center">
                    <Text className="text-3xl font-bold text-indigo-600">
                      {getInitials(user.username)}
                    </Text>
                  </View>
                )}
              </View>

              {isEditing ? (
                <View className="px-5 pb-7">
                  <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                    Username
                  </Text>
                  <View className="flex-row items-center border border-gray-300 rounded-xl bg-white px-3 mb-5">
                    <Feather
                      name="user"
                      size={18}
                      color="#9ca3af"
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      className="flex-1 py-3 text-base text-gray-800"
                      value={newUsername}
                      onChangeText={setNewUsername}
                      placeholder="Username"
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="none"
                    />
                  </View>

                  <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                    Select Avatar
                  </Text>
                  <View className="mt-1">
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {avatarOptions.map((opt) => {
                        const isSelected = newAvatar === opt.value;
                        return (
                          <TouchableOpacity
                            key={opt.value}
                            onPress={() => setNewAvatar(opt.value)}
                            className={`w-[60px] h-[60px] rounded-full border-2 mr-2.5 relative ${
                              isSelected
                                ? "border-indigo-600"
                                : "border-transparent"
                            }`}
                          >
                            <Image
                              source={{ uri: opt.value }}
                              className="w-full h-full rounded-full"
                            />
                            {isSelected && (
                              <View className="absolute -right-0.5 -bottom-0.5 bg-indigo-600 w-5 h-5 rounded-full justify-center items-center border-2 border-white">
                                <Feather name="check" size={12} color="#fff" />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              ) : (
                <View className="items-center px-5 pb-7">
                  <Text className="text-2xl font-extrabold text-gray-800 mb-1">
                    {user.username}
                  </Text>
                  <Text className="text-sm font-medium text-gray-500 mb-4">
                    {user.email}
                  </Text>

                  <View className="flex-row flex-wrap justify-center gap-2 mb-5">
                    <View className="bg-indigo-50 px-3 py-1.5 rounded-2xl border border-indigo-100">
                      <Text className="text-[10px] font-extrabold text-indigo-600 uppercase">
                        Member since {joinedDate}
                      </Text>
                    </View>
                    {user.role === "admin" && (
                      <View className="bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-100">
                        <Text className="text-[10px] font-extrabold text-amber-600 uppercase">
                          Administrator
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Interactions Stats */}
                  <View className="flex-row items-center justify-center bg-gray-50 py-3.5 px-5 rounded-2xl w-full">
                    <View className="items-center flex-1">
                      <Text className="text-lg font-extrabold text-gray-800">
                        {likes}
                      </Text>
                      <Text className="text-xs text-gray-500 font-semibold">
                        Likes
                      </Text>
                    </View>
                    <View className="w-[1px] h-7 bg-gray-200" />
                    <View className="items-center flex-1">
                      <Text className="text-lg font-extrabold text-gray-800">
                        {bookmarks}
                      </Text>
                      <Text className="text-xs text-gray-500 font-semibold">
                        Bookmarks
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Account Security Section */}
            {!isEditing && (
              <View className="bg-white rounded-2xl p-5 mb-5 border border-gray-100">
                <Text className="text-base font-bold text-gray-800 mb-3.5">
                  Account Security
                </Text>
                {isResettingPassword ? (
                  <View className="mt-1.5">
                    <TextInput
                      className="border border-gray-300 rounded-xl p-3 mb-3.5 text-[15px] bg-white text-gray-800"
                      placeholder="Enter new password"
                      placeholderTextColor="#9ca3af"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                    <View className="flex-row justify-end gap-2.5">
                      <TouchableOpacity
                        className="px-4 py-2 rounded-lg min-w-[80px] items-center bg-gray-100"
                        onPress={() => setIsResettingPassword(false)}
                      >
                        <Text className="text-gray-600 font-bold">Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="px-4 py-2 rounded-lg min-w-[80px] items-center bg-indigo-600"
                        style={{ opacity: loading ? 0.7 : 1 }}
                        onPress={handleResetPassword}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text className="text-white font-bold">Reset</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    className="flex-row items-center justify-between py-2.5"
                    onPress={() => setIsResettingPassword(true)}
                  >
                    <View className="flex-row items-center">
                      <Feather name="lock" size={20} color="#4b5563" />
                      <Text className="text-[15px] font-semibold text-gray-600 ml-3">
                        Reset Password
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View
            className="bg-white border-t border-gray-100 p-5"
            style={{ paddingBottom: Platform.OS === "ios" ? 30 : 20 }}
          >
            {isEditing ? (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 py-3.5 rounded-xl items-center justify-center bg-gray-100"
                  onPress={handleCancel}
                  disabled={loading}
                >
                  <Text className="text-gray-600 font-semibold text-base">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3.5 rounded-xl items-center justify-center bg-indigo-600"
                  style={{
                    elevation: 3,
                    opacity: loading ? 0.7 : 1,
                  }}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      Save Changes
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className="flex-row items-center justify-center bg-indigo-50 py-3.5 rounded-xl border border-indigo-100"
                onPress={() => setIsEditing(true)}
              >
                <Feather name="edit-2" size={16} color="#4f46e5" />
                <Text className="text-indigo-600 font-bold text-base ml-2">
                  Edit Profile
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default ProfileScreen;
