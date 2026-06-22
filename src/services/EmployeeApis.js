// src/services/EmployeeApis.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api`;

const EmployeeApis = {
  // --- Employee Account APIs ---
  getEmployeeAccount: async (employeeId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/employee-accounts/${employeeId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching employee account:", error);
      throw error.response?.data?.message || error.message;
    }
  },
  getEmployeeTransactionsForReport: async (employeeId, dates) => {
    try {
      const { startDate, endDate } = dates; // Destructure the dates from the
      const params = {};
      // No need for .toISOString() since they are already strings
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await axios.get(
        `${API_BASE_URL}/employee-accounts/${employeeId}/payments`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching employee transactions for report:", error);
      throw error.response?.data?.message || error.message;
    }
  },

  getPaymentsForEmployee: async (employeeId, startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const response = await axios.get(
        `${API_BASE_URL}/employee-accounts/${employeeId}/payments`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching payments for employee:", error);
      throw error.response?.data?.message || error.message;
    }
  },

  makePaymentToEmployee: async (paymentData) => {
    try {
      const {
        accountId, // This should be employeeId
        amount,
        paymentMethod,
        referenceNumber,
        notes,
      } = paymentData;

      const response = await axios.post(
        `${API_BASE_URL}/employee-accounts/${accountId}/payments`,
        {
          amount,
          paymentMethod,
          referenceNumber,
          notes,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error making payment to employee:", error);
      throw error.response?.data?.message || error.message;
    }
  },

  // --- Employee (General) APIs ---
  getAllEmployeesWithAccounts: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/employee-accounts/with-accounts`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all employees with accounts:", error);
      throw error.response?.data?.message || error.message;
    }
  },
  getEmployeePayables: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/employee-accounts/employee/payables`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching employee payables:", error);
      throw error.response?.data?.message || error.message;
    }
  },

  getEmployeeReceivables: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/employee-accounts/employee/receivables`
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

  deleteEmployee: async (employeeId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/employees/${employeeId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting employee:", error);
      throw error.response?.data?.message || error.message;
    }
  },
};

export default EmployeeApis;
