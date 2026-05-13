import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api, setAuthToken } from './api';
import * as Types from '@/types/api';

type User = Types.UserResponse;

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (data: Types.UserCreate) => Promise<void>;
  socialLogin: (provider: 'google', token: string, userData?: Record<string, any>) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  setHydrated: (val: boolean) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.login(email, password);
          const token = data.access_token;
          const user = data.user;

          setAuthToken(token);
          set({ token, user, isAuthenticated: true, isLoading: false });

          if (!user) {
            await get().refreshUser();
          }
        } catch (err: any) {
          set({ error: err.message || 'Login failed', isLoading: false });
          throw err;
        }
      },

      register: async (data: Types.UserCreate) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.registerUser(data);
          const token = res.access_token;
          const user = res.user;

          setAuthToken(token);
          set({ token, user, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          set({ error: err.message || 'Registration failed', isLoading: false });
          throw err;
        }
      },

      refreshUser: async () => {
        const token = get().token;
        if (!token) return;
        setAuthToken(token);

        try {
          const user = await api.getMe();
          set({ user, isAuthenticated: !!user });
        } catch (err: any) {
          if (err.status === 401) {
            get().logout();
          } else {
            console.error("Failed to refresh user", err);
          }
        }
      },

      socialLogin: async (provider, token, userData) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.socialLogin(provider, token, userData);
          const accessToken = data.access_token;
          setAuthToken(accessToken);
          set({ 
            token: accessToken, 
            user: data.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (err: any) {
          set({ error: err.message || 'Social login failed', isLoading: false });
          throw err;
        }
      },

      logout: () => {
        setAuthToken(null);
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setError: (error) => set({ error }),
      setHydrated: (val) => set({ isHydrated: val }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage), 
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (state?.token) {
          setAuthToken(state.token);
        }
      }
    }
  )
);

// Subscribe to token changes
useAuthStore.subscribe((state) => {
  setAuthToken(state.token);
});

type Document = Types.DocumentListResponse;

interface DocState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  
  fetchDocuments: () => Promise<void>;
  addDocument: (doc: Document) => void;
}

export const useDocStore = create<DocState>((set) => ({
  documents: [],
  isLoading: false,
  error: null,

  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getDocuments();
      set({ documents: data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch documents', isLoading: false });
    }
  },

  addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
}));

interface UIState {
  isSidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  theme: 'system',
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));
