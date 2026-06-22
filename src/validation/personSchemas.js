// validations/personSchemas.js
import * as Yup from "yup";

// Reusable phone number validation for main phone
const mainPhoneValidation = Yup.string()
  .required("Phone number is required")
  .matches(/^\d*$/, "Phone must contain only digits") // Allows empty string or digits
  .max(15, "Phone cannot exceed 15 digits");

// Reusable CNIC validation
const cnicValidation = Yup.string()
  .required("CNIC is required")
  .matches(
    /^\d{5}-\d{7}-\d{1}$/,
    "CNIC must be in XXXXX-XXXXXXX-X format (e.g., 34092-7384762-1)"
  )
  .max(15, "CNIC cannot exceed 15 characters (including hyphens)");

// Reusable contact person phone validation (optional, digits only)
const contactPhoneValidation = Yup.string()
  .nullable()
  .transform((value) => (value === "" ? null : value))
  .matches(/^\d*$/, "Phone must contain only digits") // Allows empty string or digits
  .max(15, "Phone cannot exceed 15 digits");

// Base schema for common person fields
const basePersonSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .matches(
      /^[a-zA-Z\s]+$/,
      "Name cannot contain numbers or special characters"
    ),
  fatherName: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value)), // Optional
  email: Yup.string()
    .email("Invalid email format")
    .nullable()
    .transform((value) => (value === "" ? null : value)), // Optional
  phone: mainPhoneValidation, // Reused validation
  cnic: cnicValidation, // Reused validation
  address: Yup.string()
    .required("Address is required")
    .max(100, "Address cannot exceed 100 characters"),
  contactperson1: Yup.object()
    .shape({
      name: Yup.string()
        .nullable()
        .transform((value) => (value === "" ? null : value)), // Optional
      phone: contactPhoneValidation, // Reused validation
    })
    .nullable(), // Entire contactperson1 object is optional
  contactperson2: Yup.object()
    .shape({
      name: Yup.string()
        .nullable()
        .transform((value) => (value === "" ? null : value)), // Optional
      phone: contactPhoneValidation, // Reused validation
    })
    .nullable(), // Entire contactperson2 object is optional
});

// Customer Schema (extends base, no new required fields for now)
export const customerSchema = basePersonSchema;

// Employee Schema (extends base, adds employee-specific fields)
export const employeeSchema = basePersonSchema.shape({
  salary: Yup.number()
    .nullable()
    .transform((value) =>
      isNaN(value) || value === null || value === "" ? null : value
    ) // Handle empty string from input type="number"
    .min(0, "Salary cannot be negative"),
  role: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value)) // Optional role
    .max(50, "Role cannot exceed 50 characters"),
});

// Supplier Schema (extends base, adds supplier-specific fields)
export const supplierSchema = basePersonSchema.shape({
  companyName: Yup.string().required("Company Name is required"),
  website: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  paymentTerms: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
});
