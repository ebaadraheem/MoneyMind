import { useEffect, useState, useMemo } from "react";
import useStore from "../../store/useStore";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { expenseSchema } from "../../validation/expenseSchema";

const ExpenseFormModal = () => {
  const {
    expenseFormModal,
    closeExpenseFormModal,
    expenseCategories,
    employees,
  } = useStore();
  const [show, setShow] = useState(false);

  const { isOpen, onSubmit, initialData } = expenseFormModal;

  const defaultFormValues = useMemo(() => {
    let formattedDate = new Date().toISOString().split("T")[0];
    if (initialData?.date) {
      const localDate = new Date(initialData.date);
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, "0");
      const day = String(localDate.getDate()).padStart(2, "0");
      formattedDate = `${year}-${month}-${day}`;
    }

    return {
      description: initialData?.description || "",
      amount: initialData?.amount || "",
      category: initialData?.category?._id || initialData?.category || "",
      addedBy: initialData?.addedBy?._id || initialData?.addedBy || "",
      date: formattedDate,
    };
  }, [initialData]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(expenseSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      reset(defaultFormValues);
    } else {
      setShow(false);
    }
  }, [isOpen, defaultFormValues, reset]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      closeExpenseFormModal();
      reset();
    }, 300);
  };

  const onFormSubmit = async (formData) => {
    toast.dismiss();
    if (!onSubmit) return;

    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error(
        `Submission failed: ${error.message || "An unexpected error occurred."}`
      );
    }
  };

  const modalTitle = initialData ? "Edit Expense" : "Add New Expense";

  if (!isOpen && !show) return null;

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
          <h2 className="sm:text-lg font-bold mb-4">{modalTitle}</h2>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 text-sm max-sm:text-xs">
            <div>
              <input
                type="text"
                placeholder="Expense Description *"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div>
              <input
                type="number"
                step="0.01"
                placeholder="Amount *"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>
            <div>
              <select
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
                {...register("category")}
              >
                <option value="">Select a Category *</option>
                {expenseCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>
            <div>
              <select
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
                {...register("addedBy")}
              >
                <option value="">Select a Employee *</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>
              {errors.addedBy && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.addedBy.message}
                </p>
              )}
            </div>
            <div>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
                {...register("date")}
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.date.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-300 cursor-pointer hover:bg-gray-400 rounded transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-900/80 cursor-pointer text-white font-semibold hover:bg-blue-900/95 rounded transition-all"
              >
                Save Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseFormModal;
