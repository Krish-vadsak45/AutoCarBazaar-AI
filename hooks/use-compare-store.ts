import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-toastify";

export type CompareCar = {
  id: string;
  image: string;
  title: string;
  price: string | number;
};

interface CompareStore {
  selectedCars: CompareCar[];
  addCar: (car: CompareCar) => void;
  removeCar: (carId: string) => void;
  clearCars: () => void;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      selectedCars: [],
      addCar: (car) => {
        const { selectedCars } = get();
        // Check if already exists
        if (selectedCars.some((c) => c.id === car.id)) {
          toast.warning("Car is already in compare list");
          return;
        }
        // Limit to 3 cars
        if (selectedCars.length >= 3) {
          toast.error("You can only compare up to 3 cars at once");
          return;
        }

        set({ selectedCars: [...selectedCars, car] });

        if (selectedCars.length === 0) {
          toast.success("Car added to compare. Select another car.");
        } else {
          toast.success(
            `Car added. ${selectedCars.length + 1} cars ready to compare.`,
          );
        }
      },
      removeCar: (carId) =>
        set((state) => ({
          selectedCars: state.selectedCars.filter((c) => c.id !== carId),
        })),
      clearCars: () => set({ selectedCars: [] }),
    }),
    {
      name: "car-compare-storage", // name of the item in the storage (must be unique)
    },
  ),
);
