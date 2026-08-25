import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { login } from "../services/userService";
import { useAuthStore } from "../store/useAuthStore";

const LoginScreen = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      setUser(data.user);
      setToken(data.token);
      router.replace("/home");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "An unknown error occurred");
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
            Welcome back 👋
          </Text>
          <Text className="text-center text-gray-500 mb-6 mt-1">
            Login to ReadHub
          </Text>

          <Text className="mb-1.5 font-medium text-gray-700">Email</Text>
          <TextInput
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
            className="border border-gray-300 rounded-xl p-3 mb-4 bg-white text-gray-800"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text className="mb-1.5 font-medium text-gray-700">Password</Text>
          <View className="flex-row items-center border border-gray-300 rounded-xl px-3 mb-6 bg-white">
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              className="flex-1 py-3 text-gray-800"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text className="font-semibold text-gray-800">
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-black p-3.5 rounded-xl items-center"
            style={{ opacity: loading ? 0.7 : 1 }}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">Login</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-5">
            <Text className="text-gray-500">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text className="font-semibold text-gray-900">Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
