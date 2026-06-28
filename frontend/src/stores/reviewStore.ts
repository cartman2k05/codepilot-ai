import { create } from "zustand"

interface ReviewState {
  selectedFileIndex: number
  selectedCategory: string | null
  selectedSeverity: string | null
  setSelectedFile: (index: number) => void
  setCategory: (category: string | null) => void
  setSeverity: (severity: string | null) => void
  resetFilters: () => void
}

export const useReviewStore = create<ReviewState>((set) => ({
  selectedFileIndex: 0,
  selectedCategory: null,
  selectedSeverity: null,
  setSelectedFile: (index) => set({ selectedFileIndex: index }),
  setCategory: (category) => set({ selectedCategory: category }),
  setSeverity: (severity) => set({ selectedSeverity: severity }),
  resetFilters: () => set({ selectedCategory: null, selectedSeverity: null, selectedFileIndex: 0 })
}))
