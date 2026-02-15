import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import { RootStackParamList } from "../navigation/rootNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RegisterScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Your ReadHub Account</Text>
        <Text style={styles.subtitle}>Join the community of readers</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <Text style={styles.label}>UserName</Text>
        <TextInput placeholder="john_doe" style={styles.input} />

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="••••••••"
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        {/* Login Redirect */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
});
