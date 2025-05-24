import { create } from "zustand"
import { subscribeWithSelector, persist } from "zustand/middleware"

export interface SessionState {
  id: string | null
  type: "FOCUS" | "SHORT_BREAK" | "LONG_BREAK"
  duration: number // in minutes
  timeRemaining: number // in seconds
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED"
  startedAt: Date | null
}

export interface RoomState {
  id: string | null
  name: string | null
  members: Record<string, any>
  isConnected: boolean
}

export interface UserState {
  id: string | null
  name: string | null
  email: string | null
  avatar: string | null
  status: "focus" | "break" | "idle"
  streakDays: number
  todayPoints: number
}

export interface UIState {
  theme: "light" | "dark" | "system"
  isTimerVisible: boolean
  isMobileNavOpen: boolean
  notifications: boolean
}

interface AppState {
  // User state
  user: UserState
  setUser: (user: Partial<UserState>) => void

  // Session state
  session: SessionState
  setSession: (session: Partial<SessionState> | ((prev: SessionState) => Partial<SessionState>)) => void
  startSession: (type: SessionState["type"], duration: number) => void
  pauseSession: () => void
  resumeSession: () => void
  completeSession: () => void
  cancelSession: () => void

  // Room state
  room: RoomState
  setRoom: (room: Partial<RoomState>) => void
  joinRoom: (roomId: string, roomName: string) => void
  leaveRoom: () => void
  updateRoomMembers: (members: Record<string, any>) => void

  // UI state
  ui: UIState
  setUI: (ui: Partial<UIState>) => void
  toggleTheme: () => void
  setTimerVisible: (visible: boolean) => void
  toggleMobileNav: () => void

  // Leaderboard state
  leaderboard: Array<{ userId: string; score: number; name?: string; rank: number }>
  setLeaderboard: (leaderboard: Array<{ userId: string; score: number; name?: string; rank: number }>) => void

  // Error state
  error: string | null
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // Initial user state
      user: {
        id: null,
        name: null,
        email: null,
        avatar: null,
        status: "idle",
        streakDays: 0,
        todayPoints: 0,
      },
      setUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),

      // Initial session state
      session: {
        id: null,
        type: "FOCUS",
        duration: 25,
        timeRemaining: 25 * 60,
        status: "COMPLETED",
        startedAt: null,
      },
      setSession: (session) =>
        set((state) => ({
          session: {
            ...state.session,
            ...(typeof session === "function" ? session(state.session) : session),
          },
        })),

      startSession: (type, duration) => {
        const sessionId = `session_${Date.now()}`
        set({
          session: {
            id: sessionId,
            type,
            duration,
            timeRemaining: duration * 60,
            status: "ACTIVE",
            startedAt: new Date(),
          },
        })
      },

      pauseSession: () =>
        set((state) => ({
          session: { ...state.session, status: "PAUSED" },
        })),

      resumeSession: () =>
        set((state) => ({
          session: { ...state.session, status: "ACTIVE" },
        })),

      completeSession: () =>
        set((state) => ({
          session: { ...state.session, status: "COMPLETED", timeRemaining: 0 },
        })),

      cancelSession: () =>
        set((state) => ({
          session: { ...state.session, status: "CANCELLED" },
        })),

      // Initial room state
      room: {
        id: null,
        name: null,
        members: {},
        isConnected: false,
      },
      setRoom: (room) => set((state) => ({ room: { ...state.room, ...room } })),

      joinRoom: (roomId, roomName) =>
        set({
          room: {
            id: roomId,
            name: roomName,
            members: {},
            isConnected: true,
          },
        }),

      leaveRoom: () =>
        set({
          room: {
            id: null,
            name: null,
            members: {},
            isConnected: false,
          },
        }),

      updateRoomMembers: (members) =>
        set((state) => ({
          room: { ...state.room, members },
        })),

      // UI state
      ui: {
        theme: "light",
        isTimerVisible: false,
        isMobileNavOpen: false,
        notifications: true,
      },
      setUI: (ui) => set((state) => ({ ui: { ...state.ui, ...ui } })),

      toggleTheme: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            theme: state.ui.theme === "light" ? "dark" : "light",
          },
        })),

      setTimerVisible: (visible) =>
        set((state) => ({
          ui: { ...state.ui, isTimerVisible: visible },
        })),

      toggleMobileNav: () =>
        set((state) => ({
          ui: { ...state.ui, isMobileNavOpen: !state.ui.isMobileNavOpen },
        })),

      // Leaderboard state
      leaderboard: [],
      setLeaderboard: (leaderboard) => set({ leaderboard }),

      // Error state
      error: null,
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    })),
    {
      name: "focusflow-storage",
      partialize: (state) => ({
        ui: state.ui,
        user: {
          id: state.user.id,
          name: state.user.name,
          email: state.user.email,
          avatar: state.user.avatar,
        },
      }),
    },
  ),
)

// Selectors for better performance
export const useUser = () => useAppStore((state) => state.user)
export const useSession = () => useAppStore((state) => state.session)
export const useRoom = () => useAppStore((state) => state.room)
export const useUI = () => useAppStore((state) => state.ui)
export const useError = () => useAppStore((state) => state.error)
