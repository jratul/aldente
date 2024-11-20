"use client";

import { create } from "zustand";

interface AlertState {
  open: boolean;
  title: string;
  content?: React.ReactNode;
  buttonLabel?: string;
  onClose?: () => void;
  openAlert: (
    params: Omit<AlertState, "open" | "openAlert" | "closeAlert">,
  ) => void;
  closeAlert: () => void;
}

const useAlertStore = create<AlertState>((set, get) => ({
  open: false,
  title: "",
  openAlert: ({
    title,
    content = null,
    buttonLabel = "닫기",
    onClose = () => {},
  }) =>
    set({
      open: true,
      title,
      content,
      buttonLabel,
      onClose,
    }),
  closeAlert: () => {
    const { onClose } = get();

    set({ open: false });
    onClose?.();
  },
}));

export default useAlertStore;
