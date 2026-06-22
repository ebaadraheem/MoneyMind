import React, { useEffect, useState } from "react";
import PosHeldInvoice from "./PosHeldInvoice";

const HeldInvoicesDisplayModal = ({ show, onClose }) => {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    onClose();
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      <div
        className={`fixed inset-0 bg-gray-900 transition-opacity duration-300 ${
          show ? "opacity-75" : "opacity-0"
        }`}
        onClick={handleClose}
      />
      <div
        className={`relative z-50 w-full max-w-4xl transform transition-all duration-300 ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="bg-white max-h-[90vh] overflow-y-auto border-t-4 border-blue-900/90 text-blue-900/80 rounded-lg shadow-xl p-4">
          <PosHeldInvoice AllInvoices={false} handleClose={handleClose} />

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-900/80 cursor-pointer text-white font-semibold hover:bg-blue-900/95 rounded transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeldInvoicesDisplayModal;