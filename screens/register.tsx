import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { RootStackParamList } from "../navigation/rootNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Register } from "../services/userService";
import { avatarOptions } from "../constants/user";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RegisterScreen = () => {
  const navigation = useNavigation<NavigationProp>();
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
        { text: "OK", onPress: () => navigation.navigate("Login") },
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
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Create Your ReadHub Account</Text>
          <Text style={styles.subtitle}>Join the community of readers</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>UserName</Text>
          <TextInput
            placeholder="john_doe"
            style={styles.input}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="••••••••"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>Choose Avatar</Text>
          <View style={styles.avatarContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {avatarOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setSelectedAvatar(option.value)}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === option.value &&
                      styles.selectedAvatarOption,
                  ]}
                >
                  <Image
                    source={{ uri: option.value }}
                    style={styles.avatarImage}
                  />
                  {selectedAvatar === option.value && (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          {/* Login Redirect */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>

            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};
export default RegisterScreen;

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
    elevation: 6,
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
  button: {
    backgroundColor: "black",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "gray",
  },
  loginLink: {
    fontWeight: "600",
  },
  avatarContainer: {
    marginBottom: 20,
    marginTop: 5,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "transparent",
    marginRight: 12,
    padding: 3,
    position: "relative",
  },
  selectedAvatarOption: {
    borderColor: "black",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  checkBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    backgroundColor: "black",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  checkText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
