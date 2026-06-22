import { useEffect } from "react";
import useStore from "../store/useStore";
import { motion } from "framer-motion";
import ExpenseCategoryTable from "../components/ExpenseComponents/ExpenseCategoryTable";
import ExpenseTable from "../components/ExpenseComponents/ExpenseTable";

const ExpenseManagementSection = () => {
  const { userAccesses, currentView } = useStore();
  const hasAccess =
    userAccesses.includes("manage-expenses") ||
    userAccesses.includes("expense-categories");

  if (!hasAccess) {
    return (
      <motion.div
        key="expense-access-denied"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="bg-white p-6 rounded-lg shadow-md mx-auto my-8 w-full text-center text-gray-600"
      >
        <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
        <p className="text-lg">
          You do not have permission to view the expense section.
        </p>
        <p className="text-md mt-2">Please contact your administrator.</p>
      </motion.div>
    );
  }

  // Render the appropriate child component based on the current view
  const renderContent = () => {
    switch (currentView) {
      case "expense-categories":
        return <ExpenseCategoryTable />;
      case "manage-expenses":
        return <ExpenseTable />;
    }
  };

  return <div className="mt-4">{renderContent()}</div>;
};

export default ExpenseManagementSection;
