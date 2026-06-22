// src/components/Reports/ReportContainer.jsx
import { useState } from "react";
import { motion } from "framer-motion";

// Import your report components
import SalesDetailsReport from "./SalesReports/SalesDetailsReport";
import SalesTransactionReport from "./SalesReports/SalesTransactionReport";
import SalesSummaryReport from "./SalesReports/SalesSummaryReport";
import PurchaseDetailsReport from "./PurchaseReports/PurchaseDetailReport";
import PurchaseSummaryReport from "./PurchaseReports/PurchaseSummaryReport";
import PurchaseTransactionReport from "./PurchaseReports/PurchaseTransactionReport";

const ReportContainer = ({ reportType }) => {
  const [activeTab, setActiveTab] = useState("transaction");

  const renderReportComponent = () => {
    if (reportType === "sales") {
      switch (activeTab) {
        case "transaction":
          return <SalesTransactionReport />;
        case "detailed":
          return <SalesDetailsReport />;
        case "summary":
          return <SalesSummaryReport />;
        default:
          return null;
      }
    } else if (reportType === "purchase") {
      switch (activeTab) {
        case "transaction":
          return <PurchaseTransactionReport />;
        case "detailed":
          return <PurchaseDetailsReport />;
        case "summary":
          return <PurchaseSummaryReport />;
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("transaction")}
              className={`sm:px-4 px-3 py-2 text-sm max-sm:text-xs font-medium cursor-pointer ${
                activeTab === "transaction"
                  ? "border-b-2 border-blue-900/80  text-blue-900/90"
                  : "text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:bg-gray-100"
              }`}
            >
              Transaction Report
            </button>
            <button
              onClick={() => setActiveTab("detailed")}
              className={`sm:px-4 px-3 py-2 text-sm max-sm:text-xs font-medium transition-colors duration-200 cursor-pointer ${
                activeTab === "detailed"
                  ? "border-b-2 border-blue-900/80 text-blue-900/90"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Detailed Report
            </button>
            <button
              onClick={() => setActiveTab("summary")}
              className={`sm:px-4 px-3 py-2 text-sm max-sm:text-xs font-medium transition-colors duration-200 cursor-pointer ${
                activeTab === "summary"
                  ? "border-b-2 border-blue-900/80 text-blue-900/90"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Summary Report
            </button>
          </div>
        </div>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderReportComponent()}
        </motion.div>
      </div>
    </div>
  );
};

export default ReportContainer;