import { auth } from "../firebase";
import useStore from "../store/useStore";
import axios from "axios";
import ProductApis from "./ProductApis";
import { onAuthStateChanged } from "firebase/auth";

const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api`;

const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return user.getIdToken();
  }
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe(); // prevent multiple triggers
      if (user) {
        const token = await user.getIdToken();
        resolve(token);
      } else {
        resolve(null); // user not logged in
      }
    });
  });
};

// This axios instance is now the single source for all API calls.
const apicall = axios.create({
  baseURL: API_BASE_URL,
});

apicall.interceptors.request.use(
  async (config) => {
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// We wrap API calls to handle data extraction and errors consistently.
const apiRequest = async (method, url, data = null, params = null) => {
  try {
    const response = await apicall({
      method,
      url,
      data,
      params,
    });
    return response.data; // Return the data directly
  } catch (error) {
    console.error(
      `API Error on ${method} ${url}:`,
      error.response?.data || error.message
    );
    // Throw a more specific error message from the backend if available
    throw new Error(
      error.response?.data?.message || "An unexpected error occurred."
    );
  }
};

const api = {
  authenticatedFetch: async (url, options = {}) => {
    const token = await getAuthToken();
    const userRole = useStore.getState().userRole;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (userRole) {
      headers["x-user-role"] = userRole;
    }
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    return response.json();
  },

  // --- User & Role Management ---
  getUserProfile: () => apiRequest("get", "/users/profile"),
  getAllUsers: () => apiRequest("get", "/users"),
  updateUserRole: (uid, role) =>
    apiRequest("put", `/users/${uid}/role`, { role }),
  getRoles: () => apiRequest("get", "/roles"),
  getAllRoles: () => apiRequest("get", "/roles/allroles"),
  addRole: (roleData) => apiRequest("post", "/roles", roleData),
  updateRole: (id, roleData) => apiRequest("put", `/roles/${id}`, roleData),
  deleteRole: (id) => apiRequest("delete", `/roles/${id}`),

  // --- Customer Management ---
  searchCustomers: (query) =>
    apiRequest("get", "/customers", null, { search: query }),
  addCustomer: (customerData) => apiRequest("post", "/customers", customerData),
  updateCustomer: (id, customerData) =>
    apiRequest("put", `/customers/${id}`, customerData),
  deleteCustomer: (id) => apiRequest("delete", `/customers/${id}`),

  // --- Sales & Transactions ---
  completeTransaction: (transactionData) =>
    apiRequest("post", "/transactions", transactionData),
  getTodaySales: () => apiRequest("get", "/transactions/today"), // Backend determines user from token
  getAllSales: () => apiRequest("get", "/transactions"), // Backend determines user from token
  deleteTransaction: (id) => apiRequest("delete", `/transactions/${id}`),

  // --- Held Invoices ---
  holdInvoice: (invoiceData) =>
    apiRequest("post", "/held-invoices", invoiceData),
  getHeldInvoices: () => apiRequest("get", "/held-invoices"), // Backend determines user from token
  loadHeldInvoice: (id) => apiRequest("get", `/held-invoices/by-id/${id}`),
  deleteHeldInvoice: (id) => apiRequest("delete", `/held-invoices/${id}`),

  // --- Dashboard & Reports ---
  getDailySalesSummary: () => apiRequest("get", "/dashboard/daily-sales"),
  getMonthlySalesSummary: () => apiRequest("get", "/dashboard/monthly-sales"),
  getAllDetails: () => apiRequest("get", "/dashboard/all-details"),
  getProfitLossReport: (startDate, endDate) =>
    apiRequest("get", "/transactions/profit-loss", null, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
  getBusinessCapitalReport: () =>
    apiRequest("get", "/transactions/business-capital"),

  // --- Initial Data Loading ---
  fetchInitialData: async () => {
    const { setLoading, setError, setProducts, setCustomers, openModal } =
      useStore.getState();
    setLoading(true);
    setError(null);
    try {
      // Use other API service modules for their specific data
      const fetchedProducts = await ProductApis.searchProducts("");
      const fetchedCustomers = await api.searchCustomers("");

      setProducts(fetchedProducts);
      setCustomers(fetchedCustomers);
    } catch (err) {
      setError("Failed to load initial data.");
      openModal(
        "error",
        "Failed to load initial products and customers. Please ensure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  },
};

export default api;
