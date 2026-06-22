import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import useStore from "../../store/useStore";
import AccessControlFormModal from "./AccessControlFormModal";
import api from "../../services/api";
import Pagination from "../../hooks/usePagination";

const AccessControlList = () => {
  const { setLoading, setError, loading, setRoles, currentPage, setCurrentPage, rowsPerPage } = useStore();
  const [Roles, setAllRoles] = useState([]); // State to hold all roles
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedRoles = await api.getAllRoles();
      const rolesWithAccesses = fetchedRoles.filter(
        (role) => role.accesses && role.accesses.length > 0
      );
      setAllRoles(rolesWithAccesses);
      setRoles(fetchedRoles);
    } catch (err) {
      toast.error("Failed to load roles for access control.");
      setError("Failed to fetch roles.");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setRoles]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Handle edit role access action
  const handleEditAccesses = (role) => {
    setSelectedRoleForEdit(role);
    setIsModalOpen(true);
  };

  const handleAccessActionSuccess = () => {
    setSelectedRoleForEdit(null);
    setIsModalOpen(false);
    fetchRoles(); // Refresh the role list
  };

  // Close the modal
  const handleCloseModal = () => {
    setSelectedRoleForEdit(null);
    setIsModalOpen(false);
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentData = Roles.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4 flex justify-between flex-wrap gap-2 items-center">
        <h2 className="text-2xl max-sm:text-lg font-bold text-blue-900/90 flex items-center">
          <img
            src="/ruler-blue.png" // Placeholder icon, replace with actual path
            alt="Access Control Icon"
            className="w-7 h-7 max-sm:w-6 max-sm:h-6 mr-2"
          />
          Access Control
        </h2>

        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <button
              onClick={() => {
                setSelectedRoleForEdit(null); // Ensure add mode
                setIsModalOpen(true);
              }}
              className="px-4 py-2 max-sm:text-sm bg-blue-900/80 cursor-pointer text-white rounded-md hover:bg-blue-900/90 transition-colors"
            >
              Add Role Accesses
            </button>
          </div>
        </div>
      </div>

      {loading && Roles.length === 0 ? (
        <p className="text-center text-gray-600">Loading roles...</p>
      ) : (
        <div className="overflow-x-auto max-h-[600px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  S.No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Role Name
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Roles.length === 0 ? (
                <tr className="text-center text-gray-600 ">
                  <td colSpan="4" className=" py-4">
                    No roles found.
                  </td>
                </tr>
              ) : (
                currentData.map((role, index) => (
                  <tr key={role._id} className="hover:bg-gray-50 max-sm:text-xs text-sm">
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {indexOfFirstRow + index + 1}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  font-medium text-gray-900">
                      {role.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  font-medium flex justify-center gap-2">
                     {role._id === import.meta.env.VITE_ADMIN_ROLE_ID ? (
                        <span className="text-gray-400 cursor-not-allowed">
                          Cannot edit
                        </span>
                      ) : (
                      <button
                        onClick={() => handleEditAccesses(role)}
                        className="text-blue-900/80 cursor-pointer hover:text-blue-900/95 transition-colors"
                        title="Edit Accesses"
                      >
                        Edit
                      </button>
                      )}
                    
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination data={Roles} />
        </div>
      )}

      {isModalOpen && (
        <AccessControlFormModal
          role={selectedRoleForEdit}
          onClose={handleCloseModal}
          onSuccess={handleAccessActionSuccess}
        />
      )}
    </div>
  );
};

export default AccessControlList;
