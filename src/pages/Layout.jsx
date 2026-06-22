import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import useStore from "../store/useStore";
import Login from "./Login";
import Sidebar from "../components/SideBar";
import MessageModal from "../utils/MessageModal";
import { signOut } from "firebase/auth";
import AdminDashboard from "../SideBar/Dashboard";
import api from "../services/api";
import toast from "react-hot-toast";
import { auth } from "../firebase";
import PersonFormModal from "../components/PeopleComponents/PersonFormModal";
import PersonDetailModal from "../components/PeopleComponents/PersonDetailModal";
import PeopleManagementSection from "../SideBar/PeopleManagementSection";
import ProductManagementSection from "../SideBar/ProductManagementSection";
import CategoryUomFormModal from "../components/ProductComponents/CategoryUomFormModal";
import ProductFormModal from "../components/ProductComponents/ProductFormModal";
import ExpenseFormModal from "../components/ExpenseComponents/ExpenseFormModal";
import ExpenseDetailModal from "../components/ExpenseComponents/ExpenseDetailModal";
import ProductApis from "../services/ProductApis";
import StockManagement from "../SideBar/StockManagement";
import PurchaseManagementSection from "../SideBar/PurchaseManagementSection";
import AccountManagement from "../SideBar/AccountManagement";
import ReportManagement from "../SideBar/ReportsManagementSection";
import SalesManagementSection from "../SideBar/SalesManagementSection";
import ExpenseManagementSection from "../SideBar/ExpenseManagementSection";
import { useNavigate } from "react-router-dom";
import AttendanceManagement from "../SideBar/AttendanceManagement";
import SystemUserManagement from "../SideBar/SystemUserManagement";
import ConfigurationManagement from "../SideBar/ConfigurationManagement";
import ALL_NAV_ITEMS from "../utils/AllNavItems";

const ALL_APP_SCREENS = {
  dashboard: AdminDashboard,
  stock: StockManagement,
  "sales-management": SalesManagementSection,
  "purchase-management": PurchaseManagementSection,
  accounts: AccountManagement,
  reports: ReportManagement,
  people: PeopleManagementSection,
  "product-management": ProductManagementSection,
  "expense-management": ExpenseManagementSection,
  "system-users": SystemUserManagement,
  configuration: ConfigurationManagement,
  attendance: AttendanceManagement,
  "error-screen": () => (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-gray-600">
      <h2 className="text-3xl font-bold mb-4">Something Went Wrong</h2>
      <p className="text-lg text-center">
        An unexpected error occurred. Please try again.
      </p>
    </div>
  ),
};

const CATEGORY_VIEWS_MAP = {
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
  configuration: ["password-reset", "access-control", "business-variables", "areas", "types"],
};

const FullScreenLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-900"></div>
  </div>
);

const AccessDenied = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center text-gray-600 p-4">
      <h2 className="text-3xl font-bold mb-4">Processing</h2>
      <p className="text-lg">
        Please Wait ... Your access permissions are being reviewed.
      </p>
    </div>
  </div>
);

