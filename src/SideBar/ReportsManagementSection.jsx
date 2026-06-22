import { useState, useEffect, useMemo } from "react";
import useStore from "../store/useStore";
import { motion } from "framer-motion";
import ReportContainer from "../components/ReportComponents/SalePurchaseContainer";
import PeopleReportContainer from "../components/ReportComponents/PeopleReportContainer";
import InventoryReportContainer from "../components/ReportComponents/InventoryReportContainer";
import AccountsReportContainer from "../components/ReportComponents/AccountsReportContainer";
import FinancialReportContainer from "../components/ReportComponents/FinancialReportContainer";
import ExpenseReport from "../components/ReportComponents/ExpenseReport";
import AttendanceReport from "../components/ReportComponents/AttendanceReport";
import ProfitLossReport from "../components/ReportComponents/ProfitLossReport";
import BusinessCapitalReport from "../components/ReportComponents/BusinessCapitalReport";

const ReportManagement = () => {
  const { userAccesses, currentView } = useStore();

  const reportsCategories = useMemo(
    () => [
      {
        key: "purchase-reports-tab",
        name: "Purchase Reports",
        reportCategory: "purchase",
        accessKey: "purchase-reports-tab",
      },
      {
        key: "sales-reports-tab",
        name: "Sales Reports",
        reportCategory: "sales",
        accessKey: "sales-reports-tab",
      },
      {
        key: "profit-loss-reports-tab",
        name: "Profit & Loss Reports",
        reportCategory: "profit-loss",
        accessKey: "profit-loss-reports-tab",
      },
      {
        key: "business-capital-reports-tab",
        name: "Business Capital Report",
        reportCategory: "business-capital",
        accessKey: "business-capital-reports-tab",
      },
      {
        key: "accounts-reports-tab",
        name: "Accounts Reports",
        reportCategory: "accounts",
        accessKey: "accounts-reports-tab",
      },
      {
        key: "balance-reports-tab",
        name: "Balance Reports",
        reportCategory: "balances",
        accessKey: "balance-reports-tab",
      },
      {
        key: "people-reports-tab",
        name: "People Reports",
        reportCategory: "people",
        accessKey: "people-reports-tab",
      },
      {
        key: "inventory-stock-reports-tab",
        name: "Inventory & Stock Reports",
        reportCategory: "inventory",
        accessKey: "inventory-stock-reports-tab",
      },
      {
        name: "Expense Reports", 
        key: "expense-reports-tab",
        reportCategory: "expense",
        accessKey: "expense-reports-tab",
      },
      {
        key: "attendance-reports-tab",
        name: "Attendance Reports",
        reportCategory: "attendance",
        accessKey: "attendance-reports-tab",
      },
    ],
    []
  );

  const hasOverallReportAccess = userAccesses.includes("reports");

  const accessibleReportCategories = useMemo(() => {
    if (!hasOverallReportAccess) return [];
    return reportsCategories.filter((cat) =>
      userAccesses.includes(cat.accessKey)
    );
  }, [hasOverallReportAccess, reportsCategories, userAccesses]);

  const [activeTab, setActiveTab] = useState(() => {
    if (accessibleReportCategories.length === 0) {
      return null;
    }
    const initialCategory = accessibleReportCategories.find(
      (cat) => cat.key === currentView
    );
    return initialCategory
      ? initialCategory.key
      : accessibleReportCategories[0].key;
  });

  useEffect(() => {
    if (
      hasOverallReportAccess &&
      accessibleReportCategories.some((cat) => cat.key === currentView) &&
      currentView !== activeTab
    ) {
      setActiveTab(currentView);
    }
  }, [
    currentView,
    hasOverallReportAccess,
    accessibleReportCategories,
    activeTab,
  ]);

  const ActiveReportGeneratorComponent = useMemo(() => {
    const category = reportsCategories.find((cat) => cat.key === activeTab);

    if (!category) {
      return (
        <div className="bg-red-100 p-4 text-red-700 rounded-lg">
          Error: Report category not found.
        </div>
      );
    }

    switch (category.reportCategory) {
      case "purchase":
      case "sales":
        return <ReportContainer reportType={category.reportCategory} />;
      case "people": 
        return <PeopleReportContainer />;
      case "inventory":
        return <InventoryReportContainer />;
      case "accounts":
        return <AccountsReportContainer />;
      case "balances":
        return <FinancialReportContainer />;
      case "expense":
        return <ExpenseReport />;
      case "attendance":
        return <AttendanceReport />;
      case "profit-loss":
        return <ProfitLossReport />;
      case "business-capital":
        return <BusinessCapitalReport />;  
      default:
        return (
          <div className="bg-blue-50 p-6 rounded-lg shadow-inner text-center">
            <h3 className="text-xl font-semibold text-blue-900/90">
              {category.name}
            </h3>
            <p className="text-gray-600 mt-2">
              This component is not yet implemented.
            </p>
          </div>
        );
    }
  }, [activeTab, reportsCategories]);

  if (!hasOverallReportAccess) {
    return (
      <motion.div
        key="reports-access-denied"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="bg-white p-6 rounded-lg shadow-md mx-auto my-8 w-full text-center text-gray-600"
      >
        <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
        <p className="text-lg">
          You do not have permission to view reports sections.
        </p>
        <p className="text-md mt-2">Please contact your administrator.</p>
      </motion.div>
    );
  }

  if (!activeTab) {
    return (
      <motion.div
        key="reports-no-categories"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="bg-white p-6 rounded-lg shadow-md mx-auto my-8 w-full text-center text-gray-600"
      >
        <h2 className="text-3xl font-bold mb-4">Configuration Error</h2>
        <p className="text-lg">
          Reports section is enabled, but no accessible report categories are
          defined.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={activeTab}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
      className="flex-grow"
    >
      {ActiveReportGeneratorComponent}
    </motion.div>
  );
};

export default ReportManagement;
