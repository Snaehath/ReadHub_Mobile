import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import { RootStackParamList } from "../navigation/rootNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back 👋</Text>
        <Text style={styles.subtitle}>Login to ReadHub</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="you@example.com"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="••••••••"
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.showText}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => alert("Registration is currently disabled.")}
          >
            <Text style={[styles.registerLink, { color: "#9ca3af" }]}>
              Register
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f3f4f6",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    elevation: 6, // Android shadow
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "gray",
    marginBottom: 24,
  },
  label: {
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    backgroundColor: "#fff",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 24,
    backgroundColor: "#fff",
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
  },
  showText: {
    fontWeight: "600",
  },
  button: {
    backgroundColor: "black",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  registerText: {
    color: "gray",
  },

  registerLink: {
    fontWeight: "600",
  },
});
