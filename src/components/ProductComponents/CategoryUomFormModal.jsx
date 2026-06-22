import { useEffect, useState, useMemo } from "react";
import useStore from "../../store/useStore";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { EntitySchema } from "../../validation/productSchema";

const CategoryUomFormModal = () => {
  const { isOpen, onSubmit, initialData, modalName } = useStore((state) => state.categoryuomFormModal);
  const closeCategoryUOMFormModal = useStore((state) => state.closeCategoryUOMFormModal);

  const [show, setShow] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(EntitySchema),
    defaultValues: useMemo(
      () => ({
        name: initialData?.name || "",
      }),
      [initialData]
    ),
  });

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      reset(initialData || { name: "" });
    } else {
      setShow(false);
    }
  }, [isOpen, initialData, reset]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      closeCategoryUOMFormModal();
      reset({ name: "" });
    }, 300);
  };

  const onFormSubmit = async (formData) => {
    toast.dismiss();
    try {
      await onSubmit?.(formData);
      handleClose();
    } catch (error) {
      console.error(`${modalName} submission failed:`, error);
      toast.error(`Submission failed: ${error.message || "An unexpected error occurred."}`);
    }
  };

  const modalTitle = modalName || (initialData ? `Edit ${modalName}` : `Add New ${modalName}`);

  if (!isOpen && !show) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4 ">
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
            <h2 className="sm:text-lg font-bold">{modalTitle}</h2>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3 max-sm:text-sm">
            <input
              type="text"
              placeholder={`Enter ${modalName} name...`}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
            <div className="flex justify-end gap-3 mt-6">
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
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryUomFormModal;