import { create } from "zustand";

interface SidebarState {
  isOpen: boolean;
  activeItem: string;
  toggleSidebar: () => void;
  setActiveItem: (item: string) => void;
  closeSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  activeItem: "/",
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  setActiveItem: (item: string) => set({ activeItem: item }),
  closeSidebar: () => set({ isOpen: false }),
}));
