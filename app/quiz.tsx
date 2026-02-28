import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useQuizStore } from "../store/quizStore";

export default function Quiz() {
  const router = useRouter();
  const { questions, timer } = useQuizStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string | string[] }>({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(timer > 0 ? timer : null);
  const scoreRef = useRef(0); // ← track score in a ref so auto-submit gets the latest value

  const question = questions[currentIndex];

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft === 0) {
      router.replace({
        pathname: "/results",
        params: { score: scoreRef.current.toString() },
      });
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => (t !== null ? t - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleSelect = (choice: string) => {
    if (question.type === "checkbox") {
      const current = (selectedAnswers[question.id] as string[]) || [];
      const updated = current.includes(choice)
        ? current.filter((c) => c !== choice)
        : [...current, choice];
      setSelectedAnswers({ ...selectedAnswers, [question.id]: updated });
    } else {
      setSelectedAnswers({ ...selectedAnswers, [question.id]: choice });
    }
  };

  const handleNext = () => {
    let isCorrect = false;
    if (question.type === "checkbox") {
      const selected = JSON.stringify((selectedAnswers[question.id] as string[]) || []);
      isCorrect = selected === JSON.stringify(question.answer);
    } else {
      isCorrect = selectedAnswers[question.id] === question.answer;
    }

    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
      setScore(newScore);
      scoreRef.current = newScore; // ← keep ref in sync
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push({ pathname: "/results", params: { score: newScore.toString() } });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <View style={styles.container}>
      {timeLeft !== null && (
        <View style={[styles.timerBadge, timeLeft <= 10 && styles.timerUrgent]}>
          <Text style={styles.timerText}>⏱ {timeLeft}s</Text>
        </View>
      )}

      <Text style={styles.progress}>
        Question {currentIndex + 1} / {questions.length}
      </Text>
      <Text style={styles.question}>{question.question}</Text>

      {Object.entries(question.choices).map(([key, value]) => {
        const isSelected =
          question.type === "checkbox"
            ? ((selectedAnswers[question.id] as string[]) || []).includes(key)
            : selectedAnswers[question.id] === key;

        return (
          <TouchableOpacity
            key={key}
            style={[styles.choice, isSelected && styles.selectedChoice]}
            onPress={() => handleSelect(key)}
          >
            <Text>{key}: {value as string}</Text>
          </TouchableOpacity>
        );
      })}

      <View style={styles.buttonRow}>
        <Button title="Previous" onPress={handlePrevious} disabled={currentIndex === 0} />
        <Button
          title={currentIndex === questions.length - 1 ? "Finish" : "Next"}
          onPress={handleNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  progress: { fontSize: 14, color: "#888", marginBottom: 8 },
  question: { fontSize: 20, marginBottom: 20, fontWeight: "600" },
  choice: { padding: 10, borderWidth: 1, borderColor: "#333", borderRadius: 5, marginBottom: 10 },
  selectedChoice: { backgroundColor: "#add8e6" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  timerBadge: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  timerUrgent: { backgroundColor: "#FF3B30" },
  timerText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});