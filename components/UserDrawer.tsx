import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { User } from "../types/user";

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  onProfilePress: () => void;
  getInitials: (name: string) => string;
}

const UserDrawer: React.FC<UserDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onProfilePress,
  getInitials,
}) => {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1" onPress={onClose} />
      <View
        className="bg-white rounded-t-3xl px-5 pt-3 absolute bottom-0 w-full"
        style={{ elevation: 20 }}
      >
        <View className="w-10 h-1 bg-gray-200 rounded-sm self-center mb-5" />

        <View className="flex-row items-center mb-5">
          <View className="w-[60px] h-[60px] rounded-full bg-gray-100 justify-center items-center mr-3.5">
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                className="w-[60px] h-[60px] rounded-full"
              />
            ) : (
              <Text className="text-2xl font-bold text-gray-800">
                {getInitials(user?.username || "GU")}
              </Text>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800">
              {user?.username || "Guest User"}
            </Text>
            <Text className="text-sm text-gray-500 mt-0.5">
              {user?.email || "guest@readhub.com"}
            </Text>
          </View>
        </View>

        <View className="h-[1px] bg-gray-100 my-2.5" />

        <TouchableOpacity
          className="flex-row items-center py-3.5"
          onPress={onProfilePress}
        >
          <Feather name="user" size={20} color="#4b5563" />
          <Text className="ml-3 text-base text-gray-800 font-medium">
            Profile Settings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-3.5"
          onPress={onClose}
        >
          <Feather name="bookmark" size={20} color="#4b5563" />
          <Text className="ml-3 text-base text-gray-800 font-medium">
            Saved Articles
          </Text>
        </TouchableOpacity>

        <View className="h-[1px] bg-gray-100 my-2.5" />

        <TouchableOpacity
          className="flex-row items-center py-3.5 mt-1"
          onPress={onLogout}
        >
          <Feather name="log-out" size={20} color="#ef4444" />
          <Text className="ml-3 text-base text-red-500 font-medium">
            Logout
          </Text>
        </TouchableOpacity>

        <View className="h-10" />
      </View>
    </Modal>
  );
};

export default UserDrawer;
