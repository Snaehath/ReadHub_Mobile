import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Register } from "../services/userService";
import { avatarOptions } from "../constants/user";

const RegisterScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0].value);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    Keyboard.dismiss();
    if (!email || !username || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await Register(email, username, selectedAvatar, password);
      Alert.alert("Success", "Account created successfully! Please login.", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center p-5 bg-gray-100"
      >
        <View className="bg-white p-6 rounded-2xl" style={{ elevation: 4 }}>
          <Text className="text-2xl font-bold text-center text-gray-900">
            Create Your ReadHub Account
          </Text>
          <Text className="text-center text-gray-500 mb-6 mt-1">
            Join the community of readers
          </Text>

          <Text className="mb-1.5 font-medium text-gray-700">Email</Text>
          <TextInput
            placeholder="@example.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            className="border border-gray-300 rounded-xl p-3 mb-4 bg-white text-gray-800"
            value={email}
            onChangeText={setEmail}
          />

          <Text className="mb-1.5 font-medium text-gray-700">UserName</Text>
          <TextInput
            placeholder="john_doe"
            placeholderTextColor="#9ca3af"
            className="border border-gray-300 rounded-xl p-3 mb-4 bg-white text-gray-800"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <Text className="mb-1.5 font-medium text-gray-700">Password</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            className="border border-gray-300 rounded-xl p-3 mb-4 bg-white text-gray-800"
            value={password}
            onChangeText={setPassword}
          />

          <Text className="mb-1.5 font-medium text-gray-700">Choose Avatar</Text>
          <View className="mb-5 mt-1">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {avatarOptions.map((option) => {
                const isSelected = selectedAvatar === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setSelectedAvatar(option.value)}
                    className={`w-[60px] h-[60px] rounded-full border-2 mr-3 p-0.5 relative ${
                      isSelected ? "border-black" : "border-transparent"
                    }`}
                  >
                    <Image
                      source={{ uri: option.value }}
                      className="w-full h-full rounded-full"
                    />
                    {isSelected && (
                      <View className="absolute -right-0.5 -bottom-0.5 bg-black w-5 h-5 rounded-full justify-center items-center border-2 border-white">
                        <Text className="text-white text-[10px] font-bold">
                          ✓
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <TouchableOpacity
            className="bg-black p-3.5 rounded-xl items-center mt-2.5"
            style={{ opacity: loading ? 0.7 : 1 }}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">Register</Text>
            )}
          </TouchableOpacity>

          {/* Login Redirect */}
          <View className="flex-row justify-center mt-5">
            <Text className="text-gray-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text className="font-semibold text-gray-900">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default RegisterScreen;
