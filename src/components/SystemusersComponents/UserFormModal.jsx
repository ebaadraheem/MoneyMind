import React, { useState, useEffect, useCallback, Fragment } from "react";
import { toast } from "react-hot-toast";
import useStore from "../../store/useStore";
import UserApis from "../../services/UserApis";
import { Dialog, Transition } from "@headlessui/react";
import api from "../../services/api";

const UserFormModal = ({ user, onClose, onSuccess }) => {
  const { setLoading, setError, loading, roles, setRoles, userRole } =
    useStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: {
      _id: "",
      name: "",
    },
    cnic: "",
    contactNo: "",
    password: "",
    confirmPassword: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (user && roles.length > 0) {
      const fullRoleObject = roles.find((r) => r._id === user.role?._id);
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        role: fullRoleObject
          ? { _id: fullRoleObject._id, name: fullRoleObject.name }
          : { _id: "", name: "" },
        cnic: user.cnic || "",
        contactNo: user.contactNo || "",
        password: "",
        confirmPassword: "",
      }));
      setIsEditMode(true);
    } else if (!user && roles.length > 0 && formData.role._id === "") {
      setFormData({
        name: "",
        email: "",
        role: {
          _id: roles[0]._id || "",
          name: roles[0].name || "",
        },
        cnic: "",
        contactNo: "",
        password: "",
        confirmPassword: "",
      });
      setIsEditMode(false);
    }
    setShowModal(true);
  }, [user, roles]);

  useEffect(() => {
    if (roles.length === 0) {
      const fetchRoles = async () => {
        setLoading(true);
        try {
          const fetchedRoles = await api.getAllRoles();
          setRoles(fetchedRoles);
        } catch (err) {
          toast.error("Failed to load roles.");
          setError("Failed to fetch roles.");
          setRoles([]);
        } finally {
          setLoading(false);
        }
      };
      fetchRoles();
    }
  }, []);

  const handleFormChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (name === "role") {
        const selectedRole = roles.find((role) => role._id === value);
        setFormData((prev) => ({
          ...prev,
          role: selectedRole || { _id: "", name: "" },
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [roles]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss(); // Dismiss any existing toasts

    setLoading(true);
    setError(null);

    const { name, email, role, cnic, contactNo, password, confirmPassword } =
      formData;

    // Basic validation
    if (!name || !email || !role || !cnic || !contactNo) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (!isEditMode) {
      if (!password || !confirmPassword) {
        toast.error("Please enter and confirm password.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        setLoading(false);
        return;
      }
    }
    if (role._id === "") {
      toast.error("Please select a valid role.");
      setLoading(false);
      return;
    }
    const cleanedContactNo = contactNo.replace(/\D/g, ""); // Remove non-digits
    if (cleanedContactNo.length !== 11) {
      toast.error("Contact number must be exactly 11 digits.");
      setLoading(false);
      return;
    }
    try {
      if (isEditMode) {
        const updatedUser = {
          name,
          role,
          cnic,
          contactNo: cleanedContactNo,
        };
        await UserApis.updateUser(user._id, updatedUser);
        toast.success("User updated successfully!");
      } else {
        const newUser = {
          name,
          email,
          role,
          cnic,
          contactNo: cleanedContactNo,
          password,
        };
        await UserApis.createUser(newUser);
        toast.success("New user added successfully!");
      }
      onSuccess(); // Call success callback to refresh list and close modal
    } catch (err) {
      console.error("Error aya bhai:", err);
      toast.error(`${err.response?.data?.message || err.message}`);
      setError(`${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setTimeout(() => onClose(), 300); // Allow transition to finish
  }, [onClose]);

  if (!showModal) return null;

  return (
    <Transition appear show={showModal} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-md bg-white p-6 text-left align-middle shadow-xl transition-all border-t-4 border-blue-900/90 text-blue-900/80">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6 text-blue-900/90 mb-4"
                >
                  {isEditMode ? "Edit User" : "Add New User"}
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="sm:space-y-4 space-y-3">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm max-sm:text-xs font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="mt-1 block w-full max-sm:text-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-900/90 focus:border-blue-900/90 sm:text-sm"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm max-sm:text-xs font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="mt-1 block max-sm:text-sm w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-900/90 focus:border-blue-900/90 sm:text-sm"
                      required
                      disabled={isEditMode || loading} // Disable email input in edit mode
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm max-sm:text-xs font-medium text-gray-700"
                    >
                      Role
                    </label>
                 
                    <select
                      id="role"
                      name="role"
                      value={formData.role._id}
                      onChange={handleFormChange}
                      className="mt-1 block w-full max-sm:text-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-900/90 focus:border-blue-900/90 sm:text-sm"
                      disabled={loading}
                    >
                      {" "}
                      {roles.map((role) => (
                        <option key={role._id} value={role._id}>
                          {role.name}{" "}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="cnic"
                      className="block text-sm max-sm:text-xs font-medium text-gray-700"
                    >
                      CNIC
                    </label>
                    <input
                      type="text"
                      id="cnic"
                      name="cnic"
                      value={formData.cnic}
                      onChange={handleFormChange}
                      className="mt-1 block max-sm:text-sm w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-900/90 focus:border-blue-900/90 sm:text-sm"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contactNo"
                      className="block text-sm max-sm:text-xs font-medium text-gray-700"
                    >
                      Contact No.
                    </label>
                    <input
                      type="text"
                      id="contactNo"
                      maxLength={11}
                      name="contactNo"
                      value={formData.contactNo}
                      onChange={handleFormChange}
                      className="mt-1 block max-sm:text-sm w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-900/90 focus:border-blue-900/90 sm:text-sm"
                      required
                      disabled={loading}
                    />
                  </div>

                  {!isEditMode && (
                    <>
                      <div>
                        <label
                          htmlFor="password"
                          className="block text-sm max-sm:text-xs font-medium text-gray-700"
                        >
                          Password
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleFormChange}
                          className="mt-1 block max-sm:text-sm w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-900/90 focus:border-blue-900/90 sm:text-sm"
                          required={!isEditMode}
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm max-sm:text-xs font-medium text-gray-700"
                        >
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleFormChange}
                          className="mt-1 block max-sm:text-sm w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-900/90 focus:border-blue-900/90 sm:text-sm"
                          required={!isEditMode}
                          disabled={loading}
                        />
                      </div>
                    </>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-sm max-sm:text-xs cursor-pointer font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 cursor-pointer text-sm max-sm:text-xs font-medium text-white bg-blue-900/80 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? "Saving..."
                        : isEditMode
                        ? "Save Changes"
                        : "Add User"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default UserFormModal;
