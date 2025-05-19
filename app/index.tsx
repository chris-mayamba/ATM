import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import Checkbox from "expo-checkbox";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [motdepasse, setMotdepasse] = useState("");
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleLogin = async () => {
    console.log("Tentative de connexion...");
    try {
      const response = await fetch(
        "http://192.168.50.51/projet_tutore/api/login.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, motdepasse }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setMessage("Connexion réussie !");
        setTimeout(() => {
          router.replace({ pathname: "/home", params: { nom: data.user.nom } });
        }, 1000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.log(error);
      setMessage("Erreur de connexion");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: isDark ? "#181818" : "#fff",
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          marginBottom: 10,
          color: isDark ? "#fff" : "#181818",
        }}
      >
        ATM Locator
      </Text>
      <Text
        style={{
          fontSize: 18,
          marginBottom: 10,
          color: isDark ? "#fff" : "#181818",
        }}
      >
        Sign in
      </Text>
      <TextInput
        placeholder="email"
        value={email}
        onChangeText={setEmail}
        style={{
          marginBottom: 10,
          borderWidth: 1,
          borderColor: isDark ? "#fff" : "#181818",
          padding: 8,
          color: isDark ? "#fff" : "#181818",
          width: 250,
          borderRadius: 5,
        }}
        placeholderTextColor={isDark ? "#aaa" : "#555"}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="password"
        value={motdepasse}
        onChangeText={setMotdepasse}
        secureTextEntry
        style={{
          marginBottom: 10,
          borderWidth: 1,
          borderColor: isDark ? "#fff" : "#181818",
          padding: 8,
          color: isDark ? "#fff" : "#181818",
          width: 250,
          borderRadius: 5,
        }}
        placeholderTextColor={isDark ? "#aaa" : "#555"}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 10,
          width: 250,
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Checkbox value={remember} onValueChange={setRemember} />
          <Text style={{ color: isDark ? "#fff" : "#181818" }}>
            {" "}
            Remember me
          </Text>
        </View>
        <TouchableOpacity>
          <Text
            style={{
              color: "#007aff",
              textDecorationLine: "underline",
            }}
          >
            Forgot password?
          </Text>
        </TouchableOpacity>
      </View>
      <Button
        title="Se connecter"
        onPress={handleLogin}
        color={isDark ? "#fff" : "#181818"}
      />
      <Text
        style={{
          marginVertical: 10,
          color: isDark ? "#fff" : "#181818",
        }}
      >
        Ou
      </Text>
      <Text
        style={{
          color: isDark ? "#fff" : "#181818",
          marginBottom: 10,
        }}
      >
        Continuer avec
      </Text>
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: isDark ? "#fff" : "#181818",
            borderRadius: 5,
            padding: 10,
            marginRight: 10,
          }}
        >
          <Text style={{ color: isDark ? "#fff" : "#181818" }}>
            Login with Google
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: isDark ? "#fff" : "#181818",
            borderRadius: 5,
            padding: 10,
          }}
        >
          <Text style={{ color: isDark ? "#fff" : "#181818" }}>
            Login with Facebook
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={{ color: '#007aff' }}>New Here ? Sign up</Text>
      </TouchableOpacity>
      {message ? (
        <Text
          style={{
            marginTop: 10,
            color: isDark ? "#4fa3ff" : "#007aff",
          }}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}
