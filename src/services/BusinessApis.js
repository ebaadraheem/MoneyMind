import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api/business`;

const BusinessApis = {
  getDetails: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  addDetails: async (details) => {
    try {
      const response = await axios.post(API_BASE_URL, details);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  updateDetails: async (id, details) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${id}`, details);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  deleteDetails: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },
  uploadLogo: async (logoFile) => {
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);

      const response = await axios.post(
        `${API_BASE_URL}/upload-logo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.logoUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      throw error.response?.data?.message || error.message;
    }
  },
};

export default BusinessApis;