const Layout = () => {
  const { currentUser, loadingInitial } = useAuth();
  const {
    loading,
    userRole,
    setUserRole,
    currentView,
    setCurrentView,
    setEmployeeId,
    userAccesses,
    setUserAccesses,
    permissionTrigger,
  } = useStore();

  const navigation = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isInitializing, setIsInitializing] = useState(true);

  const isSubViewOfCategory = useCallback((view, category) => {
    return CATEGORY_VIEWS_MAP[category]?.includes(view);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleGoToPos = () => {
    if (userAccesses.includes("pos-screen")) {
      setCurrentView("pos-screen");
      navigation("/pos");
    } else {
      toast.error("You do not have access to the POS screen.");
    }
  };

  const fetchUserAccessProfile = useCallback(async () => {
    if (!currentUser) {
      setUserAccesses([]);
      setCurrentView("");
      return;
    }
    try {
      const categories = await ProductApis.getCategories();
      const uoms = await ProductApis.getUOMs();
      useStore.getState().setCategories(categories);
      useStore.getState().setUOMs(uoms);

      const userProfile = await api.getUserProfile();

      if (userProfile && userProfile.role) {
        const { role } = userProfile;
        setUserRole({ name: role.name, _id: role._id });
        const accesses = role.accesses || [];
        setUserAccesses(accesses);

        if (accesses.length > 0) {
          const initialView = useStore.getState().currentView;
          if (!accesses.includes(initialView) || initialView === "dashboard") {
            let firstView = null;
            for (const item of ALL_NAV_ITEMS) {
              if (item.children) {
                const firstChild = item.children.find((child) =>
                  accesses.includes(child.key)
                );
                if (firstChild) {
                  firstView = firstChild.key;
                  break;
                }
              } else if (accesses.includes(item.key)) {
                firstView = item.key;
                break;
              }
            }
            setCurrentView(firstView || accesses[0]);
          }
        } else {
          toast.error(
            "Your role has no assigned accesses. Please contact an administrator."
          );
          setUserAccesses([]);
        }
      } else {
        setUserRole(null);
        setUserAccesses([]);
        toast.error(
          "Could not find a user profile or role. Please contact an administrator."
        );
      }
    } catch (error) {
      console.error("Error fetching user profile for access control:", error);
      toast.error(`Failed to load user permissions: ${error.message}`);
      setUserAccesses([]);
      setCurrentView("error-screen");
    }
  }, [currentUser, setCurrentView, setUserRole, setUserAccesses]);
  useEffect(() => {
    const initializeApp = async () => {
      if (loadingInitial) {
        return;
      }

      if (currentUser) {
        setEmployeeId(currentUser.uid);
        try {
          await fetchUserAccessProfile();
        } catch (error) {
          console.error("Failed to fetch user profile during init:", error);
        } finally {
          setIsInitializing(false);
        }
      } else {
        setUserAccesses([]);
        setUserRole(null);
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [
    loadingInitial,
    currentUser,
    setEmployeeId,
    fetchUserAccessProfile,
    setUserAccesses,
    setUserRole,
  ]);

  useEffect(() => {
    if (!isInitializing && permissionTrigger) {
      fetchUserAccessProfile();
    }
  }, [permissionTrigger, isInitializing, fetchUserAccessProfile]);
  if (isInitializing) {
    return <FullScreenLoader />;
  }
  if (!currentUser) {
    return <Login />;
  }
  if (!userAccesses || userAccesses.length === 0) {
    return <AccessDenied />;
  }
  const renderCurrentView = () => {
    if (currentView === "pos-screen") {
      return null;
    }

    const parentCategory = Object.keys(CATEGORY_VIEWS_MAP).find((category) =>
      isSubViewOfCategory(currentView, category)
    );

    const requiredAccess = parentCategory || currentView;

    if (userAccesses.includes(requiredAccess)) {
      const componentKey = parentCategory || currentView;
      const ComponentToRender = ALL_APP_SCREENS[componentKey];

      if (ComponentToRender) {
        return <ComponentToRender />;
      }
    }

    const DirectComponent = ALL_APP_SCREENS[currentView];
    if (DirectComponent && userAccesses.includes(currentView)) {
      return <DirectComponent />;
    }
    console.warn(
      `No component found or no access for currentView: ${currentView}`
    );
    return null;
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserAccesses([]);
      setCurrentView("");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MessageModal />
      <PersonFormModal />
      <PersonDetailModal />
      <CategoryUomFormModal />
      <ProductFormModal />
      <ExpenseFormModal />
      <ExpenseDetailModal />
      {loading && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900/90"></div>
        </div>
      )}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        userAccesses={userAccesses}
      />
      <div
        className={`
          transition-all duration-300 ease-in-out
          lg:ml-20
          ${isSidebarOpen && "lg:!ml-64"}
        `}
      >
        <header className="sticky top-0 bg-white shadow-sm p-2 flex items-center lg:hidden z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-blue-700 rounded-full hover:bg-gray-200"
            aria-label="Open sidebar"
          >
            {/* Replace with your actual IconMenu component */}
            <svg
              className="w-6 h-6 max-sm:w-5 max-sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {userAccesses.includes("pos-screen") && (
            <div className="flex flex-1 items-center justify-end px-2">
              {/* POS Button */}
              <button
                onClick={handleGoToPos}
                className="sm:px-4 max-sm:text-sm px-3 py-2 flex gap-1.5 items-center justify-center bg-blue-900/80 text-white font-semibold rounded-md hover:bg-blue-900/95 transition-colors duration-200 shadow"
              >
                <img
                  src="/pos.png"
                  className="w-6 h-6 max-sm:w-5 max-sm:h-5 flex-shrink-0"
                  alt="POS"
                />
                POS
              </button>

              {/* User Dropdown Container */}
              <div
                className="relative ml-3"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                {/* User Icon Button */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900/90 transition"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  <img src="/user.png" className="w-7 h-7" alt="User Menu" />
                </button>

                {/* Dropdown Panel */}
                {isDropdownOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <div className="py-1" role="none">
                      <div className="px-4 py-3">
                        <p className="text-sm text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {currentUser?.email}
                        </p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {userRole?.name}
                        </p>
                      </div>
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700"
                        role="menuitem"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        <main className="bg-gray-50">
          {userAccesses.includes("pos-screen") && (
            <div className="flex sticky top-0 z-30 bg-blue-900/90 p-4 sm:pr-10 items-center justify-end w-full max-lg:hidden">
              {/* POS Button */}
              <button
                onClick={handleGoToPos}
                className="px-4 py-2 bg-blue-900/95 text-white cursor-pointer flex gap-1.5 items-center justify-center font-semibold rounded-md hover:bg-blue-900/70 transition-colors duration-200 shadow"
              >
                <img
                  src="/pos.png"
                  className="w-6 h-6 flex-shrink-0"
                  alt="POS"
                />
                POS
              </button>

              {/* User Dropdown Container */}
              <div
                className="relative ml-4"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                {/* User Icon Button - Click handler for mobile/universal toggle */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-full bg-blue-900/95 hover:bg-blue-900/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 focus:ring-blue-900/95 transition"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  <img
                    src="/user.png"
                    className="w-8 h-8 flex-shrink-0"
                    alt="User Menu"
                  />
                </button>

                {/* Dropdown Panel */}
                {isDropdownOpen && (
                  <div
                    className="origin-top-right absolute right-0 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <div className="py-1" role="none">
                      <div className="px-4 py-3">
                        <p className="text-sm text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {currentUser?.email}
                        </p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {userRole?.name}
                        </p>
                      </div>
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center cursor-pointer gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700"
                        role="menuitem"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="p-4 md:p-8">{renderCurrentView()}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
