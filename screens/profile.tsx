import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/rootNavigator";
import { useAuthStore } from "../store/useAuthStore";
import { updateProfile } from "../services/userService";
import { avatarOptions } from "../constants/user";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, token, setUser } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [joinedDate, setJoinedDate] = useState("");

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
        } catch (e) {
          setJoinedDate("Unknown");
        }
      }
    }
  }, [user]);

  if (!user || !token) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Feather name="user-x" size={64} color="#d1d5db" />
        <Text style={styles.notFoundText}>
          No user found or session expired.
        </Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.actionButtonText}>Go to Login</Text>
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

  const handleCancel = () => {
    setNewUsername(user.username);
    setNewAvatar(user.avatar);
    setIsEditing(false);
  };

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
              <View style={styles.cardBanner} />

              <View style={styles.avatarWrapper}>
                {isEditing ? (
                  newAvatar ? (
                    <Image
                      source={{ uri: newAvatar }}
                      style={styles.avatarMain}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarFallbackText}>
                        {getInitials(user.username)}
                      </Text>
                    </View>
                  )
                ) : user.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={styles.avatarMain}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>
                      {getInitials(user.username)}
                    </Text>
                  </View>
                )}
              </View>

              {isEditing ? (
                <View style={styles.editSection}>
                  <Text style={styles.label}>Username</Text>
                  <View style={styles.inputContainer}>
                    <Feather
                      name="user"
                      size={18}
                      color="#9ca3af"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={newUsername}
                      onChangeText={setNewUsername}
                      placeholder="Username"
                      autoCapitalize="none"
                    />
                  </View>

                  <Text style={styles.label}>Select Avatar</Text>
                  <View style={styles.avatarListWrapper}>
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
                            style={[
                              styles.avatarOption,
                              isSelected && styles.avatarOptionSelected,
                            ]}
                          >
                            <Image
                              source={{ uri: opt.value }}
                              style={styles.avatarOptionImage}
                            />
                            {isSelected && (
                              <View style={styles.checkBadge}>
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
                <View style={styles.viewSection}>
                  <Text style={styles.usernameText}>{user.username}</Text>
                  <Text style={styles.emailText}>{user.email}</Text>

                  <View style={styles.badgesWrapper}>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>
                        Member since {joinedDate}
                      </Text>
                    </View>
                    {user.role === "admin" && (
                      <View style={[styles.roleBadge, styles.adminBadge]}>
                        <Text
                          style={[styles.roleBadgeText, styles.adminBadgeText]}
                        >
                          Administrator
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            {isEditing ? (
              <View style={styles.footerEditRow}>
                <TouchableOpacity
                  style={[styles.footerButton, styles.cancelButton]}
                  onPress={handleCancel}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.footerButton,
                    styles.primaryButton,
                    loading && { opacity: 0.7 },
                  ]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Feather name="edit-2" size={16} color="#4f46e5" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 15,
    marginBottom: 25,
  },
  actionButton: {
    backgroundColor: "#1f2937",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    marginBottom: 20,
  },
  cardBanner: {
    height: 100,
    width: "100%",
    backgroundColor: "#4f46e5", // Indigo-600
  },
  avatarWrapper: {
    alignItems: "center",
    marginTop: -50,
    marginBottom: 15,
  },
  avatarMain: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#fff",
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarFallbackText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4f46e5",
  },
  viewSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  usernameText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 15,
  },
  badgesWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  roleBadge: {
    backgroundColor: "#eef2ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e0e7ff",
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#4f46e5",
    textTransform: "uppercase",
  },
  adminBadge: {
    backgroundColor: "#fffbeb",
    borderColor: "#fef3c7",
  },
  adminBadgeText: {
    color: "#d97706",
  },
  editSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  avatarListWrapper: {
    marginTop: 4,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "transparent",
    marginRight: 10,
  },
  avatarOptionSelected: {
    borderColor: "#4f46e5", // Indicator
  },
  avatarOptionImage: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  checkBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    backgroundColor: "#4f46e5",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  footer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  footerEditRow: {
    flexDirection: "row",
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    color: "#4b5563",
    fontWeight: "600",
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#4f46e5",
    elevation: 2,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef2ff",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e7ff",
  },
  editButtonText: {
    color: "#4f46e5",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default ProfileScreen;
