import { create } from 'zustand'
import axios from 'axios'

export interface Region {
  id: string
  name: string
  description: string
  icon: string
  status: 'LOCKED' | 'UNLOCKED' | 'CONQUERED'
  progress: int
  color: string
  preview_image: string
}

interface MapState {
  regions: Region[]
  isLoading: boolean
  error: string | null
  fetchRegions: () => Promise<void>
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/v1'

export const useMapStore = create<MapState>((set) => ({
  regions: [],
  isLoading: false,
  error: null,
  fetchRegions: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get<Region[]>(`${API_BASE_URL}/quests/map`)
      set({ regions: response.data, isLoading: false })
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch map regions', isLoading: false })
    }
  },
}))
