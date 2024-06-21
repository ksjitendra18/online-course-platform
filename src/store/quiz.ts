import { create } from "zustand";

interface QuizState {
  hasStarted: boolean;
  duration: number;
  setDuration: (duration: number) => void;
  setHasStarted: () => void;
  setHasEnded: () => void;
}

const useQuizStore = create<QuizState>((set) => ({
  hasStarted: false,
  duration: -1,
  setDuration: (val) => set({ duration: val }),
  setHasStarted: () => set({ hasStarted: true }),
  setHasEnded: () => set({ hasStarted: false, duration: -1 }),
}));

export default useQuizStore;
