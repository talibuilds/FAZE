import { create } from 'zustand';

interface UserData {
  id: string;
  name: string;
  email: string;
  walletBalance: number;
  createdAt: string;
}

interface AuthState {
  token: string | null;
  user: UserData | null;
  walletBalance: number | null;
  transactions: any[];
  login: (token: string, user: UserData) => void;
  logout: () => void;
  setBalance: (balance: number) => void;
  setTransactions: (transactions: any[]) => void;
  setUser: (user: UserData) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  walletBalance: null,
  transactions: [],
  login: (token, user) => set({ token, user, walletBalance: user.walletBalance }),
  logout: () => set({ token: null, user: null, walletBalance: null, transactions: [] }),
  setBalance: (walletBalance) => set({ walletBalance }),
  setTransactions: (transactions) => set({ transactions }),
  setUser: (user) => set({ user }),
}));
