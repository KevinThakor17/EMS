import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

let toastId = 0;

const variantClass = {
  success: "text-bg-success",
  error: "text-bg-danger",
  warning: "text-bg-warning",
  info: "text-bg-primary",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, options = {}) => {
    const {
      title = "Notification",
      variant = "info",
      delay = 3500,
    } = options;

    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, title, variant }]);

    window.setTimeout(() => {
      dismissToast(id);
    }, delay);
  }, [dismissToast]);

  const value = useMemo(() => ({
    showToast,
    success: (message, options = {}) => showToast(message, { ...options, variant: "success" }),
    error: (message, options = {}) => showToast(message, { ...options, variant: "error" }),
    info: (message, options = {}) => showToast(message, { ...options, variant: "info" }),
    warning: (message, options = {}) => showToast(message, { ...options, variant: "warning" }),
  }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 1080 }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast show align-items-center border-0 ${variantClass[toast.variant] || variantClass.info}`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="d-flex">
              <div className="toast-body">
                <div className="fw-semibold">{toast.title}</div>
                <div>{toast.message}</div>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Close"
                onClick={() => dismissToast(toast.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
