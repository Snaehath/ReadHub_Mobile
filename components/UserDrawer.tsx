import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { User } from "../types/user";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/rootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  getInitials: (name: string) => string;
}

const UserDrawer: React.FC<UserDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  getInitials,
}) => {
  const navigation = useNavigation<NavigationProp>();

  const handleProfilePress = () => {
    onClose();
    navigation.navigate("Profile");
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.drawerBackdrop, { backgroundColor: "transparent" }]}
        onPress={onClose}
      />
      <View style={styles.drawerContent}>
        <View style={styles.drawerHandle} />

        <View style={styles.drawerHeader}>
          <View style={styles.drawerAvatarContainer}>
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={styles.drawerAvatar}
              />
            ) : (
              <Text style={styles.drawerInitials}>
                {getInitials(user?.username || "GU")}
              </Text>
            )}
          </View>
          <View style={styles.drawerUserInfo}>
            <Text style={styles.drawerUsername}>
              {user?.username || "Guest User"}
            </Text>
            <Text style={styles.drawerEmail}>
              {user?.email || "guest@readhub.com"}
            </Text>
          </View>
        </View>

        <View style={styles.drawerDivider} />

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={handleProfilePress}
        >
          <Feather name="user" size={20} color="#4b5563" />
          <Text style={styles.drawerItemText}>Profile Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerItem} onPress={onClose}>
          <Feather name="bookmark" size={20} color="#4b5563" />
          <Text style={styles.drawerItemText}>Saved Articles</Text>
        </TouchableOpacity>

        <View style={styles.drawerDivider} />

        <TouchableOpacity
          style={[styles.drawerItem, styles.logoutItem]}
          onPress={onLogout}
        >
          <Feather name="log-out" size={20} color="#ef4444" />
          <Text style={[styles.drawerItemText, styles.logoutItemText]}>
            Logout
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  drawerBackdrop: {
    flex: 1,
  },
  drawerContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    position: "absolute",
    bottom: 0,
    width: "100%",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  drawerAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  drawerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  drawerInitials: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  drawerUserInfo: {
    flex: 1,
  },
  drawerUsername: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  drawerEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 10,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  drawerItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
  },
  logoutItem: {
    marginTop: 5,
  },
  logoutItemText: {
    color: "#ef4444",
  },
});

export default UserDrawer;
