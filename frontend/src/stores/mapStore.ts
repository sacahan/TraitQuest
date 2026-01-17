import { create } from 'zustand'
import axios from 'axios'
import { useAuthStore } from './authStore'

export interface Region {
  id: string
  name: string
  status: 'LOCKED' | 'AVAILABLE' | 'CONQUERED'
  unlock_hint?: string
  // 視覺配置
  color?: string
  icon?: string
  position?: { top: string; left: string }
}

interface MapState {
  regions: Region[]
  isLoading: boolean
  error: string | null
  fetchRegions: (force?: boolean) => Promise<void>
  checkRegionAccess: (regionId: string) => Promise<{ can_enter: boolean; message: string; status: string }>
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/v1'

// 靜態視覺配置對照表
const VISUAL_CONFIGS: Record<string, Partial<Region>> = {
  mbti: { color: '#11D452', icon: 'Sparkles', position: { top: '25%', left: '16%' } },
  bigfive: { color: '#00f0ff', icon: 'Zap', position: { top: '48%', left: '32%' } },
  enneagram: { color: '#bd00ff', icon: 'ScrollText', position: { top: '55%', left: '54%' } },
  disc: { color: '#ff4f4f', icon: 'Sword', position: { top: '26%', left: '73%' } },
  gallup: { color: '#ffd000', icon: 'Trophy', position: { top: '10%', left: '45%' } },
}

export const useMapStore = create<MapState>((set) => ({
  regions: [],
  isLoading: false,
  error: null,
  fetchRegions: async (force = false) => {
    const { regions, isLoading } = useMapStore.getState()
    const token = useAuthStore.getState().accessToken

    // 如果正在載入中，或已經有數據（除非需要強制刷新），則跳過
    if (!token || isLoading || (!force && regions.length > 0)) return

    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(`${API_BASE_URL}/map/regions`, {
        params: { token }
      })

      const regionsWithVisuals = response.data.regions.map((r: Region) => ({
        ...r,
        ...VISUAL_CONFIGS[r.id]
      }))

      set({ regions: regionsWithVisuals, isLoading: false })
    } catch (error) {
      const dbError = error as Error;
      set({ error: dbError.message || 'Failed to fetch map regions', isLoading: false })
    }
  },
  checkRegionAccess: async (regionId: string) => {
    const token = useAuthStore.getState().accessToken
    if (!token) return { can_enter: false, message: 'Unauthorized', status: 'LOCKED' }

    try {
      const response = await axios.get(`${API_BASE_URL}/map/check-access`, {
        params: { token, region_id: regionId }
      })
      return response.data
    } catch (error) {
      const dbError = error as Error;
      return { can_enter: false, message: dbError.message || 'Failed to check access', status: 'LOCKED' }
    }
  }
}))
