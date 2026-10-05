import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Modal({ children, titleId, onClose, dismissible = true }) {
  const panel = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    function handleKey(event) {
      if (event.key === "Escape" && dismissible) onClose();
      if (event.key !== "Tab") return;
      const controls = [...panel.current.querySelectorAll("button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href]")];
      const first = controls[0];
      const last = controls.at(-1);
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && [first, panel.current].includes(document.activeElement)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && [last, panel.current].includes(document.activeElement)) {
        event.preventDefault(); first.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, [onClose, dismissible]);

  return createPortal(
    <div className="modal-overlay" onClick={(event) => {
      if (dismissible && event.target === event.currentTarget) onClose();
    }}>
      <div ref={panel} className="modal complaint-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
