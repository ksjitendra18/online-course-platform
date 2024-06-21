import { create } from "zustand";

interface ChapterState {
  resourceId: string | null;
  resourceType: "video" | "attachment";
  resourceLocked: boolean;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  setResource: (id: string) => void;
  clearResource: () => void;
}

const useChapterStore = create<ChapterState>((set) => ({
  resourceId: null,
  resourceType: "video",
  resourceLocked: false,
  isLoading: false,
  setIsLoading: (val) => set({ isLoading: val }),
  setResource: (id) => set({ resourceId: id, resourceLocked: true }),
  clearResource: () => set({ resourceId: null }),
}));

export default useChapterStore;
