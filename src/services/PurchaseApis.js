// services/PurchaseApis.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api`;

const PurchaseApis = {
  // Create a new purchase
  createPurchase: async (purchaseData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/purchases`,
        purchaseData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating purchase:", error);
      throw error.response?.data || error.message;
    }
  },
  searchPurchases: async (query) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/purchases/search`, {
        params: { query },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching purchases:", error);
      throw error.response?.data || error.message;
    }
  },
  // Fetch all purchases
  getAllPurchases: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/purchases`);
      return response.data;
    } catch (error) {
      console.error("Error fetching purchases:", error);
      throw error.response?.data || error.message;
    }
  },
  downloadAllPurchases: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/purchases/download`, {
        responseType: "blob", // Important for file download
      });
      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "purchases.xlsx"); // Set default file name
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading all purchases:", error);
      throw error.response?.data || error.message;
    }
  },
  // delete a purchase by ID
  deletePurchase: async (purchaseId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/purchases/${purchaseId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting purchase:", error);
      throw error.response?.data || error.message;
    }
  },
  getPurchaseByInvoiceNumber: async (invoiceNumber) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/purchases/search-by-invoice/${invoiceNumber}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching purchases by invoice:", error);
      throw error;
    }
  },

  // Create a new purchase return
  createPurchaseReturn: async (return_data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/purchase-returns`,
        return_data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating purchase return:", error);
      throw error;
    }
  },
  searchPurchaseReturns: async (query) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/purchase-returns/search/returns`, {
          params: { query },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error searching purchase returns:", error);
      throw error.response?.data || error.message;
    }
  },
  // Get all purchase returns (optional, for history)
  getAllPurchaseReturns: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/purchase-returns`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all purchase returns:", error);
      throw error;
    }
  },

  // Get a single purchase return by ID (optional, for viewing details)
  getPurchaseReturnById: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/purchase-returns/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching purchase return ${id}:`, error);
      throw error;
    }
  },

  // Delete a purchase return (use with caution, consider only allowing if stock allows reversal)
  deletePurchaseReturn: async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/purchase-returns/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting purchase return ${id}:`, error);
      throw error;
    }
  },
};

export default PurchaseApis;
