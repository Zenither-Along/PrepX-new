import { create } from 'zustand';

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: (() => void) | null;
  onCancel?: () => void;
  confirm: (title: string, description: string, onConfirm: () => void, onCancel?: () => void) => void;
  close: () => void;
}

export const useConfirmation = create<ConfirmationState>((set) => ({
  isOpen: false,
  title: '',
  description: '',
  onConfirm: null,
  onCancel: undefined,
  confirm: (title, description, onConfirm, onCancel) => {
    set({
      isOpen: true,
      title,
      description,
      onConfirm,
      onCancel,
    });
  },
  close: () => {
    set({
      isOpen: false,
      title: '',
      description: '',
      onConfirm: null,
      onCancel: undefined,
    });
  },
}));
