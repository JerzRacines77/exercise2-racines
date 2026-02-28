import { create } from "zustand";
import { questions as defaultQuestions } from "../constants/questions";

export type Question = {
  id: number;
  type: "multiple" | "truefalse" | "checkbox";
  question: string;
  choices: { [key: string]: string };
  answer: string | string[];
};

type QuizStore = {
  questions: Question[];
  timer: number;
  setTimer: (t: number) => void;
  addQuestion: (q: Question) => void;
  updateQuestion: (q: Question) => void;
  deleteQuestion: (id: number) => void;
};

export const useQuizStore = create<QuizStore>((set) => ({
  questions: defaultQuestions as Question[],
  timer: 0,
  setTimer: (t) => set({ timer: t }),
  addQuestion: (q) => set((state) => ({ questions: [...state.questions, q] })),
  updateQuestion: (q) =>
    set((state) => ({
      questions: state.questions.map((item) => (item.id === q.id ? q : item)),
    })),
  deleteQuestion: (id) =>
    set((state) => ({
      questions: state.questions.filter((item) => item.id !== id),
    })),
}));