// src/services/AttendanceApis.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api/attendance`;

const AttendanceApis = {
  // GET attendance records (filtered by date/employee)
  getAttendanceList: async (startDate, endDate) => {
    try {
      const response = await axios.get(API_BASE_URL, {
        params: {
          startDate: startDate.toISOString(), // Send as ISO string
          endDate: endDate.toISOString(), // Fetch for a single day
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching attendance list:", error);
      throw error.response?.data?.message || error.message;
    }
  },

  // GET attendance for a specific date (used by EmployeeAttendance for initial load)
  getAttendanceByDate: async (date) => {
    try {
      const response = await axios.get(API_BASE_URL, {
        params: {
          startDate: date.toISOString(),
          endDate: date.toISOString(),
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching attendance by date:", error);
      throw error.response?.data?.message || error.message;
    }
  },
  getAttendanceReport: async (startDateISO, endDateISO) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/attendance-report`, {
        params: {
          startDate: startDateISO,
          endDate: endDateISO,
        },
      });
      return response.data; 
    } catch (error) {
      console.error("Error fetching attendance report:", error);
      throw error; 
    }
  },
  // POST/PATCH to mark/update daily attendance for a single employee
  markAttendance: async (attendanceData) => {
    try {
      // The backend /mark endpoint handles both creating new or updating existing
      const response = await axios.post(`${API_BASE_URL}/mark`, attendanceData);
      return response.data;
    } catch (error) {
      console.error("Error marking attendance:", error);
      throw error.response?.data?.message || error.message;
    }
  },

  // PATCH to update an existing attendance record (by its ID)
  updateAttendance: async (recordId, updateData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${recordId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating attendance record:", error);
      throw error.response?.data?.message || error.message;
    }
  },

  // DELETE an attendance record
  deleteAttendance: async (recordId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${recordId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting attendance record:", error);
      throw error.response?.data?.message || error.message;
    }
  },
};

export default AttendanceApis;
