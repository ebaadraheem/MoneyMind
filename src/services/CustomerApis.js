// src/services/CustomerApis.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api`;

const CustomerApis = {
  // --- Customer Account APIs ---
  getCustomerAccount: async (customerId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/customer-accounts/${customerId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching customer account:", error);
      throw error.response?.data?.message || error.message;
    }
  },

  getPaymentsForCustomer: async (customerId, startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const response = await axios.get(
        `${API_BASE_URL}/customer-accounts/${customerId}/payments`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching payments for customer:", error);
      throw error.response?.data?.message || error.message;
    }
  },
  getCustomerTransactionsForReport: async (customerId, dates) => {
    try {
      const { startDate, endDate } = dates; // Destructure the dates from the object

      const params = {};
      // No need for .toISOString() since they are already strings
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(
        `${API_BASE_URL}/customer-accounts/${customerId}/payments`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },
  makePaymentToCustomer: async (paymentData) => {
    try {
      const {
        accountId, // This should be customerId
        amount,
        paymentMethod,
        referenceNumber,
        notes,
      } = paymentData;

      const response = await axios.post(
        `${API_BASE_URL}/customer-accounts/${accountId}/payments`,
        {
          amount,
          paymentMethod,
          referenceNumber,
          notes,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error making payment to customer:", error);
      throw error.response?.data?.message || error.message;
    }
  },

  // --- Customer (General) APIs ---
  getAllCustomersWithAccounts: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/customer-accounts/with-accounts`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all customers with accounts:", error);
      throw error.response?.data?.message || error.message;
    }
  },
  getCustomerPayables: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/customer-accounts/customers/payables`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching customer payables:", error);
      throw error.response?.data?.message || error.message;
    }
  },

  getCustomerReceivables: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/customer-accounts/customers/receivables`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching customer receivables:", error);
      throw error.response?.data?.message || error.message;
    }
  },

  deleteCustomer: async (customerId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/customers/${customerId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error.response?.data?.message || error.message;
    }
  },
  getSalesTransactionReport: async ({ customerId, startDate, endDate }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/customer-accounts/${customerId}/sales-reports`,
        {
          params: {
            startDate,
            endDate,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching sales transaction report:", error);
      throw error.response?.data?.message || error.message;
    }
  },
  getSalesDetailsReport: async ({
    customerId,
    productId,
    startDate,
    endDate,
  }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/customer-accounts/${customerId}/detail-sales-report`,
        {
          params: {
            productId,
            startDate,
            endDate,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching sales details report:", error);
      throw error.response?.data?.message || error.message;
    }
  },
  getSalesSummaryReport: async ({ customerId, startDate, endDate }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/customer-accounts/${customerId}/sales-summary-report`,
        {
          params: {
            startDate,
            endDate,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching sales summary report:", error);
      throw error.response?.data?.message || error.message;
    }
  },
};

export default CustomerApis;
