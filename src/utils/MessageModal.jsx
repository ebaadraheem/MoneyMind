import { useEffect, useState } from "react";
import { IconCheckCircle, IconError, IconInfo } from "../utils/Icons";
import useStore from "../store/useStore";

const MessageModal = () => {
  const { modal, closeModal } = useStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
  if (modal.isOpen) {
    setTimeout(() => setShow(true), 10); // allow initial render with opacity-0
  } else {
    setShow(false);
  }
}, [modal.isOpen]);


  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      closeModal();
    }, 300); // Match with transition duration
  };

  if (!modal.isOpen && !show) return null;

  const modalTypeClasses = {
    success: "bg-green-100 border-green-500 text-green-700",
    error: "bg-red-100 border-red-500 text-red-700",
    info: "bg-blue-100 border-blue-500 text-blue-900/90",
    confirm: "bg-yellow-100 border-yellow-500 text-yellow-700",
  };

  const buttonClasses = {
    success: "bg-green-600 hover:bg-green-700",
    error: "bg-red-600 hover:bg-red-700",
    info: "bg-blue-900/90 hover:bg-blue-900",
    confirm: "bg-blue-900/90 hover:bg-blue-900",
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      <div
        className={`fixed inset-0 bg-gray-900 transition-opacity duration-300 ${
          show ? "opacity-75" : "opacity-0"
        }`}
        onClick={handleClose}
      />
      <div
        className={`relative z-50 w-full max-w-sm transform transition-all duration-300 ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div
          className={`bg-white rounded-lg shadow-xl p-6 border-t-4 ${
            modalTypeClasses[modal.type]
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center">
              {modal.type === "success" && (
                <IconCheckCircle className="w-6 h-6 mr-2" />
              )}
              {modal.type === "error" && <IconError className="w-6 h-6 mr-2" />}
              {modal.type === "info" && <IconInfo className="w-6 h-6 mr-2" />}
              {modal.type === "confirm" && (
                <IconInfo className="w-6 h-6 mr-2" />
              )}
              {modal.type.charAt(0).toUpperCase() + modal.type.slice(1)}
            </h3>
          </div>
          <p className="mb-6">{modal.message}</p>
          <div className="flex justify-end space-x-3">
            {modal.type === "confirm" && (
              <button
                onClick={() => {
                  modal.onCancel?.();
                  handleClose();
                }}
                className="px-4 py-2 max-sm:text-sm cursor-pointer rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => {
                modal.onConfirm?.();
                handleClose();
              }}
              className={`px-4 py-2 max-sm:text-sm cursor-pointer rounded-md text-white font-semibold transition ${
                buttonClasses[modal.type]
              }`}
            >
              {modal.type === "confirm" ? "Confirm" : "OK"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
