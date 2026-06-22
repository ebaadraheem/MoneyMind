import * as Yup from "yup";

export const expenseSchema = Yup.object().shape({
  description: Yup.string()
    .required("Description is required.")
    .min(3, "Description must be at least 3 characters long."),
  amount: Yup.number()
    .typeError("Amount must be a valid number.")
    .positive("Amount must be a positive number.")
    .required("Amount is required."),
  addedBy: Yup.string()
    .required("Please select an employee who added the expense."),
  category: Yup.string()
    .required("Please select an expense category."),
  date: Yup.date()
    .typeError("Please enter a valid date.")
    .required("Date is required."),
});
