import { useState, useEffect } from "react";
import useStore from "../../store/useStore";
import ProductForm from "./ProductForm";

const ProductFormModal = () => {
  const {
    productFormModal,
    closeProductFormModal,
    setLoading,
    setError,
    categories,
    uoms,
    fetchCategories,
    fetchUOMs,
    setProducts,
  } = useStore();

  const [show, setShow] = useState(false);
  const { isOpen, onSubmit, initialData } = productFormModal;

  const primaryColor = " border-blue-900/90 text-blue-900/80";

  useEffect(() => {
    setTimeout(() => {
      setShow(isOpen);
    }, 80);
    if (isOpen) {
      fetchCategories();
      fetchUOMs();
    } else {
      setShow(false);
    }
  }, [isOpen, fetchCategories, fetchUOMs]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      closeProductFormModal();
    }, 300); 
  };

  const modalTitle = initialData ? "Edit Product" : "Add New Product";

  if (!isOpen && !show) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      <div
        className={`fixed inset-0 bg-gray-900 transition-opacity duration-300 ${
          show ? "opacity-75" : "opacity-0"
        }`}
        onClick={handleClose}
      />
      <div
        className={`relative z-50 w-full max-w-md transform transition-all duration-300 ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div
          className={` bg-white overflow-y-auto max-h-screen rounded-lg shadow-xl p-6 border-t-4 ${primaryColor}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="sm:text-lg font-bold text-blue-900/80">
              {modalTitle}
            </h2>
          </div>
          <ProductForm
            initialData={initialData}
            onSubmit={onSubmit} 
            categories={categories}
            uoms={uoms}
            fetchCategories={fetchCategories}
            fetchUOMs={fetchUOMs}
            setLoading={setLoading}
            setError={setError}
            setProducts={setProducts} 
            closeModal={handleClose} 
          />
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;
