import { create } from "zustand";
import { persist } from "zustand/middleware";

type V = { id: string; vin: string; nickname?: string | null; mileage?: number };

type S = {
  vehicle: V | null;
  setVehicle: (v: V | null) => void;
};

export const useSelectedVehicle = create<S>()(
  persist(
    (set) => ({
      vehicle: null,
      setVehicle: (v: V | null) => set({ vehicle: v }),
    }),
    {
      name: "vg.selectedVehicle",
      partialize: (state: S) => ({ vehicle: state.vehicle }),
    }
  )
);