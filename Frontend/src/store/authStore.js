import { create } from 'zustand';

const stored = JSON.parse(localStorage.getItem('transitops-auth') || 'null');

export const useAuthStore = create((set) => ({
  token: stored?.token || null,
  role: stored?.role || null,
  fullName: stored?.fullName || null,
  email: stored?.email || null,
  isAuthenticated: !!stored?.token,

  login: ({ token, role, fullName, email }) => {
    const state = { token, role, fullName, email };
    localStorage.setItem('transitops-auth', JSON.stringify(state));
    set({ ...state, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('transitops-auth');
    set({ token: null, role: null, fullName: null, email: null, isAuthenticated: false });
  },
}));
