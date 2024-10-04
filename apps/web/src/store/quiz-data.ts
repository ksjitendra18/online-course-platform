import { create } from "zustand";

interface QuizDataState {
  questionLength: number;
  incrQuestionLength: () => void;
  setQuestionLength: (length: number) => void;
}

const useQuizDataStore = create<QuizDataState>((set) => ({
  questionLength: 0,
  incrQuestionLength: () =>
    set((state) => ({ questionLength: state.questionLength + 1 })),
  setQuestionLength: (length) => set({ questionLength: length }),
}));

export default useQuizDataStore;
