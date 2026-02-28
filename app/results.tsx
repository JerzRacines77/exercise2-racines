import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Results() {
  const router = useRouter();
  const { score } = useLocalSearchParams<{ score: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Your Score: {score ?? "0"}</Text>
      <Button title="Go Home" onPress={() => router.push("/home")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 24, marginBottom: 20 },
});