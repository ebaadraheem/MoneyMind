import { useState, useEffect, useCallback, Fragment } from "react";
import { toast } from "react-hot-toast";
import useStore from "../../store/useStore";
import AccessApis from "../../services/AccessApis";
import { Dialog, Transition } from "@headlessui/react";
import api from "../../services/api";

const ACCESSES_CONFIG = {
  dashboard: ["dashboard"],
  stock: ["stock"],
  people: ["customer-management", "employee-management", "supplier-management"],
  "product-management": ["products", "categories", "uoms"],
  "sales-management": [
    "sales-list",
    "pos-screen",
    "sale-return",
    "sale-return-list",
  ],
  "purchase-management": [
    "purchase-add-stock",
    "purchase-list",
    "purchase-return",
    "purchase-return-list",
  ],
  accounts: ["supplier-accounts", "customer-accounts", "employee-accounts"],
  reports: [
    "purchase-reports-tab",
    "sales-reports-tab",
    "accounts-reports-tab",
    "people-reports-tab",
    "balance-reports-tab",
    "inventory-stock-reports-tab",
    "expense-reports-tab",
    "attendance-reports-tab",
    "profit-loss-reports-tab",
    "business-capital-reports-tab",
  ],
  "expense-management": ["expense-categories", "manage-expenses"],
  attendance: ["employee-attendance", "attendance-list"],
  "system-users": ["user-management", "role-management"],
  configuration: [
    "password-reset",
    "access-control",
    "business-variables",
    "areas",
    "types",
  ],
};

