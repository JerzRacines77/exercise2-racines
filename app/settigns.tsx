import React, { useState } from "react";
import {
  Alert,
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Question, useQuizStore } from "../store/quizStore";

export default function Settings() {
  const { questions, timer, setTimer, addQuestion, updateQuestion, deleteQuestion } =
    useQuizStore();

  const [timerInput, setTimerInput] = useState(timer.toString());
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [formQuestion, setFormQuestion] = useState("");
  const [formType, setFormType] = useState<"multiple" | "truefalse" | "checkbox">("multiple");
  const [formChoices, setFormChoices] = useState({ A: "", B: "", C: "", D: "" });
  const [formAnswer, setFormAnswer] = useState("");

  const handleSaveTimer = () => {
    const val = parseInt(timerInput);
    if (isNaN(val) || val < 0) {
      Alert.alert("Invalid", "Please enter a valid number of seconds.");
      return;
    }
    setTimer(val);
    Alert.alert("Saved", `Timer set to ${val} seconds.`);
  };

  const openAdd = () => {
    setEditingQuestion(null);
    setFormQuestion("");
    setFormType("multiple");
    setFormChoices({ A: "", B: "", C: "", D: "" });
    setFormAnswer("");
    setModalVisible(true);
  };

  const openEdit = (q: Question) => {
    setEditingQuestion(q);
    setFormQuestion(q.question);
    setFormType(q.type);
    setFormChoices({ A: "", B: "", C: "", D: "", ...(q.choices as any) });
    setFormAnswer(Array.isArray(q.answer) ? q.answer.join(",") : q.answer);
    setModalVisible(true);
  };

  const handleSaveQuestion = () => {
    if (!formQuestion.trim()) {
      Alert.alert("Error", "Question text is required.");
      return;
    }

    const choices: { [key: string]: string } = {};
    Object.entries(formChoices).forEach(([k, v]) => {
      if (v.trim()) choices[k] = v.trim();
    });

    const answer =
      formType === "checkbox"
        ? formAnswer.split(",").map((a) => a.trim().toUpperCase())
        : formAnswer.trim().toUpperCase();

    if (editingQuestion) {
      updateQuestion({
        ...editingQuestion,
        question: formQuestion,
        type: formType,
        choices,
        answer,
      });
    } else {
      const newId = Math.max(0, ...questions.map((q) => q.id)) + 1;
      addQuestion({ id: newId, question: formQuestion, type: formType, choices, answer });
    }

    setModalVisible(false);
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete", "Are you sure you want to delete this question?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteQuestion(id) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Timer Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quiz Timer (seconds)</Text>
        <Text style={styles.hint}>Set to 0 to disable the timer.</Text>
        <View style={styles.timerRow}>
          <TextInput
            style={styles.timerInput}
            keyboardType="numeric"
            value={timerInput}
            onChangeText={setTimerInput}
            placeholder="e.g. 60"
          />
          <Button title="Save Timer" onPress={handleSaveTimer} />
        </View>
      </View>

      {/* Questions Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Questions ({questions.length})</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {questions.map((item) => (
          <View key={item.id.toString()} style={styles.questionItem}>
            <Text style={styles.questionText} numberOfLines={2}>
              {item.question}
            </Text>
            <View style={styles.questionActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>
            {editingQuestion ? "Edit Question" : "Add Question"}
          </Text>

          <Text style={styles.label}>Question</Text>
          <TextInput
            style={styles.input}
            value={formQuestion}
            onChangeText={setFormQuestion}
            placeholder="Enter question"
            multiline
          />

          <Text style={styles.label}>Type</Text>
          <View style={styles.typeRow}>
            {(["multiple", "truefalse", "checkbox"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, formType === t && styles.typeBtnActive]}
                onPress={() => setFormType(t)}
              >
                <Text style={formType === t ? styles.typeBtnTextActive : styles.typeBtnText}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Choices</Text>
          {Object.keys(formChoices).map((key) => (
            <View key={key} style={styles.choiceRow}>
              <Text style={styles.choiceKey}>{key}:</Text>
              <TextInput
                style={styles.choiceInput}
                value={(formChoices as any)[key]}
                onChangeText={(val) => setFormChoices({ ...formChoices, [key]: val })}
                placeholder={`Choice ${key}`}
              />
            </View>
          ))}

          <Text style={styles.label}>
            Answer {formType === "checkbox" ? "(comma separated, e.g. A,B)" : "(e.g. A)"}
          </Text>
          <TextInput
            style={styles.input}
            value={formAnswer}
            onChangeText={setFormAnswer}
            placeholder={formType === "checkbox" ? "A,B" : "A"}
            autoCapitalize="characters"
          />

          <View style={styles.modalButtons}>
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="gray" />
            <Button title="Save" onPress={handleSaveQuestion} />
          </View>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 16, paddingBottom: 40 },
  section: { backgroundColor: "#fff", borderRadius: 10, padding: 16, marginBottom: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  hint: { fontSize: 12, color: "#888", marginBottom: 8 },
  timerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  timerInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    width: 80,
    fontSize: 16,
  },
  addBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: { color: "#fff", fontWeight: "bold" },
  questionItem: { borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 10 },
  questionText: { fontSize: 14, marginBottom: 6 },
  questionActions: { flexDirection: "row", gap: 8 },
  editBtn: {
    backgroundColor: "#34C759",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 5,
  },
  editBtnText: { color: "#fff", fontSize: 13 },
  deleteBtn: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 5,
  },
  deleteBtnText: { color: "#fff", fontSize: 13 },
  modal: { padding: 20, paddingTop: 60 },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10, fontSize: 15 },
  typeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  typeBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  typeBtnActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  typeBtnText: { color: "#333" },
  typeBtnTextActive: { color: "#fff" },
  choiceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  choiceKey: { fontWeight: "bold", width: 20 },
  choiceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
    marginBottom: 40,
  },
});