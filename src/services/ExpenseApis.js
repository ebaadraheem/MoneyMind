import api from "./api";

const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api`;
const searchAllExpenses = async () => {
  return api.authenticatedFetch(`${API_BASE_URL}/expenses`);
};
const addExpense = async (expenseData) => {
  return api.authenticatedFetch(`${API_BASE_URL}/expenses/`, {
    method: "POST",
    body: JSON.stringify(expenseData),
  });
};
const updateExpense = async (id, expenseData) => {
  return api.authenticatedFetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(expenseData),
  });
};
const deleteExpense = async (id) => {
  return api.authenticatedFetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "DELETE",
  });
};
// --- Expense Categories API ---
const getExpenseCategories = async (query = "") =>
  api.authenticatedFetch(`${API_BASE_URL}/expense-category?search=${query}`);
const addExpenseCategory = async (categoryData) =>
  api.authenticatedFetch(`${API_BASE_URL}/expense-category`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoryData),
  });
const updateExpenseCategory = async (id, categoryData) =>
  api.authenticatedFetch(`${API_BASE_URL}/expense-category/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoryData),
  });
const deleteExpenseCategory = async (id) =>
  api.authenticatedFetch(`${API_BASE_URL}/expense-category/${id}`, {
    method: "DELETE",
  });

const getExpenseSummaryReport = async (startDate, endDate) => {
  const query = new URLSearchParams();
  if (startDate) query.append("startDate", startDate);
  if (endDate) query.append("endDate", endDate);
  return api.authenticatedFetch(
    `${API_BASE_URL}/expenses/summary-by-category?${query.toString()}`
  );
};
const getExpenseDetailsReport = async (categoryId, startDate, endDate) => {
  const query = new URLSearchParams();
  if (startDate) query.append("startDate", startDate);
  if (endDate) query.append("endDate", endDate);
  return api.authenticatedFetch(
    `${API_BASE_URL}/expenses/expense-details/${categoryId}?${query.toString()}`
  );
};


const ExpenseApis = {
  searchAllExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseCategories,
  addExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  getExpenseSummaryReport,
  getExpenseDetailsReport,
};

export default ExpenseApis;
