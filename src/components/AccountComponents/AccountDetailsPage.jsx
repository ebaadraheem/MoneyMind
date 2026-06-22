import { useEffect, useState, useMemo, useCallback } from "react";
import useStore from "../../store/useStore";
import toast from "react-hot-toast";
import PeopleApis from "../../services/PeopleApis";
import SupplierApis from "../../services/SupplierApis";
import CustomerApis from "../../services/CustomerApis";
import AccountPaymentForm from "./AccountPaymentForm";
import EmployeeApis from "../../services/EmployeeApis";
import { Detail } from "../../utils/functions";
import { DatePicker } from "../../utils/functions";
import Pagination from "../../hooks/usePagination";

const getAccountApisForType = (type) => {
  switch (type) {
    case "Supplier":
      return {
        fetchDropdownList: PeopleApis.searchSuppliers,
        getAccount: SupplierApis.getSupplierAccount,
        getPayments: SupplierApis.getPaymentsForSupplier,
      };
    case "Customer":
      return {
        fetchDropdownList: PeopleApis.searchCustomers,
        getAccount: CustomerApis.getCustomerAccount,
        getPayments: CustomerApis.getPaymentsForCustomer,
      };
    case "Employee":
      return {
        fetchDropdownList: PeopleApis.searchEmployees,
        getAccount: EmployeeApis.getEmployeeAccount,
        getPayments: EmployeeApis.getPaymentsForEmployee,
      };
    default:
      throw new Error(`Unsupported account type: ${type}`);
  }
};

