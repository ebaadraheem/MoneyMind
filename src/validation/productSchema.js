import * as yup from 'yup';

export const productSchema = yup.object().shape({
  name: yup.string().trim().required("Product name is required."),
  code: yup.string().trim().required("Product code is required."),
  costprice: yup.number()
    .typeError("Cost Price must be a number.") // Ensure it's a number
    .nullable() // Allow null values
    .transform((value, originalValue) => {
      // Transform empty string or non-numeric input to null for validation
      return originalValue === "" || originalValue === undefined || originalValue === null ? null : value;
    })
    .min(0, "Cost Price cannot be negative.") // Ensure it's non-negative
    .max(1000000, "Price cannot exceed 1,000,000.")
    .optional(), // Make it optional
  saleprice: yup.number()
    .typeError("Sale Price must be a number.") // Ensure it's a number
    .nullable() // Allow null values
    .transform((value, originalValue) => {
      // Transform empty string or non-numeric input to null for validation
      return originalValue === "" || originalValue === undefined || originalValue === null ? null : value;
    })
    .min(0, "Sale Price cannot be negative.") // Ensure it's non-negative
    .max(1000000, "Price cannot exceed 1,000,000.")
    .optional(), // Make it optional
  stock: yup.number()
    .typeError("Stock must be a number.")
    .integer("Stock must be an integer.")
    .min(0, "Stock cannot be negative.")
    // .nullable() // Allow null if not enabled, though your frontend sends 0
    .transform((value, originalValue) => {
      // If the original value is an empty string, or undefined/null, treat it as null for validation
      // This helps when the input is disabled and sends "" or if it's optional
      return originalValue === "" || originalValue === undefined || originalValue === null ? null : value;
    })
    .optional(), // Make stock optional, as it can be 0 when disabled by checkbox
  category: yup.string().required("Category is required.").nullable(), // Will hold the _id
  uom: yup.string().required("Unit of Measure is required.").nullable(),
  }).optional();

export const EntitySchema = yup.object().shape({
  name: yup.string()
    .required('name is required')
    .min(1, 'name must be at least 1 character')
    .max(20, 'name cannot exceed 20 characters')
    .matches(/^[a-zA-Z0-9\s]+$/, 'name can only contain letters, numbers, and spaces'),
});
export const expenseSchema = yup.object().shape({
  description: yup.string()
    .required('Description is required')
    .min(2, 'Description must be at least 2 characters')
    .max(100, 'Description cannot exceed 100 characters'),
  amount: yup.number()
    .typeError('Amount must be a number')
    .required('Amount is required')
    .min(0, 'Amount cannot be negative')
    .max(1000000, 'Amount cannot exceed 1,000,000'),
  category: yup.string()
    .required('Category is required')
    .nullable(),
});
