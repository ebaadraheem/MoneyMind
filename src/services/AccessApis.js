import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api/roles`;

const AccessApis = {
  // Update a role's accesses
 updateRoleAccesses: async (roleId, payload) => {
    try {
      // The payload will now directly be { accesses: accessesArray, hasAllAccess: hasAllAccess }
      const response = await axios.put(`${API_BASE_URL}/${roleId}/accesses`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating accesses for role ID ${roleId}:`, error);
      throw error;
    }
  },


  // Clear a role's accesses
  clearRoleAccesses: async (roleId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${roleId}/accesses`);
      return response.data;
    } catch (error) {
      console.error(`Error clearing accesses for role ID ${roleId}:`, error);
      throw error;
    }
  },
};

export default AccessApis;