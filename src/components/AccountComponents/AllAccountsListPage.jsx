import React, { useEffect, useState, useMemo, useCallback } from "react";
import useStore from "../../store/useStore";
import toast from "react-hot-toast";
import { IconSearch } from "../../utils/Icons";
import SupplierApis from "../../services/SupplierApis";
import CustomerApis from "../../services/CustomerApis";
import EmployeeApis from "../../services/EmployeeApis";
import Pagination from "../../hooks/usePagination";

const getAllAccountsApisForType = (type) => {
  switch (type) {
    case "Supplier":
      return {
        fetchAll: SupplierApis.getAllSuppliersWithAccounts,
      };
    case "Customer":
      return {
        fetchAll: CustomerApis.getAllCustomersWithAccounts,
      };
    case "Employee":
      return {
        fetchAll: EmployeeApis.getAllEmployeesWithAccounts,
      };
    default:
      throw new Error(`Unsupported account type: ${type}`);
  }
};

const AllAccountsListPage = ({ accountType, columns, onViewDetails }) => {
  const { setLoading, setError, currentPage, setCurrentPage, rowsPerPage } =
    useStore();
  const [peopleList, setPeopleList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const apiService = useMemo(() => {
    setCurrentPage(1);
    try {
      return getAllAccountsApisForType(accountType);
    } catch (e) {
      toast.error(e.message);
      return null;
    }
  }, [accountType]);

  const fetchAllPeople = useCallback(async () => {
    if (!apiService) return;
    setLoading(true);
    try {
      const fetchedPeople = await apiService.fetchAll();
      setPeopleList(fetchedPeople);
    } catch (err) {
      toast.error(
        `Failed to load ${accountType.toLowerCase()}s: ${err.message}`
      );
      setError(`Failed to load ${accountType.toLowerCase()}s: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, accountType, apiService]);

  useEffect(() => {
    fetchAllPeople();
  }, [fetchAllPeople]);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredPeople = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    return peopleList.filter((person) => {
      const name = person.name?.toLowerCase() || "";
      const phone = person.phone?.toLowerCase() || "";
      const email = person.email?.toLowerCase() || "";
      const cnic = person.cnic?.toLowerCase() || "";
      const companyName = person.companyName?.toLowerCase() || "";

      return (
        name.includes(lowercasedQuery) ||
        phone.includes(lowercasedQuery) ||
        email.includes(lowercasedQuery) ||
        cnic.includes(lowercasedQuery) ||
        companyName.includes(lowercasedQuery)
      );
    });
  }, [searchQuery, peopleList]);

  // --- Calculate current rows for the page ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentPeople = filteredPeople.slice(indexOfFirstRow, indexOfLastRow);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const getBalance = (person) => {
    switch (accountType) {
      case "Supplier":
        return person.supplierAccount?.balance?.toFixed(2) || "0.00";
      case "Customer":
        return person.customerAccount?.balance?.toFixed(2) || "0.00";
      case "Employee":
        return person.employeeAccount?.balance?.toFixed(2) || "0.00";
      default:
        return "0.00";
    }
  };

  return (
    <div className="rounded-lg flex flex-col h-full">
      <div className="mb-4 relative max-w-md">
        <input
          type="text"
          placeholder={`Search ${accountType.toLowerCase()}s...`}
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full max-sm:text-sm p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
        />
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>
      <div className="flex-grow flex flex-col">
        <div className="flex-grow overflow-auto border border-gray-200 rounded-lg">
          {filteredPeople.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              {searchQuery
                ? `No ${accountType.toLowerCase()}s found matching your search.`
                : `No ${accountType.toLowerCase()}s added yet.`}
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    S.No.
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Balance
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPeople.map((person,index) => (
                  <tr
                    key={person._id}
                    className="border-b border-gray-200 hover:bg-gray-50 text-sm max-sm:text-xs"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {indexOfFirstRow + index + 1}
                    </td>

                    {columns.map((col) => (
                      <td
                        key={`${person._id}-${col.key}`}
                        className="px-4 py-3 whitespace-nowrap text-gray-700"
                      >
                        {col.render
                          ? col.render(person)
                          : person[col.key] || "N/A"}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center whitespace-nowrap text-gray-700">
                      {getBalance(person)}
                    </td>
                    <td className="px-4 py-3 justify-center items-center whitespace-nowrap flex gap-1.5 text-sm text-gray-500">
                      <button
                        onClick={() => onViewDetails(person)}
                        className="text-green-600 hover:text-green-700 cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Render Pagination if there are items */}
        {filteredPeople.length > 0 && <Pagination data={filteredPeople} />}
      </div>
    </div>
  );
};

export default AllAccountsListPage;
