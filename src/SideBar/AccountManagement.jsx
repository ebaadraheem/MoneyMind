import { useState, useEffect, useMemo, useCallback } from "react";
import useStore from "../store/useStore";
import { motion } from "framer-motion";
import AccountManagementWrapper from "../components/AccountComponents/AccountManagementWrapper";
import { IconBuildingStore, IconUsers, IconUser } from "../utils/Icons";
import EmployeeSalaryManagement from "../components/AccountComponents/EmployeeAccountManagement";

const AccountManagement = () => {
  const { userAccesses, currentView, setCurrentView } = useStore();
  const AccountTypesToManage = useMemo(
    () => [
      {
        key: "supplier-accounts",
        name: "Suppliers",
        component: (
          <AccountManagementWrapper
            accountType="Supplier"
            icon={IconBuildingStore}
          />
        ),
        accessKey: "supplier-management-accounts",
      },
      {
        key: "customer-accounts",
        name: "Customers",
        component: (
          <AccountManagementWrapper accountType="Customer" icon={IconUsers} />
        ),
        accessKey: "customer-management-accounts", 
      },
      {
        key: "employee-accounts",
        name: "Employees",
        component: (
          <EmployeeSalaryManagement />
        ),
        accessKey: "employee-management-accounts", 
      },
    ],
    []
  );
  const hasOverallAccountAccess = userAccesses.includes("accounts");
  const accessibleAccountTypes = useMemo(() => {
    if (!hasOverallAccountAccess) return [];
    return AccountTypesToManage; 
  }, [hasOverallAccountAccess, AccountTypesToManage, userAccesses]);

  const [activeAccountTab, setActiveAccountTab] = useState(() => {
    if (accessibleAccountTypes.length === 0) {
      return null;
    }
    const initialType = accessibleAccountTypes.find(
      (type) => type.key === currentView
    );
    return initialType ? initialType.key : accessibleAccountTypes[0].key;
  });

  useEffect(() => {
    if (
      hasOverallAccountAccess &&
      accessibleAccountTypes.some((type) => type.key === currentView) &&
      currentView !== activeAccountTab
    ) {
      setActiveAccountTab(currentView);
    }
  }, [
    currentView,
    hasOverallAccountAccess,
    accessibleAccountTypes,
    activeAccountTab,
  ]);

  if (!hasOverallAccountAccess) {
    return (
      <motion.div
        key="accounts-access-denied"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="bg-white p-6 rounded-lg shadow-md mx-auto my-8 w-full text-center text-gray-600"
      >
        <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
        <p className="text-lg">
          You do not have permission to view the accounts section.
        </p>
        <p className="text-md mt-2">Please contact your administrator.</p>
      </motion.div>
    );
  }

  if (!activeAccountTab) {
    return (
      <motion.div
        key="accounts-no-tabs"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="bg-white p-6 rounded-lg shadow-md mx-auto my-8 w-full text-center text-gray-600"
      >
        <h2 className="text-3xl font-bold mb-4">Configuration Error</h2>
        <p className="text-lg">
          Accounts section is enabled, but no accessible account types are
          defined.
        </p>
      </motion.div>
    );
  }

  const ActiveAccountComponent = useMemo(() => {
    const type = accessibleAccountTypes.find((t) => t.key === activeAccountTab);
    return type ? type.component : null;
  }, [activeAccountTab, accessibleAccountTypes]);

  return (
    <motion.div
      key={activeAccountTab} 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
      className="flex-grow"
    >
      {ActiveAccountComponent}
    </motion.div>
  );
};

export default AccountManagement;
