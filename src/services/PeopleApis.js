import api from "./api";

const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api`;
const PeopleApis = {
  // Customers (Read accessible to all authenticated, CRUD for admin/employee add)
  searchCustomers: async (query) => {
    return api.authenticatedFetch(`${API_BASE_URL}/customers?search=${query}`);
  },
  addCustomer: async (customerData) => {
    return api.authenticatedFetch(`${API_BASE_URL}/customers`, {
      method: "POST",
      body: JSON.stringify(customerData),
    });
  },
  updateCustomer: async (id, customerData) => {
    // Added update
    return api.authenticatedFetch(`${API_BASE_URL}/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(customerData),
    });
  },
  deleteCustomer: async (id) => {
    return api.authenticatedFetch(`${API_BASE_URL}/customers/${id}`, {
      method: "DELETE",
    });
  },
  // Employees (Read accessible to all authenticated, CRUD for admin)
  searchEmployees: async (query) => {
    return api.authenticatedFetch(`${API_BASE_URL}/employees?search=${query}`);
  },
  addEmployee: async (employeeData) => {
    return api.authenticatedFetch(`${API_BASE_URL}/employees`, {
      method: "POST",
      body: JSON.stringify(employeeData),
    });
  },
  updateEmployee: async (id, employeeData) => {
    // Added update
    return api.authenticatedFetch(`${API_BASE_URL}/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(employeeData),
    });
  },
  deleteEmployee: async (id) => {
    // Added delete
    return api.authenticatedFetch(`${API_BASE_URL}/employees/${id}`, {
      method: "DELETE",
    });
  },
  // Suppliers (Read accessible to all authenticated, CRUD for admin)
  searchSuppliers: async (query) => {
    return api.authenticatedFetch(`${API_BASE_URL}/suppliers?search=${query}`);
  },
  addSupplier: async (supplierData) => {
    return api.authenticatedFetch(`${API_BASE_URL}/suppliers`, {
      method: "POST",
      body: JSON.stringify(supplierData),
    });
  },
  updateSupplier: async (id, supplierData) => {
    // Added update
    return api.authenticatedFetch(`${API_BASE_URL}/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(supplierData),
    });
  },
  deleteSupplier: async (id) => {
    // Added delete
    return api.authenticatedFetch(`${API_BASE_URL}/suppliers/${id}`, {
      method: "DELETE",
    });
  },
};
export default PeopleApis;
