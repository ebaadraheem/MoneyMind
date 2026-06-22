// src/components/Attendance/AttendanceManagement.jsx
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import useStore from "../store/useStore";
import PasswordReset from "../components/ConfigurationComponents/PasswordReset";
import AccessControlList from "../components/ConfigurationComponents/AccessControl";
import BusinessVariables from "../components/ConfigurationComponents/BusinessVariables";
import AreaComponent from "../components/ConfigurationComponents/AreasComponent";
import TypesComponent from "../components/ConfigurationComponents/TypesComponent";

const ConfigurationManagement = () => {
  const { currentView, userAccesses } = useStore();
  const ConfigurationTabs = useMemo(
    () => [
      {
        key: "password-reset",
        name: "Password Reset",
        component: <PasswordReset />,
        accessKey: "password-reset",
      },
      {
        key: "access-control",
        name: "Access Control",
        component: <AccessControlList />,
        accessKey: "access-control",
      },
      {
        key: "business-variables",
        name: "Business Variables",
        component: <BusinessVariables />,
        accessKey: "business-variables",
      },
      {
        key: "areas",
        name: "Areas",
        component: <AreaComponent />,
        accessKey: "areas",
      },
      {
        key: "types",
        name: "Types",
        component: <TypesComponent />,
        accessKey: "types",
      }
    ],
    []
  );
  const hasOverallConfigurationAccess = userAccesses.includes("configuration");
  const accessibleTabs = useMemo(() => {
    if (!hasOverallConfigurationAccess) return [];
    return ConfigurationTabs.filter((tab) => userAccesses.includes(tab.accessKey));
  }, [hasOverallConfigurationAccess, ConfigurationTabs, userAccesses]);

  const [activeTab, setActiveTab] = useState(() => {
    if (accessibleTabs.length === 0) return null;
    const initialTab = accessibleTabs.find((tab) => tab.key === currentView);
    return initialTab ? initialTab.key : accessibleTabs[0].key;
  });

  useEffect(() => {
    if (
      hasOverallConfigurationAccess &&
      accessibleTabs.some((tab) => tab.key === currentView) &&
      currentView !== activeTab
    ) {
      setActiveTab(currentView);
    }
  }, [currentView, hasOverallConfigurationAccess, accessibleTabs, activeTab]);

  if (!hasOverallConfigurationAccess) {
    return (
      <motion.div
        key="configuration-denied"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="bg-white p-6 rounded-lg shadow-md mx-auto my-8 w-full text-center text-gray-600"
      >
        <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
        <p className="text-lg">
          You do not have permission to view configuration sections.
        </p>
        <p className="text-md mt-2">Please contact your administrator.</p>
      </motion.div>
    );
  }

  if (!activeTab) {
    return (
      <motion.div
        key="attendance-no-tabs"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="bg-white p-6 rounded-lg shadow-md mx-auto my-8 w-full text-center text-gray-600"
      >
        <h2 className="text-3xl font-bold mb-4">Configuration Error</h2>
        <p className="text-lg">
          Configuration section is enabled, but no accessible tabs are defined.
        </p>
      </motion.div>
    );
  }

  const ActiveComponent = useMemo(() => {
    const tab = ConfigurationTabs.find((t) => t.key === activeTab);
    return tab ? tab.component : null;
  }, [activeTab, ConfigurationTabs]);

  return (
    <motion.div
      key={activeTab}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
      className="flex-grow"
    >
      {ActiveComponent}
    </motion.div>
  );
};

export default ConfigurationManagement;
