import api from "./api";

const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api`;
const ProductApis = {

     // Products (Read accessible to all authenticated, CRUD for admin)
  searchProducts: async (query) => {
    return api.authenticatedFetch(`${API_BASE_URL}/products?search=${query}`);
  },
  getProductById: async (id) => {
    return api.authenticatedFetch(`${API_BASE_URL}/products/${id}`);
  },
  addProduct: async (productData) => {
    return api.authenticatedFetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },
  updateProduct: async (id, productData) => { // Added update
    return api.authenticatedFetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },
  deleteProduct: async (id) => { // Added delete
    return api.authenticatedFetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
  },

    // --- NEW: Categories API ---
    getCategories: async (query = '') => api.authenticatedFetch(`${API_BASE_URL}/categories?search=${query}`),
    addCategory: async (categoryData) => api.authenticatedFetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
    }),
    updateCategory: async (id, categoryData) => api.authenticatedFetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
    }),
    deleteCategory: async (id) => api.authenticatedFetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
    }),

    // --- NEW: UOMs API ---
    getUOMs: async (query = '') => api.authenticatedFetch(`${API_BASE_URL}/uoms?search=${query}`),
    addUOM: async (uomData) => api.authenticatedFetch(`${API_BASE_URL}/uoms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uomData),
    }),
    updateUOM: async (id, uomData) => api.authenticatedFetch(`${API_BASE_URL}/uoms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uomData),
    }),
    deleteUOM: async (id) => api.authenticatedFetch(`${API_BASE_URL}/uoms/${id}`, {
        method: 'DELETE',
    }),

}
export default ProductApis;