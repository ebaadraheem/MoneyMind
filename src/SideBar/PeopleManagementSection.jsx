// SideBar/PeopleSection.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import useStore from "../store/useStore";
import { motion } from "framer-motion";
import PersonTable from "../components/PeopleComponents/PersonTable";

const PeopleManagementSection = () => {
  const { userAccesses, currentView, setCurrentView } = useStore();

  // Define the sub-sections for People Management
  // These keys are used for internal tab management and mapping to PersonTable types
  const peopleManagementSubsections = useMemo(
    () => [
      { key: "customer-management", name: "Customers" },
      { key: "employee-management", name: "Employees" },
      { key: "supplier-management", name: "Suppliers" },
    ],
    []
  );

  // Access is now determined solely by the "people" access key
  const hasPeopleAccess = userAccesses.includes("people");
  const [activeTab, setActiveTab] = useState(() => {
    // If user has 'people' access, check if currentView is a specific sub-section
    if (hasPeopleAccess) {
      const initialSubKey = peopleManagementSubsections.find(
        (sub) => sub.key === currentView
      );
      if (initialSubKey) {
        return initialSubKey.key;
      }
      // Otherwise, default to the first sub-section if 'people' access is available
      return peopleManagementSubsections.length > 0
        ? peopleManagementSubsections[0].key
        : null;
    }
    return null; // No access, no active tab
  });
  useEffect(() => {
    if (
      hasPeopleAccess &&
      peopleManagementSubsections.some((sub) => sub.key === currentView) &&
      currentView !== activeTab
    ) {
      setActiveTab(currentView);
    }
  }, [currentView, hasPeopleAccess, peopleManagementSubsections, activeTab]);

  // Handle tab click
  const handleTabClick = useCallback(
    (key) => {
      setActiveTab(key);
      setCurrentView(key); // Also update the global currentView in store
    },
    [setCurrentView]
  );

  // Render "Access Denied" if "people" access is not allowed
  if (!hasPeopleAccess) {
    return (
      <motion.div
        key="people-access-denied"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="bg-white p-6 rounded-lg shadow-md mx-auto my-8 w-full text-center text-gray-600"
      >
        <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
        <p className="text-lg">
          You do not have permission to view people management sections.
        </p>
        <p className="text-md mt-2">Please contact your administrator.</p>
      </motion.div>
    );
  }

  // If 'people' access is granted but no sub-sections are defined (shouldn't happen if static)
  if (!activeTab) {
    return (
      <motion.div
        key="people-no-subsections"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="bg-white p-6 rounded-lg shadow-md mx-auto my-8 w-full text-center text-gray-600"
      >
        <h2 className="text-3xl font-bold mb-4">Configuration Error</h2>
        <p className="text-lg">
          People Management is enabled, but no sub-sections are defined.
        </p>
      </motion.div>
    );
  }

  return (

      <div className="mt-4">
        {activeTab === "customer-management" && <PersonTable type="customer" />}
        {activeTab === "employee-management" && <PersonTable type="employee" />}
        {activeTab === "supplier-management" && <PersonTable type="supplier" />}
      </div>
  );
};

export default PeopleManagementSection;
