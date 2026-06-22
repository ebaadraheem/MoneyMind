import api from "./api";
const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api`;
const TypesApis = {
  searchCategory: async (query = "") =>
    api.authenticatedFetch(`${API_BASE_URL}/types-category`, {
      method: "GET",
    }),
  addCategory: async (categoryData) =>
    api.authenticatedFetch(`${API_BASE_URL}/types-category`, {
      method: "POST",
      body: JSON.stringify(categoryData),
    }),
  updateCategory: async (id, categoryData) =>
    api.authenticatedFetch(`${API_BASE_URL}/types-category/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    }),
  deleteCategory: async (id) =>
    api.authenticatedFetch(`${API_BASE_URL}/types-category/${id}`, {
      method: "DELETE",
    }),
};

export default TypesApis;
