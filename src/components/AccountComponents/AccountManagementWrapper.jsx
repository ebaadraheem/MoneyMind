import { useState } from "react";
import { motion } from "framer-motion";
import AccountDetailsPage from "./AccountDetailsPage";
import AllAccountsListPage from "./AllAccountsListPage";
import AccountDetailModal from "./AccountDetailModal";

const AccountManagementWrapper = ({ accountType, icon: AccountIcon }) => {
  const [viewMode, setViewMode] = useState("single");
  const [selectedPersonForDetailModal, setSelectedPersonForDetailModal] =
    useState(null);

  const getColumnsForList = (type) => {
    switch (type) {
      case "Supplier":
        return [
          { key: "name", label: "Name" },
          { key: "companyName", label: "Company" },
          { key: "phone", label: "Phone" },
        ];
      case "Customer":
        return [
          { key: "name", label: "Name" },
          { key: "phone", label: "Phone" },
          { key: "cnic", label: "CNIC" },
        ];
      case "Employee":
        return [
          { key: "name", label: "Name" },
          { key: "role", label: "Role" },
          { key: "phone", label: "Phone" },
        ];
      default:
        return [{ key: "name", label: "Name" }];
    }
  };

  const handleViewDetailsFromList = (person) => {
    setSelectedPersonForDetailModal(person);
  };

  const handleCloseDetailModal = () => {
    setSelectedPersonForDetailModal(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex flex-col h-full">
      <h2 className="text-2xl max-sm:text-lg gap-2 font-bold text-blue-900/90 mb-6 border-b pb-3 flex items-center justify-between">
        <span className="flex items-center">
          <img
            src={`/${accountType.toLowerCase()}-blue.png`}
            alt={`${accountType} Icon`}
            className="w-8 h-8 max-sm:w-7 max-sm:h-7 mr-2"
          />
          {accountType} Accounts
        </span>
      </h2>

      <div className="mb-6 flex space-x-4 bg-gray-100 p-2 rounded-lg justify-center">
        <button
          onClick={() => setViewMode("single")}
          className={`sm:px-6 px-3 max-sm:text-sm py-2 rounded-md cursor-pointer font-semibold transition-colors duration-200 ${
            viewMode === "single"
              ? "bg-blue-900/80 text-white shadow-md"
              : "bg-transparent text-gray-700 hover:bg-gray-200"
          }`}
        >
          View {accountType}
        </button>
        <button
          onClick={() => setViewMode("all")}
          className={`sm:px-6 px-3 max-sm:text-sm py-2 cursor-pointer rounded-md font-semibold transition-colors duration-200 ${
            viewMode === "all"
              ? "bg-blue-900/80 text-white shadow-md"
              : "bg-transparent text-gray-700 hover:bg-gray-200"
          }`}
        >
          View All {accountType}s
        </button>
      </div>

      <motion.div
        key={viewMode}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="flex-grow"
      >
        {viewMode === "single" && (
          <AccountDetailsPage accountType={accountType} />
        )}
        {viewMode === "all" && (
          <AllAccountsListPage
            accountType={accountType}
            columns={getColumnsForList(accountType)}
            onViewDetails={handleViewDetailsFromList}
          />
        )}
      </motion.div>

      {selectedPersonForDetailModal && (
        <AccountDetailModal
          person={selectedPersonForDetailModal}
          accountType={accountType}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
};

export default AccountManagementWrapper;
