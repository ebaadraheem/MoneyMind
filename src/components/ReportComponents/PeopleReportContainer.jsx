import { useState } from "react";
import { motion } from "framer-motion";
import GenericListReport from "./GenericList/GenericListReport";
import PeopleApis from "../../services/PeopleApis";

const PeopleReportContainer = () => {
  const [activeTab, setActiveTab] = useState("customers");

  const renderReportComponent = () => {
    switch (activeTab) {
      case "customers":
        return (
          <GenericListReport
            title="Customers"
            fetchApi={() => PeopleApis.searchCustomers("")}
            columns={[
              { key: "name", header: "Name", printable: true },
              { key: "fatherName", header: "Father Name", printable: true },
              { key: "cnic", header: "CNIC", printable: true },
              { key: "email", header: "Email", printable: true },
              { key: "phone", header: "Phone", printable: true },
              { key: "address", header: "Address", printable: true },
            ]}
          />
        );
      case "employees":
        return (
          <GenericListReport
            title="Employees"
            fetchApi={() => PeopleApis.searchEmployees("")}
            columns={[
              { key: "name", header: "Name", printable: true },
              { key: "fatherName", header: "Father Name", printable: true },
              { key: "cnic", header: "CNIC", printable: true },
              { key: "email", header: "Email", printable: true },
              { key: "phone", header: "Phone", printable: true },
              { key: "address", header: "Address", printable: true },
              { key: "hireDate", header: "Hire Date", printable: true },
              { key: "role", header: "Role", printable: true },
              { key: "salary", header: "Salary", printable: true },
            ]}
          />
        );
      case "suppliers":
        return (
          <GenericListReport
            title="Suppliers"
            fetchApi={() => PeopleApis.searchSuppliers("")}
            columns={[
              { key: "name", header: "Name", printable: true },
              { key: "companyName", header: "Company Name", printable: true },
              { key: "cnic", header: "CNIC", printable: true },
              { key: "email", header: "Email", printable: true },
              { key: "phone", header: "Phone", printable: true },
              { key: "address", header: "Address", printable: true },
              { key: "website", header: "Website", printable: true },
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
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("customers")}
              className={`px-4  cursor-pointer py-2 max-sm:text-sm text-xs font-medium transition-colors duration-200 ${
                activeTab === "customers"
                  ? "border-b-2 border-blue-900/80 text-blue-900/90"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Customers List
            </button>
            <button
              onClick={() => setActiveTab("employees")}
              className={`px-4 cursor-pointer py-2 text-sm max-sm:text-xs font-medium transition-colors duration-200 ${
                activeTab === "employees"
                  ? "border-b-2 border-blue-900/80 text-blue-900/90"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Employees List
            </button>
            <button
              onClick={() => setActiveTab("suppliers")}
              className={`px-4 cursor-pointer py-2 text-sm max-sm:text-xs font-medium transition-colors duration-200 ${
                activeTab === "suppliers"
                  ? "border-b-2 border-blue-900/80 text-blue-900/90"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Suppliers List
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

export default PeopleReportContainer;
