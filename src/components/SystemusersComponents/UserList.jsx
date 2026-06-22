import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import UserApis from "../../services/UserApis";
import useStore from "../../store/useStore";
import UserFormModal from "./UserFormModal";
import { useAuth } from "../../hooks/useAuth";
import Pagination from "../../hooks/usePagination";

const UserList = () => {
  const { setLoading, setError, loading, openModal, userRole , currentPage, setCurrentPage, rowsPerPage } = useStore();
  const [users, setUsers] = useState([]);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const { currentUser, loadingInitial } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to fetch users from the backend
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedUsers = await UserApis.getAllUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      toast.error("Failed to load users.");
      setError("Failed to fetch user list.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle edit user action
  const handleEdit = (user) => {
    setSelectedUserForEdit(user);
    setIsModalOpen(true);
  };

  // Handle add new user action
  const handleAddNewUser = () => {
    setSelectedUserForEdit(null); // Clear selected user for add mode
    setIsModalOpen(true);
  };

  // Handle delete user action
  const handleDelete = (userId, userName, userEmail) => {
    openModal(
      "confirm",
      `Are you sure you want to delete user ${userName} (${userEmail})? This action cannot be undone.`,
      async () => {
        setLoading(true);
        try {
          await UserApis.deleteUser(userId);
          toast.success("User deleted successfully!");
          fetchUsers(); // Refresh the list
        } catch (err) {
          toast.error("Failed to delete user.");
          setError("Failed to delete user: " + err.message);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  // Callback after successful add/edit operation in modal
  const handleUserActionSuccess = () => {
    setSelectedUserForEdit(null);
    setIsModalOpen(false);
    fetchUsers(); // Refresh the user list
  };

  // Close the modal
  const handleCloseModal = () => {
    setSelectedUserForEdit(null);
    setIsModalOpen(false);
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentData = users.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4 flex justify-between flex-wrap gap-2 items-center">
        <h2 className="text-2xl max-sm:text-lg font-bold text-blue-900/90 flex items-center">
          <img
            src="/customer-blue.png" // Placeholder icon, replace with actual path
            alt="User Icon"
            className="w-7 h-7 max-sm:w-6 max-sm:h-6 mr-2"
          />
          Users
        </h2>

        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <button
              onClick={handleAddNewUser}
              className="px-4 py-2 max-sm:text-sm bg-blue-900/80 cursor-pointer text-white rounded-md hover:bg-blue-900/90 transition-colors"
            >
              Add New User
            </button>
          </div>
        </div>
      </div>

      {loading && users.length === 0 ? (
        <p className="text-center text-gray-600">Loading user records...</p>
      ) : (
        <div className="overflow-x-auto max-h-[600px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  S.No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  CNIC
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr className="text-center text-gray-600 ">
                  <td colSpan="7" className=" py-4">
                    No user records found.
                  </td>
                </tr>
              ) : (
                currentData.map((user, index) => (
                  <tr key={user._id} className="hover:bg-gray-50 max-sm:text-xs text-sm">
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {user.email}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role?.name.toLowerCase().includes("admin")
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role?.name || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {user.cnic}
                    </td>
                    {currentUser.uid === user.firebaseUid ? (
                      <td className="px-4 py-2 whitespace-nowrap  font-medium flex justify-center items-center text-gray-700">
                        <span className="px-2 inline-flex  text-xs leading-5 font-semibold bg-red-100 text-red-800 rounded-full">
                          Cannot edit own role
                        </span>
                      </td>
                    ) : user.role?._id === import.meta.env.VITE_ADMIN_ROLE_ID ? (
                      <td className="px-4 py-2 whitespace-nowrap  font-medium flex justify-center items-center text-gray-700">
                        <span className="px-2 inline-flex  text-xs leading-5 font-semibold bg-green-100 text-green-800 rounded-full">
                          Cannot edit/delete
                        </span>
                      </td>
                    ) : (
                      <td className="px-4 py-2 whitespace-nowrap font-medium flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-900/80 cursor-pointer hover:text-blue-900/95 transition-colors"
                          title="Edit"
                        >
                          Edit
                        </button>
                        {user.firebaseUid !== import.meta.env.VITE_ADMIN_ROLE_ID && (
                          <button
                            onClick={() =>
                              handleDelete(user._id, user.name, user.email)
                            }
                            className="text-red-600 cursor-pointer hover:text-red-900 transition-colors"
                            title="Delete"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination data={users} />
        </div>
      )}

      {isModalOpen && (
        <UserFormModal
          user={selectedUserForEdit}
          onClose={handleCloseModal}
          onSuccess={handleUserActionSuccess}
        />
      )}
    </div>
  );
};

export default UserList;
