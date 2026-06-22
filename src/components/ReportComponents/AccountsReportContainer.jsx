import { useState } from "react";
import { motion } from "framer-motion";
import AccountDetailsReport from "./AccountReports/AccountDetailsReport";
import CustomerApis from "../../services/CustomerApis";
import SupplierApis from "../../services/SupplierApis";
import EmployeeApis from "../../services/EmployeeApis";

const AccountsReportContainer = () => {
  const [activeTab, setActiveTab] = useState("customers");

  const renderReportComponent = () => {
    switch (activeTab) {
      case "customers":
        return (
          <AccountDetailsReport
            reportType="customer"
            title="Customer Accounts"
            fetchListApi={() => CustomerApis.getAllCustomersWithAccounts()}
            fetchDetailsApi={(id, dates) =>
              CustomerApis.getCustomerTransactionsForReport(id, dates)
            }
            listColumns={[
              { key: "name", header: "Name", printable: true },
              { key: "phone", header: "Phone", printable: true },
              {
                key: "customerTotalAmount",
                header: "Total Amount",
                printable: true,
              },
              {
                key: "customerPaidAmount",
                header: "Paid Amount",
                printable: true,
              },
              { key: "customerBalance", header: "Balance", printable: true },
            ]}
            detailsColumns={[
              { header: "S.No.", key: "srNo" },
              { header: "Date", key: "date" },
              { header: "Method", key: "type" },
              { header: "Reference #", key: "refId" },
              { header: "Amount", key: "amount" },
            ]}
          />
        );
      case "suppliers":
        return (
          <AccountDetailsReport
            reportType="supplier"
            title="Supplier Accounts"
            fetchListApi={() => SupplierApis.getAllSuppliersWithAccounts()}
            fetchDetailsApi={(id, dates) =>
              SupplierApis.getPaymentsForSupplierReports(id, dates)
            }
            listColumns={[
              { key: "name", header: "Name", printable: true },
              { key: "companyName", header: "Company", printable: true },
              {
                key: "supplierTotalAmount",
                header: "Total Amount",
                printable: true,
              },
              {
                key: "supplierPaidAmount",
                header: "Paid Amount",
                printable: true,
              },
              { key: "supplierBalance", header: "Balance", printable: true },
            ]}
            detailsColumns={[
              { header: "S.No.", key: "srNo" },
              { header: "Date", key: "date" },
              { header: "Method", key: "type" },
              { header: "Reference #", key: "refId" },
              { header: "Amount", key: "amount" },
            ]}
          />
        );
      case "employees":
        return (
          <AccountDetailsReport
            reportType="employee"
            title="Employee Accounts"
            fetchListApi={() => EmployeeApis.getAllEmployeesWithAccounts()}
            fetchDetailsApi={(id, dates) =>
              EmployeeApis.getEmployeeTransactionsForReport(id, dates)
            }
            listColumns={[
              { key: "name", header: "Name", printable: true },
              { key: "role", header: "Role", printable: true },
              {
                key: "employeeTotalAmount",
                header: "Total Amount",
                printable: true,
              },
              {
                key: "employeePaidAmount",
                header: "Paid Amount",
                printable: true,
              },
              { key: "employeeBalance", header: "Balance", printable: true },
            ]}
            detailsColumns={[
              { header: "S.No.", key: "srNo" },
              { header: "Date", key: "date" },
              { header: "Method", key: "type" },
              { header: "Reference #", key: "refId" },
              { header: "Amount", key: "amount" },
            ]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200 flex-wrap">
            <button
              onClick={() => setActiveTab("customers")}
              className={`px-4 py-2 cursor-pointer text-sm max-sm:text-xs font-medium transition-colors duration-200 ${
                activeTab === "customers"
                  ? "border-b-2 border-blue-900/80 text-blue-900/90"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Customer Accounts
            </button>
            <button
              onClick={() => setActiveTab("suppliers")}
              className={`px-4 py-2 text-sm max-sm:text-xs cursor-pointer font-medium transition-colors duration-200 ${
                activeTab === "suppliers"
                  ? "border-b-2 border-blue-900/80 text-blue-900/90"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Supplier Accounts
            </button>
            <button
              onClick={() => setActiveTab("employees")}
              className={`px-4 py-2 text-sm max-sm:text-xs cursor-pointer font-medium transition-colors duration-200 ${
                activeTab === "employees"
                  ? "border-b-2 border-blue-900/80 text-blue-900/90"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Employee Accounts
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

export default AccountsReportContainer;