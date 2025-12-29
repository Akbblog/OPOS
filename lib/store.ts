import { create } from 'zustand';

interface OrderState {
  category: 'bike' | 'car' | null;
  amount: number;
  setCategory: (category: 'bike' | 'car') => void;
  setAmount: (amount: number) => void;
  reset: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  category: null,
  amount: 0,
  setCategory: (category) => set({ category }),
  setAmount: (amount) => set({ amount }),
  reset: () => set({ category: null, amount: 0 }),
}));