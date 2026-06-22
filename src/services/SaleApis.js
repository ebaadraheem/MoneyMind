import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api`;

const SaleApis = {
  // Fetch all sales
  getAllSales: async () => {
    const response = await axios.get(`${API_BASE_URL}/transactions`);
    return response.data;
  },
  searchSales: async (query) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transactions/search`, {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error("Error searching sales:", error);
      throw error.response?.data || error.message;
    }
  },
  getSaleByInvoiceNumber: async (invoiceNumber) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/transactions/search-by-invoice/${invoiceNumber}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching sales by invoice:", error);
      throw error;
    }
  },
  // Create a new sale return
  createSaleReturn: async (return_data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/sale-return`,
        return_data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating sales return:", error);
      throw error;
    }
  },

  // Get all sales returns (optional, for history)
  getAllSaleReturns: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sale-return`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all sales returns:", error);
      throw error;
    }
  },
 searchSaleReturns: async (query) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sale-return/search/returns`, {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error("Error searching sales returns:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get a single sales return by ID (optional, for viewing details)
  getSaleReturnById: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/sale-return/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching sales return ${id}:`, error);
      throw error;
    }
  },
  getSaleReturnByIdforReport: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/sale-return/report/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching sales return ${id}:`, error);
      throw error;
    }
  },

  // Delete a sales return (use with caution, consider only allowing if stock allows reversal)
  deleteSaleReturn: async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/sale-return/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting sales return ${id}:`, error);
      throw error;
    }
  },
};

export default SaleApis;
