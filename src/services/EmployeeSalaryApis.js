import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api/employee-salaries`;

const EmployeeSalaryApis = {
    // Get single employee details including account summary
    getEmployeeSalaryDetails: async (employeeId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${employeeId}`);
            return response.data; // Should return { employee, employeeAccount }
        } catch (error) {
            console.error("Error fetching employee salary details:", error);
            throw error.response?.data?.message || error.message;
        }
    },

    // Update employee's base salary
    updateEmployeeBaseSalary: async (employeeId, newSalary) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/${employeeId}/base-salary`, { newSalary });
            return response.data;
        } catch (error) {
            console.error("Error updating employee base salary:", error);
            throw error.response?.data?.message || error.message;
        }
    },

    // Get paid salary history for a single employee
    getPaidSalaryHistory: async (employeeId, startDate, endDate) => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate.toISOString();
            if (endDate) params.endDate = endDate.toISOString();
            
            const response = await axios.get(`${API_BASE_URL}/${employeeId}/paid-history`, { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching paid salary history:", error);
            throw error.response?.data?.message || error.message;
        }
    },

    // Process a salary cycle for all employees
    processSalaryCycle: async (year, month, processedByEmployeeId) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/process-cycle`, {
                year,
                month,
                processedBy: processedByEmployeeId,
            });
            return response.data;
        } catch (error) {
            console.error("Error processing salary cycle:", error);
            throw error.response?.data?.message || error.message;
        }
    },

    // Get all past salary cycle records
    getSalaryCycleHistory: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/fetch-salary-cycles`);
            return response.data;
        } catch (error) {
            console.error("Error fetching salary cycle history:", error);
            throw error.response?.data?.message || error.message;
        }
    },

    // Get summary of all employees with their account details (for all employees table)
    getAllEmployeeSalarySummaries: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/all-summary`);
            return response.data;
        } catch (error) {
            console.error("Error fetching all employee salary summaries:", error);
            throw error.response?.data?.message || error.message;
        }
    },
};

export default EmployeeSalaryApis;