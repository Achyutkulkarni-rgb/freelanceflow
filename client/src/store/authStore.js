import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: null,

  setAuth: (user, token) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    set({ user, token });
  },

  loadAuth: () => {
    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    if (token && user) set({ user, token });
  },

  logout: () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;