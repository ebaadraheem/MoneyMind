import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import useStore from "../../../store/useStore";
import EmployeeSalaryApis from "../../../services/EmployeeSalaryApis";
import AccountDetailModal from "../AccountDetailModal";
import { IconSearch } from "../../../utils/Icons";
import Pagination from "../../../hooks/usePagination";

const AllEmployeesSalarySummary = () => {
  const {
    loading,
    setLoading,
    setError,
    rowsPerPage,
    currentPage,
    setCurrentPage,
  } = useStore();
  const [employeesSummary, setEmployeesSummary] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] =
    useState(null);

  const fetchEmployeesSummary = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedSummary =
        await EmployeeSalaryApis.getAllEmployeeSalarySummaries();
      setEmployeesSummary(fetchedSummary);
    } catch (err) {
      toast.error("Failed to load employee salary summaries.");
      setError("Failed to fetch employee salary summaries.");
      setEmployeesSummary([]);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  useEffect(() => {
    fetchEmployeesSummary();
  }, [fetchEmployeesSummary]);

  // Reset to page 1 when the search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, setCurrentPage]);

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return employeesSummary.filter((emp) => {
      const name = emp.name?.toLowerCase() || "";
      const cnic = emp.cnic?.toLowerCase() || "";
      const role = emp.role?.toLowerCase() || "";
      const phone = emp.phone?.toLowerCase() || "";
      return (
        name.includes(query) ||
        cnic.includes(query) ||
        role.includes(query) ||
        phone.includes(query)
      );
    });
  }, [searchQuery, employeesSummary]);

  const handleViewDetails = (employee) => {
    setSelectedEmployeeForModal({
      ...employee,
      employeeAccount: {
        _id: employee.accountDetails?._id,
        totalAmount: employee.totalAmount,
        paidAmount: employee.paidAmount,
        balance: employee.balance,
      },
    });
  };

  const handleCloseDetailModal = () => {
    setSelectedEmployeeForModal(null);
  };

  // --- Calculate current rows for the page from FILTE RED results ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentEmployees = filteredEmployees.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

 

  return (
    <div className="">
      <h2 className="text-xl max-sm:text-lg font-bold text-blue-900/90 mb-4 text-center">
        All Employees Salary Overview
      </h2>

      {/* Search Bar */}
      <div className="mb-4 relative max-w-md">
        <input
          type="text"
          placeholder="Search employees by name, CNIC, role or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 max-sm:text-sm pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
        />
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {loading && employeesSummary.length === 0 ? (
        <p className="text-center text-gray-600">Loading employee data...</p>
      ) : filteredEmployees.length === 0 ? (
        <p className="text-center text-gray-600">
          No employees found matching your search or no data available.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto max-h-[600px]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    S.No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Base Salary
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Total Owed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Total Paid
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEmployees.map((emp, index) => (
                  <tr
                    key={emp._id}
                    className="hover:bg-gray-50 max-sm:text-xs text-sm"
                  >
                    <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">
                      {indexOfFirstRow + index + 1}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">
                      {emp.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                      {emp.role}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                      {emp.salary || 0}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                      {emp.totalAmount || 0}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                      {emp.paidAmount || 0}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                      <div className=" flex justify-center items-center">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold justify-center items-center rounded-full ${
                            (emp.balance || 0) < 0
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {emp.balance || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap font-medium flex justify-center">
                      <button
                        onClick={() => handleViewDetails(emp)}
                        className="text-green-500 hover:text-green-700 transition-colors"
                        title="View Details"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination data={filteredEmployees} />
        </>
      )}
      {selectedEmployeeForModal && (
        <AccountDetailModal
          person={selectedEmployeeForModal}
          accountType="Employee"
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
};

export default AllEmployeesSalarySummary;
