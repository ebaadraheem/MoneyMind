// src/components/EmployeeSalary/EmployeeSalaryManagement.jsx
import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import ManageSingleEmployeeSalary from "./EmployeeAccountSection/ManageSingleEmployee";
import AllEmployeesSalarySummary from "./EmployeeAccountSection/ManageAllEmployee";
import useStore from "../../store/useStore";

const EmployeeSalaryManagement = () => {
  const { currentView, userAccesses } = useStore();

  const hasOverallAccess = userAccesses.includes("employee-accounts");

  const salaryManagementTabs = useMemo(
    () => [
      {
        key: "single-employee-salary",
        name: "Employee Salary",
      },
      {
        key: "all-employees-salary-summary",
        name: "All Employee Salaries",
      },
    ],
    []
  );

  const accessibleTabs = useMemo(() => {
    return hasOverallAccess ? salaryManagementTabs : [];
  }, [hasOverallAccess, salaryManagementTabs]);

  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    if (accessibleTabs.length === 0) {
      setActiveTab(null);
      return;
    }

    const isCurrentViewAnInternalTab = accessibleTabs.some(
      (tab) => tab.key === currentView
    );

    if (isCurrentViewAnInternalTab) {
      setActiveTab(currentView);
    } else {
      setActiveTab(accessibleTabs[0].key);
    }
  }, [accessibleTabs, currentView]);

  const handleTabChange = useCallback((tabKey) => {
    setActiveTab(tabKey);
  }, []);

  if (!hasOverallAccess) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="bg-white p-6 rounded-lg shadow-md mx-auto my-8 w-full text-center text-gray-600"
      >
        <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
        <p className="text-lg">
          You do not have permission to manage employee salaries.
        </p>
        <p className="text-md mt-2">Please contact your administrator.</p>
      </motion.div>
    );
  }

  if (!activeTab) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="bg-white p-6 rounded-lg shadow-md mx-auto my-8 w-full text-center text-gray-600"
      >
        <h2 className="text-3xl font-bold mb-4">Configuration Error</h2>
        <p className="text-lg">
          Employee Salary Management section is enabled, but no tabs are defined
          or accessible.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex flex-col h-full">
      <h2 className="text-2xl max-sm:text-lg gap-2 font-bold text-blue-900/90 mb-6 border-b pb-3 flex items-center justify-between">
        <span className="flex items-center">
          <img
            src={`/employee-blue.png`}
            alt={`Employee Icon`}
            className="w-8 h-8 mr-2"
          />
          Employee Accounts
        </span>
      </h2>

      <div className="mb-6 flex flex-wrap space-x-2 bg-gray-100 p-2 rounded-lg justify-center">
        {accessibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`sm:px-6 px-3 max-sm:text-sm py-2 rounded-md cursor-pointer font-semibold transition-colors duration-200 ${
              activeTab === tab.key
                ? "bg-blue-900/80 text-white shadow-md"
                : "bg-transparent text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="flex-grow"
      >
        {activeTab === "single-employee-salary" && <ManageSingleEmployeeSalary />}
        {activeTab === "all-employees-salary-summary" && <AllEmployeesSalarySummary />}
      </motion.div>
    </div>
  );
};

export default EmployeeSalaryManagement;
