import React, { useEffect, useState, useMemo ,useCallback} from "react";
import useStore from "../../store/useStore";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import AreaApis from "../../services/AreaApis";
import TypesApis from "../../services/TypesApis";
import {
  customerSchema,
  supplierSchema,
  employeeSchema,
} from "../../validation/personSchemas";

// Helper to capitalize strings
const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

const getErrorFromPath = (errors, path) => {
  if (!path || !errors) return undefined;
  return path
    .split(".")
    .reduce((o, key) => (o && o[key] ? o[key] : undefined), errors);
};
// A reusable input field component for cleaner form structure
const FormInput = ({
  label,
  name,
  register,
  errors,
  type = "text",
  placeholder,
  isRequired = false,
}) => {
  // UPDATED: Use the helper function to find the specific error message
  const error = getErrorFromPath(errors, name);

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
        {...register(name)}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
};

// A reusable select field component
const FormSelect = ({
  label,
  name,
  register,
  errors,
  options,
  placeholder,
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <select
      id={name}
      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
      {...register(name)}
    >
      <option value="">{placeholder || `Select ${label}`}</option>
      {options?.map((option) => (
        <option key={option._id} value={option._id}>
          {option.name}
        </option>
      ))}
    </select>
    {errors[name] && (
      <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>
    )}
  </div>
);

const PersonFormModal = () => {
  const {
    personFormModal,
    closePersonFormModal,
    typesList,
    areasList,
    setAreasList,
    setTypesList,
  } = useStore();

  const [show, setShow] = useState(false);
  const { isOpen, type, onSubmit, initialData } = personFormModal;

  // Dynamically select the validation schema based on the person type
  const validationSchema = useMemo(() => {
    switch (type) {
      case "customer":
        return customerSchema;
      case "employee":
        return employeeSchema;
      case "supplier":
        return supplierSchema;
      default:
        return Yup.object().shape({});
    }
  }, [type]);

  // Memoize default form values to prevent unnecessary recalculations
  const defaultFormValues = useMemo(
    () => ({
      name: initialData?.name || "",
      fatherName: initialData?.fatherName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      cnic: initialData?.cnic || "",
      address: initialData?.address || "",
      areaId: initialData?.areaId?._id || "",
      typeId: initialData?.typeId?._id || "",
      contactperson1: {
        name: initialData?.contactperson1?.name || "",
        phone: initialData?.contactperson1?.phone || "",
      },
      contactperson2: {
        name: initialData?.contactperson2?.name || "",
        phone: initialData?.contactperson2?.phone || "",
      },
      salary: initialData?.salary || "",
      role: initialData?.role || "",
      hireDate: initialData?.hireDate
        ? new Date(initialData.hireDate).toISOString().split("T")[0]
        : "",
      companyName: initialData?.companyName || "",
      website: initialData?.website || "",
      paymentTerms: initialData?.paymentTerms || "",
    }),
    [initialData]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: defaultFormValues,
  });

  const fetchAreas = useCallback(async () => {
    try {
      const response = await AreaApis.searchCategory("");
      setAreasList(response);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  }, [setAreasList]);

  const fetchPersonTypes = useCallback(async () => {
    try {
      const response = await TypesApis.searchCategory("");
      setTypesList(response);
    } catch (error) {
      console.error("Error fetching person types:", error);
    }
  }, [setTypesList]);

useEffect(() => {
  const loadData = async () => {
    if (!areasList || areasList.length === 0) {
      try {
        const fetchPromise = fetchAreas(); 
      } catch (error) {
        console.error("Failed to fetch areas inside useEffect:", error);
      }
    }

    if (!typesList || typesList.length === 0) {
      try {
        const fetchPromise = fetchPersonTypes(); 
      } catch (error) {
        console.error(
          "Failed to fetch person types inside useEffect:",
          error
        );
      }
    }
  };

  if (isOpen) {
    setShow(true);
    reset(defaultFormValues);
    loadData();
  } else {
    setShow(false);
  }
}, [isOpen, defaultFormValues, reset, areasList, typesList, fetchAreas, fetchPersonTypes]);


  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      closePersonFormModal();
      reset();
    }, 300); 
  };

  const onFormSubmit = async (formData) => {
    toast.dismiss();
    try {
      if (!formData.areaId) {
        formData.areaId = null;
      }
      if (!formData.typeId) {
        formData.typeId = null;
      }
      await onSubmit?.(formData);
      handleClose();
    } catch (error) {
      console.error("API submission failed:", error);
      toast.error(
        `Submission failed: ${error.message || "An unexpected error occurred."}`
      );
    }
  };

  const modalTitle = useMemo(() => {
    const action = initialData ? "Edit" : "Add New";
    return `${action} ${capitalize(type)}`;
  }, [type, initialData]);

  if (!isOpen && !show) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-gray-900 transition-opacity duration-300 ${
          show ? "opacity-75" : "opacity-0"
        }`}
        onClick={handleClose}
      />
      {/* Modal Content */}
      <div
        className={`relative w-full max-w-2xl transform transition-all duration-300 ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="bg-white max-h-[90vh] overflow-y-auto border-t-4 border-blue-900/90 text-blue-900/80 rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-bold mb-6">{modalTitle}</h2>

          <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Core Info */}
              <FormInput
                label="Name"
                name="name"
                register={register}
                errors={errors}
                isRequired
              />
              <FormInput
                label="Father Name"
                name="fatherName"
                register={register}
                errors={errors}
              />
              <FormInput
                label="Phone"
                name="phone"
                register={register}
                errors={errors}
                isRequired
              />
              <FormInput
                label="CNIC"
                name="cnic"
                register={register}
                errors={errors}
                placeholder="XXXXX-XXXXXXX-X"
                isRequired
              />
              <FormInput
                label="Email"
                name="email"
                register={register}
                errors={errors}
                type="email"
              />

              {/* Optional Dropdowns */}
              <FormSelect
                label="Area (Optional)"
                name="areaId"
                register={register}
                errors={errors}
                options={areasList}
                placeholder="Select Area"
              />

              {/* Conditional Fields: Employee */}
              {type === "employee" && (
                <>
                  <FormInput
                    label="Salary"
                    name="salary"
                    register={register}
                    errors={errors}
                    type="number"
                  />
                  <FormInput
                    label="Role"
                    name="role"
                    register={register}
                    errors={errors}
                    placeholder="e.g., Manager"
                  />
                  <FormInput
                    label="Hire Date"
                    name="hireDate"
                    register={register}
                    errors={errors}
                    type="date"
                  />
                  {/* <FormSelect
                    label="Employee Type (Optional)"
                    name="typeId"
                    register={register}
                    errors={errors}
                    options={typesList}
                    placeholder="Select Type"
                  /> */}
                </>
              )}

              {/* Conditional Fields: Supplier */}
              {type === "supplier" && (
                <>
                  <FormInput
                    label="Company Name"
                    name="companyName"
                    register={register}
                    errors={errors}
                    isRequired
                  />
                  <FormInput
                    label="Website"
                    name="website"
                    register={register}
                    errors={errors}
                    placeholder="https://example.com"
                  />
                  <FormInput
                    label="Payment Terms"
                    name="paymentTerms"
                    register={register}
                    errors={errors}
                    placeholder="e.g., Net 30"
                  />
                </>
              )}
              {/* Conditional Fields: Customer Type */}
              {type === "customer" && (
                <div className="md:col-span-2">
                  <FormSelect
                    label="Customer Type (Optional)"
                    name="typeId"
                    register={register}
                    errors={errors}
                    options={typesList}
                    placeholder="Select Type"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <FormInput
                  label="Address"
                  name="address"
                  register={register}
                  errors={errors}
                  isRequired
                />
              </div>

              {/* Contact Person 1 */}
              <div className="md:col-span-2 border p-4 rounded-md">
                <p className="font-semibold text-md mb-2">Contact Person 1</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <FormInput
                    label="Name"
                    name="contactperson1.name"
                    register={register}
                    errors={errors}
                  />
                  <FormInput
                    label="Phone"
                    name="contactperson1.phone"
                    register={register}
                    errors={errors}
                  />
                </div>
              </div>

              {/* Contact Person 2 */}
              <div className="md:col-span-2 border p-4 rounded-md">
                <p className="font-semibold text-md mb-2">Contact Person 2</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <FormInput
                    label="Name"
                    name="contactperson2.name"
                    register={register}
                    errors={errors}
                  />
                  <FormInput
                    label="Phone"
                    name="contactperson2.phone"
                    register={register}
                    errors={errors}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 cursor-pointer bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 rounded-md transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 cursor-pointer bg-blue-900/90 text-white font-semibold hover:bg-blue-900 rounded-md transition-all"
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

export default PersonFormModal;
