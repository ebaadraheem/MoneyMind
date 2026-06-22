// SideBar/SalesManagementSection.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import useStore from "../store/useStore";
import { motion } from "framer-motion";
import SalesList from "../components/SalesComponents/SalesList";
import SaleReturnForm from "../components/SalesComponents/SaleReturnForm";
import SalesReturnTable from "../components/SalesComponents/SalesReturnTable";
// Import the specific components that represent each tab's content\

const SalesManagementSection = () => {
  const { userAccesses, currentView } = useStore();

  const salesManagementSubsections = useMemo(
    () => [
      {
        key: "sales-list",
        name: "All Sales",
        component: <SalesList />,
      },
      {
        key: "sale-return",
        name: "Sale Return",
        component: <SaleReturnForm />,
      },
      {
        key: "sale-return-list",
        name: "Returns List",
        component: <SalesReturnTable />,
      },
    ],
    [] // This array is stable, so useMemo ensures it's created once
  );

  // Determine if the user has overall purchase management access
  const hasSalesManagementAccess = userAccesses.includes("sales-management");

  // State to manage which tab is currently active within this section
  const [activeTab, setActiveTab] = useState(() => {
    if (!hasSalesManagementAccess || salesManagementSubsections.length === 0) {
      return null; // No access or no subsections, so no active tab
    }
    // Try to find if the current global view matches a subsection key
    const initialSubKey = salesManagementSubsections.find(
      (sub) => sub.key === currentView
    );
    // If a match is found, use it; otherwise, default to the first subsection
    return initialSubKey
      ? initialSubKey.key
      : salesManagementSubsections[0].key;
  });

  // Effect to update activeTab if the global 'currentView' changes (e.g., from sidebar navigation)
  useEffect(() => {
    if (
      hasSalesManagementAccess &&
      // Check if the currentView is one of the valid subsections
      salesManagementSubsections.some((sub) => sub.key === currentView) &&
      // Only update if the currentView is different from the currently active tab
      currentView !== activeTab
    ) {
      setActiveTab(currentView);
    }
  }, [
    currentView,
    hasSalesManagementAccess,
    salesManagementSubsections,
    activeTab,
  ]);
  // --- Render "Access Denied" if "purchase-management" access is not allowed ---
  if (!hasSalesManagementAccess) {
    return (
      <motion.div
        key="sales-management-access-denied" // Unique key for Framer Motion
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="bg-white p-6 rounded-lg shadow-md mx-auto my-8 w-full text-center text-gray-600"
      >
        <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
        <p className="text-lg">
          You do not have permission to view Sales management sections.
        </p>
        <p className="text-md mt-2">Please contact your administrator.</p>
      </motion.div>
    );
  }

  if (!activeTab) {
    return (
      <motion.div
        key="sales-management-no-subsections"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="bg-white p-6 rounded-lg shadow-md mx-auto my-8 w-full text-center text-gray-600"
      >
        <h2 className="text-3xl font-bold mb-4">Configuration Error</h2>
        <p className="text-lg">
          Sales Management is enabled, but no sub-sections are defined.
        </p>
      </motion.div>
    );
  }

  // Memoize the active component for performance, finding it based on the activeTab
  const ActiveComponent = useMemo(() => {
    const section = salesManagementSubsections.find(
      (sub) => sub.key === activeTab
    );
    return section ? section.component : null;
  }, [activeTab, salesManagementSubsections]);

  return (
    <motion.div
      key={activeTab} // Unique key for AnimatePresence to detect change and trigger transitions
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
      className="flex-grow" // Allows content to take up available height
    >
      {ActiveComponent}
    </motion.div>
  );
};

export default SalesManagementSection;
