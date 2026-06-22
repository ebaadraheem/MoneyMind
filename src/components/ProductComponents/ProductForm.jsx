import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import ProductApis from "../../services/ProductApis";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { productSchema } from "../../validation/productSchema";
import { uid } from "uid";

const ProductForm = ({
  initialData,
  onSubmit,
  categories,
  uoms,
  fetchCategories,
  fetchUOMs,
  setLoading,
  setError,
  setProducts,
  closeModal,
}) => {
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewUOMInput, setShowNewUOMInput] = useState(false);
  const [newUOMName, setNewUOMName] = useState("");
  const [isStockEnabled, setIsStockEnabled] = useState(false);

  const buttonColor = "bg-blue-900/80 hover:bg-blue-900/95";
  const defaultValues = useMemo(() => {
    return {
      name: initialData?.name || "",
      code: initialData?.code || "",
      saleprice: initialData?.saleprice ? initialData.saleprice.toString() : "",
      costprice: initialData?.costprice ? initialData.costprice.toString() : "",
      stock: initialData?.stock ? initialData.stock.toString() : "0",
      expiryDate: initialData?.expiryDate
        ? new Date(initialData.expiryDate).toISOString().split("T")[0]
        : "",
      category: initialData?.category?._id || "",
      uom: initialData?.uom?._id || "",
    };
  }, [initialData]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: defaultValues,
  });

  const selectedCategoryFromForm = watch("category");
  const selectedUOMFromForm = watch("uom");
  useEffect(() => {
    reset(defaultValues);
    setShowNewCategoryInput(false);
    setNewCategoryName("");
    setShowNewUOMInput(false);
    setNewUOMName("");
    setIsStockEnabled(
      initialData?.stock !== undefined &&
        initialData.stock !== null &&
        initialData.stock !== ""
    );
  }, [initialData, defaultValues, reset]);

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("New category name cannot be empty.");
      return null;
    }
    setLoading(true);
    try {
      const newCategory = await ProductApis.addCategory({
        name: newCategoryName.trim(),
      });
      await fetchCategories();
      setValue("category", newCategory._id);
      setShowNewCategoryInput(false);
      setNewCategoryName("");
      return newCategory._id;
    } catch (err) {
      toast.error(`Failed to add new category: ${err.message}`);
      setError(`Failed to add new category: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewUOM = async () => {
    if (!newUOMName.trim()) {
      toast.error("New UOM name is required.");
      return null;
    }
    setLoading(true);
    try {
      const newUOM = await ProductApis.addUOM({
        name: newUOMName.trim(),
      });
      await fetchUOMs();
      setValue("uom", newUOM._id);
      setShowNewUOMInput(false);
      setNewUOMName("");
      return newUOM._id;
    } catch (err) {
      toast.error(`Failed to add new UOM: ${err.message}`);
      setError(`Failed to add new UOM: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateProductCode = () => {
    const newCode = uid(12);
    setValue("code", newCode);
  };

  const handleFormSubmit = async (formData) => {
    toast.dismiss();

    let categoryId = formData.category;
    if (showNewCategoryInput) {
      const newCatId = await handleAddNewCategory();
      if (newCatId) {
        categoryId = newCatId;
      } else {
        return;
      }
    }

    let uomId = formData.uom;
    if (showNewUOMInput) {
      const newUomId = await handleAddNewUOM();
      if (newUomId) {
        uomId = newUomId;
      } else {
        return;
      }
    }

    if (!categoryId) {
      toast.error("Category could not be determined.");
      return;
    }
    if (!uomId) {
      toast.error("UOM could not be determined.");
      return;
    }

    const dataToSubmit = {
      ...formData,
      costprice: parseInt(formData.costprice) || 0,
      saleprice: parseInt(formData.saleprice) || 0,
      stock: isStockEnabled
        ? parseInt(formData.stock)
        : initialData?.stock
        ? initialData.stock.toString()
        : "0",
      category: categoryId,
      uom: uomId,
      expiryDate: formData.expiryDate
        ? new Date(formData.expiryDate).toISOString()
        : null,
    };

    try {
      await onSubmit?.(dataToSubmit);
      const updatedProducts = await ProductApis.searchProducts("");
      setProducts(updatedProducts);
      closeModal();
    } catch (error) {
      console.error("Product submission failed:", error);
      toast.error(
        `Submission failed: ${error.message || "An unexpected error occurred."}`
      );
      setError(
        `Product submission failed: ${
          error.message || "An unexpected error occurred."
        }`
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-3 max-sm:text-sm"
    >
      <input
        type="text"
        placeholder="Product Name *"
        {...register("name")}
        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
      />
      {errors.name && (
        <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Product Code *"
          {...register("code")}
          className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
        />
        <button
          type="button"
          onClick={generateProductCode}
          className={`sm:px-3 px-2 py-2 cursor-pointer rounded text-white text-sm font-semibold transition ${buttonColor}`}
        >
          Generate Code
        </button>
      </div>
      {errors.code && (
        <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>
      )}
      <input
        type="number"
        placeholder="Cost Price (Optional)"
        {...register("costprice")}
        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
      />
      {errors.costprice && (
        <p className="text-red-500 text-xs mt-1">{errors.costprice.message}</p>
      )}
      <input
        type="number"
        placeholder="Sale Price (Optional)"
        {...register("saleprice")}
        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
      />
      {errors.saleprice && (
        <p className="text-red-500 text-xs mt-1">{errors.saleprice.message}</p>
      )}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="enableStock"
          checked={isStockEnabled}
          onChange={(e) => {
            setIsStockEnabled(e.target.checked);
            if (!e.target.checked) {
              setValue(
                "stock",
                initialData?.stock ? initialData.stock.toString() : "0"
              );
            }
          }}
          className="form-checkbox h-4 w-4 text-blue-900/80 rounded"
        />
        <label
          htmlFor="enableStock"
          className="text-sm font-medium text-gray-700"
        >
          Enable Stock Quantity
        </label>
      </div>
      <input
        type="number"
        placeholder="Stock Quantity"
        {...register("stock")}
        disabled={!isStockEnabled}
        className={`w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none ${
          !isStockEnabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      />
      {errors.stock && isStockEnabled && (
        <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>
      )}
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Expiry Date
      </label>
      <input
        type="date"
        placeholder="Expiry Date"
        {...register("expiryDate")}
        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
      />
      {errors.expiryDate && (
        <p className="text-red-500 text-xs mt-1">{errors.expiryDate.message}</p>
      )}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category *
        </label>
        <select
          {...register("category")}
          onChange={(e) => {
            setValue("category", e.target.value);
            if (e.target.value === "add-new") {
              setShowNewCategoryInput(true);
            } else {
              setShowNewCategoryInput(false);
              setNewCategoryName("");
            }
          }}
          value={selectedCategoryFromForm}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
        >
          <option value="">Select Category</option>
          {Array.isArray(categories) &&
            categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          <option value="add-new">-- Add New Category --</option>
        </select>
        {errors.category && (
          <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
        )}

        {showNewCategoryInput && (
          <input
            type="text"
            placeholder="New Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-2 focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
          />
        )}
      </div>
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Unit of Measure (UOM) *
        </label>
        <select
          {...register("uom")}
          onChange={(e) => {
            setValue("uom", e.target.value);
            if (e.target.value === "add-new") {
              setShowNewUOMInput(true);
            } else {
              setShowNewUOMInput(false);
              setNewUOMName("");
            }
          }}
          value={selectedUOMFromForm}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
        >
          <option value="">Select UOM</option>
          {Array.isArray(uoms) &&
            uoms.map((uom) => (
              <option key={uom._id} value={uom._id}>
                {uom.name}
              </option>
            ))}
          <option value="add-new">-- Add New UOM --</option>
        </select>
        {errors.uom && (
          <p className="text-red-500 text-xs mt-1">{errors.uom.message}</p>
        )}

        {showNewUOMInput && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="New UOM Name"
              value={newUOMName}
              onChange={(e) => setNewUOMName(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={closeModal}
          className="px-4 py-2 cursor-pointer rounded bg-gray-300 hover:bg-gray-400 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-4 py-2 cursor-pointer rounded text-white font-semibold transition ${buttonColor}`}
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
