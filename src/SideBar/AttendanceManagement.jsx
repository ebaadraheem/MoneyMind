// src/components/Attendance/AttendanceManagement.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import EmployeeAttendance from "../components/AttendanceComponents.jsx/EmployeeAttendance";
import AttendanceList from "../components/AttendanceComponents.jsx/AttendanceList";
import useStore from "../store/useStore";

const AttendanceManagement = () => {
  const { currentView, setCurrentView, userAccesses } = useStore();

  // Define the tabs within Attendance Management
  const attendanceTabs = useMemo(
    () => [
      {
        key: "employee-attendance",
        name: "Employees Attendance",
        component: <EmployeeAttendance />,
        accessKey: "employee-attendance",
      },
      {
        key: "attendance-list",
        name: "Attendance List",
        component: <AttendanceList />,
        accessKey: "attendance-list",
      },
    ],
    []
  );

  // Determine if the user has overall access to attendance (e.g., 'attendance' in userAccesses)
  const hasOverallAttendanceAccess = userAccesses.includes("attendance");

  // Filter accessible tabs based on user's access
  const accessibleTabs = useMemo(() => {
    if (!hasOverallAttendanceAccess) return [];
    return attendanceTabs.filter((tab) => userAccesses.includes(tab.accessKey));
  }, [hasOverallAttendanceAccess, attendanceTabs, userAccesses]);

  // Set initial active tab based on currentView or default to first accessible
  const [activeTab, setActiveTab] = useState(() => {
    if (accessibleTabs.length === 0) return null;
    const initialTab = accessibleTabs.find((tab) => tab.key === currentView);
    return initialTab ? initialTab.key : accessibleTabs[0].key;
  });

  // Update active tab when currentView changes globally (e.g., from sidebar)
  useEffect(() => {
    if (
      hasOverallAttendanceAccess &&
      accessibleTabs.some((tab) => tab.key === currentView) &&
      currentView !== activeTab
    ) {
      setActiveTab(currentView);
    }
  }, [currentView, hasOverallAttendanceAccess, accessibleTabs, activeTab]);

  if (!hasOverallAttendanceAccess) {
    return (
      <motion.div
        key="attendance-access-denied"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="bg-white p-6 rounded-lg shadow-md mx-auto my-8 w-full text-center text-gray-600"
      >
        <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
        <p className="text-lg">
          You do not have permission to view attendance sections.
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
          Attendance section is enabled, but no accessible tabs are defined.
        </p>
      </motion.div>
    );
  }

  const ActiveComponent = useMemo(() => {
    const tab = attendanceTabs.find((t) => t.key === activeTab);
    return tab ? tab.component : null;
  }, [activeTab, attendanceTabs]);

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

export default AttendanceManagement;