const AccessControlFormModal = ({ role, onClose, onSuccess }) => {
  const {
    setLoading,
    setError,
    loading,
    roles,
    setRoles,
    refreshPermissions,
    userRole,
  } = useStore();
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [Roles, setAllRoles] = useState([]);
  const [selectedAccesses, setSelectedAccesses] = useState(new Set());
  const [hasAllAccess, setHasAllAccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchAllRoles = async () => {
      setLoading(true);
      try {
        const fetchedRoles = await api.getAllRoles();
        const rolesWithoutAccesses = fetchedRoles.filter(
          (role) => !role.accesses || role.accesses.length === 0
        );
        setAllRoles(rolesWithoutAccesses);
        setSelectedRoleId(rolesWithoutAccesses[0]?._id || "");
        setRoles(fetchedRoles);
      } catch (err) {
        toast.error("Failed to load roles for selection.");
        setError("Failed to fetch roles.");
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };
    if (!role || !role._id) {
      fetchAllRoles();
    }
  }, [setRoles, setLoading, setError]);

  useEffect(() => {
    if (role) {
      setIsEditMode(true);
      setSelectedRoleId(role._id);
      setHasAllAccess(role.hasAllAccess || false);
      setSelectedAccesses(
        new Set(role.hasAllAccess ? [] : role.accesses || [])
      );
    } else {
      setIsEditMode(false);
      setSelectedRoleId("");
      setSelectedAccesses(new Set());
      setHasAllAccess(false);
    }
    setShowModal(true);
  }, [role]);

  // Handle role dropdown change
  const handleRoleChange = useCallback(
    (e) => {
      const id = e.target.value;
      setSelectedRoleId(id);
      if (id) {
        const selectedRole = roles.find((r) => r._id === id);
        if (selectedRole) {
          setHasAllAccess(selectedRole.hasAllAccess || false);
          setSelectedAccesses(
            new Set(
              selectedRole.hasAllAccess ? [] : selectedRole.accesses || []
            )
          );
        } else {
          setHasAllAccess(false);
          setSelectedAccesses(new Set());
        }
      } else {
        setHasAllAccess(false);
        setSelectedAccesses(new Set());
      }
    },
    [roles]
  );
  // Handle 'All Access' checkbox change
  const handleAllAccessChange = useCallback((e) => {
    const checked = e.target.checked;
    setHasAllAccess(checked);

    setSelectedAccesses((prevAccesses) => {
      const newAccesses = new Set();
      if (checked) {
        Object.keys(ACCESSES_CONFIG).forEach((parent) => {
          newAccesses.add(parent);
          ACCESSES_CONFIG[parent].forEach((child) => {
            newAccesses.add(child);
          });
        });
      }
      return newAccesses;
    });
  }, []);

  // Handle checkbox change for parent or child accesses
  const handleAccessChange = useCallback((e) => {
    const { name, checked } = e.target;
    setSelectedAccesses((prevAccesses) => {
      const newAccesses = new Set(prevAccesses);

      const isParent = Object.keys(ACCESSES_CONFIG).includes(name);

      if (isParent) {
        if (checked) {
          newAccesses.add(name);
          ACCESSES_CONFIG[name].forEach((child) => newAccesses.add(child));
        } else {
          newAccesses.delete(name);
          ACCESSES_CONFIG[name].forEach((child) => newAccesses.delete(child));
        }
      } else {
        const parentCategory = Object.keys(ACCESSES_CONFIG).find((key) =>
          ACCESSES_CONFIG[key].includes(name)
        );

        if (checked) {
          newAccesses.add(name);
          if (parentCategory) {
            newAccesses.add(parentCategory);
          }
        } else {
          newAccesses.delete(name);
          if (parentCategory) {
            const anyOtherChildSelected = ACCESSES_CONFIG[parentCategory].some(
              (child) => newAccesses.has(child)
            );
            if (!anyOtherChildSelected) {
              newAccesses.delete(parentCategory);
            }
          }
        }
      }
      return newAccesses;
    });
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();

    if (!selectedRoleId) {
      toast.error("Please select a role.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accessesArray = Array.from(selectedAccesses);
      await AccessApis.updateRoleAccesses(selectedRoleId, {
        accesses: accessesArray,
        hasAllAccess: hasAllAccess,
      });
      toast.success("Role accesses updated successfully!");
      if (userRole && userRole._id === selectedRoleId) {
        refreshPermissions();
      }
      onSuccess();
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = "Failed to update role accesses.";

      if (errorData) {
        errorMessage = errorData.message || errorMessage;
      }

      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setTimeout(() => onClose(), 300);
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-md bg-white p-6 text-left align-middle shadow-xl transition-all border-t-4 border-blue-900/90 text-blue-900/80">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6 text-blue-900/90 mb-4"
                >
                  {isEditMode
                    ? `Edit Accesses for ${role?.name}`
                    : "Add Role Accesses"}
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isEditMode && (
                    <div>
                      <label
                        htmlFor="roleSelect"
                        className="block text-sm max-sm:text-xs font-medium text-gray-700 mb-1"
                      >
                        Select Role:
                      </label>
                      <select
                        id="roleSelect"
                        name="roleSelect"
                        value={selectedRoleId}
                        onChange={handleRoleChange}
                        className="mt-1 block max-sm:text-sm w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-900/90 focus:border-blue-900/90 sm:text-sm"
                        disabled={loading || (isEditMode && !!role)}
                        required
                      >
                        {Roles.length === 0 && (
                          <option value="">-- Select a Role --</option>
                        )}
                        {Roles.map((r) => (
                          <option key={r._id} value={r._id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedRoleId && (
                    <div className="border border-gray-200 rounded-md p-4 bg-gray-50 max-h-96 overflow-y-auto">
                      <p className="text-md font-semibold text-gray-800 mb-3">
                        Assign Accesses:
                      </p>

                      {/* All Access Checkbox */}
                      <div className="mb-4 pb-2 border-b border-gray-200">
                        <label className="inline-flex items-center sm:text-xl font-bold text-green-700 cursor-pointer">
                          <input
                            type="checkbox"
                            name="allAccess"
                            checked={hasAllAccess}
                            onChange={handleAllAccessChange}
                            className="form-checkbox h-6 w-6 max-sm:w-5 max-sm:h-5 text-green-600 rounded-md"
                            disabled={loading}
                          />
                          <span className="ml-2">All Access</span>
                        </label>
                        <p className="text-sm text-gray-600 mt-1 ml-8">
                          Checking this will grant all current and future
                          accesses to this role and disable granular selection.
                        </p>
                      </div>

                      {/* Granular Accesses - Disabled if hasAllAccess is true */}
                      <div
                        className={
                          hasAllAccess ? "opacity-50 pointer-events-none" : ""
                        }
                      >
                        {Object.entries(ACCESSES_CONFIG).map(
                          ([parent, children]) => (
                            <div key={parent} className="mb-3">
                              <label className="inline-flex items-center text-lg font-medium text-blue-900/90 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name={parent}
                                  checked={selectedAccesses.has(parent)}
                                  onChange={handleAccessChange}
                                  className="form-checkbox h-5 w-5 max-sm:w-4 max-sm:h-4 text-blue-900/90 rounded-md"
                                  disabled={loading || hasAllAccess} // Disable if all access is true
                                />
                                <span className="ml-2 capitalize">
                                  {parent.replace(/-/g, " ")}
                                </span>
                              </label>
                              <div className="ml-6 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {children.map((child) => (
                                  <label
                                    key={child}
                                    className="inline-flex items-center text-sm text-gray-700 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      name={child}
                                      checked={selectedAccesses.has(child)}
                                      onChange={handleAccessChange}
                                      className="form-checkbox h-4 w-4 max-sm:w-3 max-sm:h-3 text-blue-900/90 rounded-sm"
                                      disabled={loading || hasAllAccess} // Disable if all access is true
                                    />
                                    <span className="ml-2 capitalize">
                                      {child.replace(/-/g, " ")}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-sm cursor-pointer max-sm:text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !selectedRoleId}
                      className="px-4 py-2 cursor-pointer text-sm max-sm:text-xs font-medium text-white bg-blue-900/80 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Saving..." : "Save Changes"}
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

export default AccessControlFormModal;
