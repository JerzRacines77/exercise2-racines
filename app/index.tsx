import { useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useQuizStore } from "../store/quizStore";

export default function Home() {
  const router = useRouter();
  const { timer } = useQuizStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Preview Quiz</Text>
      {timer > 0 && (
        <Text style={styles.timerInfo}>⏱ Timer: {timer} seconds</Text>
      )}
      <Button title="Start Quiz" onPress={() => router.push("/quiz")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  title: { fontSize: 24, fontWeight: "bold" },
  timerInfo: { fontSize: 16, color: "#555" },
});