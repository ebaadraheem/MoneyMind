// src/components/ReportComponents/FinancialReportContainer.jsx

import { useState } from "react";
import GenericListReport from "./GenericList/GenericListReport";
import CustomerApis from "../../services/CustomerApis";
import SupplierApis from "../../services/SupplierApis";
import EmployeeApis from "../../services/EmployeeApis";

const FinancialReportContainer = () => {
  const [primaryTab, setPrimaryTab] = useState("payables"); // payables, receivables, balances
  const [secondaryTab, setSecondaryTab] = useState("suppliers"); // suppliers, customers, employees

  const renderReport = () => {
    let apiCall, columns, title;

    // Dynamically set the props for GenericListReport based on tab selections
    if (primaryTab === "payables") {
      if (secondaryTab === "suppliers") {
        title = "Supplier Payables (Money We Owe)";
        apiCall = () => SupplierApis.getSupplierPayables(); // Assumes new API exists
        columns = [
          { key: "name", header: "Name", printable: true },
          { key: "companyName", header: "Company", printable: true },
          { key: "phone", header: "Phone", printable: true },
          { key: "balance", header: "Amount Owed", printable: true },
        ];
      } else if (secondaryTab === "customers") {
        title = "Customer Payables (Money We Owe to Customers)";
        apiCall = () => CustomerApis.getCustomerPayables(); // Assumes new API exists
        columns = [
          { key: "name", header: "Name", printable: true },
          { key: "phone", header: "Phone", printable: true },
          { key: "balance", header: "Amount Owed", printable: true },
        ];
      } else if (secondaryTab === "employees") {
        title = "Employee Payables (Money We Owe to Employees)";
        apiCall = () => EmployeeApis.getEmployeePayables(); // Assumes new API exists
        columns = [
          { key: "name", header: "Name", printable: true },
          { key: "role", header: "Role", printable: true },
          { key: "phone", header: "Phone", printable: true },
          { key: "balance", header: "Amount Owed", printable: true },
        ];
      }
    } else if (primaryTab === "receivables") {
      if (secondaryTab === "customers") {
        title = "Customer Receivables (Money Owed to Us)";
        apiCall = () => CustomerApis.getCustomerReceivables(); // Assumes new API exists
        columns = [
          { key: "name", header: "Name", printable: true },
          { key: "phone", header: "Phone", printable: true },
          { key: "balance", header: "Amount Due", printable: true },
        ];
      } else if (secondaryTab === "suppliers") {
        title = "Supplier Receivables (Money Owed to Us by Suppliers)";
        apiCall = () => SupplierApis.getSupplierReceivables(); // Assumes new API exists
        columns = [
          { key: "name", header: "Name", printable: true },
          { key: "companyName", header: "Company", printable: true },
          { key: "phone", header: "Phone", printable: true },
          { key: "balance", header: "Amount Due", printable: true },
        ];
      } else if (secondaryTab === "employees") {
        title = "Employee Receivables (Money Owed to Us by Employees)";
        apiCall = () => EmployeeApis.getEmployeeReceivables(); // Assumes new API exists
        columns = [
          { key: "name", header: "Name", printable: true },
          { key: "role", header: "Role", printable: true },
          { key: "phone", header: "Phone", printable: true },
          { key: "balance", header: "Amount Due", printable: true },
        ];
      }
    } else {
      // All Balances
      if (secondaryTab === "suppliers") {
        title = "All Supplier Balances";
        apiCall = () => SupplierApis.getAllSuppliersWithAccounts(); // Uses existing API
        columns = [
          { key: "name", header: "Name", printable: true },
          { key: "phone", header: "Phone", printable: true },
          {
            key: "supplierBalance",
            header: "Current Balance",
            printable: true,
          },
        ];
      } else if (secondaryTab === "customers") {
        title = "All Customer Balances";
        apiCall = () => CustomerApis.getAllCustomersWithAccounts(); // Uses existing API
        columns = [
          { key: "name", header: "Name", printable: true },
          { key: "phone", header: "Phone", printable: true },
           { key: "customerBalance", header: "Current Balance", printable: true },
         
        ];
      } else if (secondaryTab === "employees") {
        title = "All Employee Balances";
        apiCall = () => EmployeeApis.getAllEmployeesWithAccounts(); // Uses existing API
        columns = [
          { key: "name", header: "Name", printable: true },
          { key: "role", header: "Role", printable: true },
          { key: "phone", header: "Phone", printable: true },
          { key: "employeeBalance", header: "Current Balance", printable: true },
        ];
      }
    }

    if (!apiCall) return null;

    return (
      <GenericListReport title={title} fetchApi={apiCall} columns={columns} />
    );
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Primary Tabs */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-2">
          <div className="flex border-b">
            <button
              onClick={() => setPrimaryTab("payables")}
              className={`px-4 py-1 sm:py-2 cursor-pointer transition-all text-sm max-sm:text-xs font-medium ${
                primaryTab === "payables"
                  ? "border-b-2 border-red-600 text-red-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              Payables
            </button>
            <button
              onClick={() => setPrimaryTab("receivables")}
              className={`px-4 py-1 sm:py-2 cursor-pointer transition-all max-sm:text-xs text-sm font-medium ${
                primaryTab === "receivables"
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              Receivables
            </button>
            <button
              onClick={() => setPrimaryTab("balances")}
              className={`px-4 py-1 sm:py-2 cursor-pointer transition-all max-sm:text-xs text-sm font-medium ${
                primaryTab === "balances"
                  ? "border-b-2 border-blue-900/80 text-blue-900/90"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              All Balances
            </button>
          </div>
          {/* Secondary Tabs */}
          <div className="flex pt-2">
            <button
              onClick={() => setSecondaryTab("suppliers")}
              className={`px-3 py-1 cursor-pointer transition-all max-sm:text-xs text-sm rounded-md ${
                secondaryTab === "suppliers"
                  ? "bg-blue-900/80 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              Suppliers
            </button>
            <button
              onClick={() => setSecondaryTab("customers")}
              className={`px-3 py-1 cursor-pointer transition-all ml-2 max-sm:text-xs text-sm rounded-md ${
                secondaryTab === "customers"
                  ? "bg-blue-900/80 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              Customers
            </button>
            <button
              onClick={() => setSecondaryTab("employees")}
              className={`px-3 py-1 cursor-pointer transition-all ml-2 max-sm:text-xs text-sm rounded-md ${
                secondaryTab === "employees"
                  ? "bg-blue-900/80 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              Employees
            </button>
          </div>
        </div>
        <div>{renderReport()}</div>
      </div>
    </div>
  );
};

export default FinancialReportContainer;
