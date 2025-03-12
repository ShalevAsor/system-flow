// src/utils/toast.ts
import { toast, ToastOptions, Id, ToastContainerProps } from "react-toastify";

// Define default options that will be applied to all toasts
const defaultOptions: ToastOptions = {
  position: "bottom-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
};

export const toastConfig: ToastContainerProps = {
  position: "bottom-right",
  autoClose: 5000,
  hideProgressBar: false,
  newestOnTop: true,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  theme: "light",
};

// Functions that allow overriding default options
export const toastSuccess = (
  message: string,
  customOptions: ToastOptions = {}
): Id => {
  return toast.success(message, { ...defaultOptions, ...customOptions });
};

export const toastError = (
  message: string,
  customOptions: ToastOptions = {}
): Id => {
  return toast.error(message, { ...defaultOptions, ...customOptions });
};

export const toastInfo = (
  message: string,
  customOptions: ToastOptions = {}
): Id => {
  return toast.info(message, { ...defaultOptions, ...customOptions });
};

export const toastWarning = (
  message: string,
  customOptions: ToastOptions = {}
): Id => {
  return toast.warning(message, { ...defaultOptions, ...customOptions });
};

// For completely custom toasts
export const toastCustom = (
  message: React.ReactNode,
  options: ToastOptions = {}
): Id => {
  return toast(message, { ...defaultOptions, ...options });
};

// For updating existing toasts
export const updateToast = (toastId: Id, options: ToastOptions): void => {
  toast.update(toastId, options);
};

// For dismissing toasts programmatically
export const dismissToast = (toastId?: Id): void => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss(); // Dismiss all toasts if no ID provided
  }
};
