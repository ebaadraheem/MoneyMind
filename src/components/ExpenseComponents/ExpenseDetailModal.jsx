import { useEffect, useState } from "react";
import useStore from "../../store/useStore";

const DetailRow = ({ label, value }) => (
  <div className="py-2 px-3 flex justify-between items-center hover:bg-blue-50/50 rounded-md">
    <span className="text-sm max-sm:text-xs font-semibold">{label}:</span>
    <span className="text-sm max-sm:text-xs text-gray-700 text-right">{value}</span>
  </div>
);

const ExpenseDetailModal = () => {
  const { expenseDetailModal, closeExpenseDetailModal } = useStore();
  const [show, setShow] = useState(false);

  const { isOpen, expenseData } = expenseDetailModal;

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      closeExpenseDetailModal();
    }, 300);
  };

  if (!isOpen && !show) return null;

  const formattedAmount = expenseData?.amount
    ? `${parseFloat(expenseData.amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "N/A";

  const formattedDate = expenseData?.date
    ? new Date(expenseData.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      <div
        className={`fixed inset-0 max-h-screen bg-gray-900 overflow-hidden transition-opacity duration-300 ${
          show ? "opacity-75" : "opacity-0"
        }`}
        onClick={handleClose}
      />
      <div
        className={`relative z-50 w-full max-w-md transform transition-all duration-300 ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="bg-white max-h-screen overflow-y-auto border-t-4 border-blue-900/90 text-blue-900/80 rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="sm:text-lg font-bold text-blue-900/90">
              Expense Details
            </h2>
          </div>

          {expenseData ? (
            <div className="space-y-2">
              <DetailRow label="Description" value={expenseData.description} />
              <DetailRow label="Amount" value={formattedAmount} />
              <DetailRow
                label="Category"
                value={expenseData.category?.name || "N/A"}
              />
              <DetailRow
                label="Added By"
                value={expenseData.addedBy?.name || "N/A"}
              />
              <DetailRow label="Date" value={formattedDate} />
            </div>
          ) : (
            <p>No expense data available.</p>
          )}

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="sm:px-5 px-4 py-2 max-sm:text-sm bg-blue-900/80 cursor-pointer text-white font-semibold hover:bg-blue-900/95 rounded-md transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetailModal;