const AccountDetailsPage = ({ accountType }) => {
  const { setLoading, setError, currentPage, rowsPerPage, setCurrentPage } = useStore();
  const [peopleList, setPeopleList] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [accountDetails, setAccountDetails] = useState(null);
  const [personDetails, setPersonDetails] = useState(null);
  const [payments, setPayments] = useState([]);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const apiService = useMemo(() => {
    setCurrentPage(1);
    try {
      return getAccountApisForType(accountType);
    } catch (e) {
      toast.error(e.message);
      return null;
    }
  }, [accountType]);

  // Set initial selected employee
  useEffect(() => {
    if (!selectedAccountId && peopleList.length > 0) {
      setSelectedAccountId(peopleList[0]._id);
    }
  }, [peopleList, selectedAccountId]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      if (!apiService) return;
      setLoading(true);
      try {
        const fetchedPeople = await apiService.fetchDropdownList("");
        setPeopleList(fetchedPeople);
      } catch (err) {
        toast.error(
          `Failed to load ${accountType.toLowerCase()} list: ${err.message}`
        );
        setError(
          `Failed to load ${accountType.toLowerCase()} list: ${err.message}`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDropdownData();
  }, [setLoading, setError, accountType, apiService]);

  const fetchSelectedAccountData = useCallback(async () => {
    if (!selectedAccountId || !apiService) {
      setAccountDetails(null);
      setPersonDetails(null);
      setPayments([]);
      return;
    }

    setLoading(true);
    try {
      const accountData = await apiService.getAccount(selectedAccountId);
      setAccountDetails(accountData);
      const currentPerson = peopleList.find((p) => p._id === selectedAccountId);
      setPersonDetails(currentPerson);

      const fetchedPayments = await apiService.getPayments(
        selectedAccountId,
        startDate,
        endDate
      );
      setPayments(fetchedPayments);
    } catch (err) {
      toast.error(
        `Failed to load ${accountType.toLowerCase()} data: ${err.message}`
      );
      setError(
        `Failed to load ${accountType.toLowerCase()} data: ${err.message}`
      );
      setAccountDetails(null);
      setPersonDetails(null);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [
    selectedAccountId,
    peopleList,
    startDate,
    endDate,
    setLoading,
    setError,
    accountType,
    apiService,
  ]);

  useEffect(() => {
    fetchSelectedAccountData();
  }, [selectedAccountId, startDate, endDate, fetchSelectedAccountData]);

  const filteredPayments = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return payments.filter((payment) => {
      const ref = payment.referenceNumber?.toLowerCase() || "";
      const notes = payment.notes?.toLowerCase() || "";
      return ref.includes(query) || notes.includes(query);
    });
  }, [searchQuery, payments]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleAccountSelectChange = (e) => {
    setSelectedAccountId(e.target.value);
    setSearchQuery("");
    setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    setEndDate(new Date());
  };

  const handlePaymentSuccess = useCallback(() => {
    fetchSelectedAccountData();
  }, [fetchSelectedAccountData]);

  // --- Calculate current rows for the page ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentPayments = filteredPayments.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  const getPersonDisplayName = (person) => {
    switch (accountType) {
      case "Supplier":
        return `${person.name} (${person.companyName})`;
      case "Customer":
        return `${person.name} (${person.phone || "No Phone"})`;
      case "Employee":
        return `${person.name} (${person.role || "No Role"})`;
      default:
        return person.name;
    }
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto w-full overflow-hidden">
        <div className="p-2 space-y-6">
          <div className="mb-6">
            <label className="block text-sm max-sm:text-xs font-medium text-gray-700 mb-2">
              Select {accountType}:
            </label>
            <select
              value={selectedAccountId}
              onChange={handleAccountSelectChange}
              className="w-full max-sm:text-xs md:w-1/2 lg:w-1/3 cursor-pointer p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent bg-white outline-none"
            >
              {!peopleList.length && (
                <option value="">
                  No {accountType.toLowerCase()} available
                </option>
              )}
              {peopleList.map((person) => (
                <option key={person._id} value={person._id}>
                  {getPersonDisplayName(person)}
                </option>
              ))}
            </select>
          </div>

          {!selectedAccountId && peopleList.length > 0 && (
            <p className="text-gray-500 text-center py-10">
              Please select a {accountType.toLowerCase()} from the dropdown to
              view account details.
            </p>
          )}

          {selectedAccountId && !accountDetails && (
            <div className="p-6 bg-white rounded-lg shadow-md flex justify-center items-center h-full text-gray-600">
              Loading selected {accountType.toLowerCase()}'s account details...
            </div>
          )}

          {selectedAccountId && accountDetails && personDetails && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                  <h3 className="sm:text-lg font-semibold text-blue-900/90 mb-2">
                    Account Summary
                  </h3>
                  <>
                    <Detail
                      label="Total Amount"
                      value={`${accountDetails.totalAmount.toFixed(2)}`}
                    />
                    <Detail
                      label="Total Paid"
                      value={`${accountDetails.paidAmount.toFixed(2)}`}
                    />
                    <Detail
                      label="Current Balance"
                      value={`${accountDetails.balance.toFixed(2)}`}
                    />
                  </>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                  <h3 className="sm:text-lg font-semibold text-blue-900/90 mb-2">
                    {accountType} Information
                  </h3>
                  <Detail label="Name" value={personDetails.name} />
                  <Detail label="Email" value={personDetails.email} />
                  <Detail label="Phone" value={personDetails.phone} />
                  <Detail label="Address" value={personDetails.address} />
                  {accountType === "Supplier" && (
                    <Detail label="Company" value={personDetails.companyName} />
                  )}
                  {accountType === "Employee" && (
                    <Detail label="Role" value={personDetails.role} />
                  )}
                  {accountType === "Customer" && (
                    <Detail label="CNIC" value={personDetails.cnic} />
                  )}
                </div>
              </div>
              <>
                <div className="flex justify-end mb-6">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-green-600 max-sm:text-sm cursor-pointer hover:bg-green-700 text-white font-bold py-2 px-5 rounded-md transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Clear Payment
                  </button>
                </div>
                <h3 className="text-xl max-sm:text-lg font-bold text-blue-900/90 mb-4 border-b pb-2">
                  Payment History
                </h3>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div>
                    <label className="block text-sm max-sm:text-xs font-medium text-gray-700">
                      Start Date:
                    </label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      className="p-2 border max-sm:text-xs border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm max-sm:text-xs font-medium text-gray-700">
                      End Date:
                    </label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      className="p-2 border border-gray-300 max-sm:text-xs rounded-md focus:ring-2 focus:ring-blue-900/80"
                    />
                  </div>
                  <div className="flex-grow mt-auto flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search by reference or notes..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full max-sm:text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
                    />
                  </div>
                </div>

                {filteredPayments.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                        <thead className="bg-blue-50 sticky top-0">
                          <tr>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">
                              S.No.
                            </th>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">
                              Date
                            </th>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">
                              Amount
                            </th>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">
                              Method
                            </th>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700">
                              Reference
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentPayments.map((payment, index) => (
                            <tr
                              key={index}
                              className="hover:bg-gray-50 text-sm max-sm:text-xs"
                            >
                              <td className="py-2 px-4 border-b text-gray-800">
                                {indexOfFirstRow + index + 1}
                              </td>
                              <td className="py-2 px-4 border-b text-gray-800">
                                {new Date(
                                  payment.paymentDate
                                ).toLocaleDateString()}
                              </td>
                              <td className="py-2 px-4 border-b text-gray-800">
                                {payment.amount.toFixed(2)}
                              </td>
                              <td className="py-2 px-4 border-b text-gray-800">
                                {payment.paymentMethod}
                              </td>
                              <td className="py-2 px-4 border-b text-gray-800">
                                {payment.referenceNumber || "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Pagination data={filteredPayments} />
                  </>
                ) : (
                  <p className="text-gray-500 text-center max-sm:text-sm py-4">
                    No payment history available for the selected criteria.
                  </p>
                )}
              </>
            </>
          )}
        </div>
      </div>
      {showPaymentModal && selectedAccountId && personDetails && (
        <AccountPaymentForm
          accountId={selectedAccountId}
          accountName={getPersonDisplayName(personDetails)}
          accountType={accountType}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default AccountDetailsPage;
