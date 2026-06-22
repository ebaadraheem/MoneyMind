import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api`;

const SupplierApis = {
  // --- Supplier Account APIs ---
  getSupplierAccount: async (supplierId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/supplier-accounts/${supplierId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  getPaymentsForSupplier: async (supplierId, startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const response = await axios.get(
        `${API_BASE_URL}/supplier-accounts/${supplierId}/payments`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },
  getPaymentsForSupplierReports: async (supplierId, dates) => {
    // Changed to accept a 'dates' object
    try {
      const { startDate, endDate } = dates; // Destructure the dates from the object

      const params = {};
      // No need for .toISOString() since they are already strings
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(
        `${API_BASE_URL}/supplier-accounts/${supplierId}/payments`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },
  // --- Supplier (General) APIs ---
  getAllSuppliersWithAccounts: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/supplier-accounts/with-accounts`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },
  getSupplierPayables: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/supplier-accounts/supplier/payables`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },
  getSupplierReceivables: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/supplier-accounts/supplier/receivables`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  deleteSupplier: async (supplierId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/suppliers/${supplierId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },
  makePaymentToSupplier: async (paymentData) => {
    try {
      const { accountId, amount, paymentMethod, referenceNumber, notes } =
        paymentData;

      const response = await axios.post(
        `${API_BASE_URL}/supplier-accounts/${accountId}/payments`,
        {
          amount,
          paymentMethod,
          referenceNumber,
          notes,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error making payment:", error);
      throw error.response?.data?.message || error.message;
    }
  },
  getPurchaseTransactionReport: async ({ supplierId, startDate, endDate }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/supplier-accounts/${supplierId}/purchase-reports`,
        {
          params: {
            startDate,
            endDate,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },
  getPurchaseDetailsReport: async ({
    supplierId,
    startDate,
    endDate,
    productId,
  }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/supplier-accounts/${supplierId}/detail-purchase-report`,
        {
          params: {
            startDate,
            endDate,
            productId,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },
  getPurchaseSummaryReport: async ({ supplierId, startDate, endDate }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/supplier-accounts/${supplierId}/purchase-summary-report`,
        {
          params: {
            startDate,
            endDate,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase summary report:", error);
      throw error.response?.data?.message || error.message;
    }
  },
};

export default SupplierApis;
