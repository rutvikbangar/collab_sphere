import { createPortal } from "react-dom";

export default function Modal({ children }) {
  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      {children}
    </div>,
    document.body
  );
}
