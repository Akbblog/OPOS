import { create } from 'zustand';

interface OrderState {
  category: 'bike' | 'car' | null;
  amount: number;
  vehicleNo: string;
  setCategory: (category: 'bike' | 'car') => void;
  setAmount: (amount: number) => void;
  setVehicleNo: (vehicleNo: string) => void;
  reset: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  category: null,
  amount: 0,
  vehicleNo: '',
  setCategory: (category) => set({ category }),
  setAmount: (amount) => set({ amount }),
  setVehicleNo: (vehicleNo) => set({ vehicleNo }),
  reset: () => set({ category: null, amount: 0, vehicleNo: '' }),
}));