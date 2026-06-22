import { DatePicker, Detail } from "../../../utils/functions";
import { format } from "date-fns";
import { useState, useEffect, useCallback, useMemo } from "react";
import EmployeeSalaryApis from "../../../services/EmployeeSalaryApis";
import { toast } from "react-hot-toast";
import useStore from "../../../store/useStore";
import Pagination from "../../../hooks/usePagination";

// --- Custom Hook for API Calls ---
const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setError: setGlobalError } = useStore();

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunc(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        setGlobalError(err.message);
        toast.error(`Error: ${err.message}`);
        return Promise.reject(err);
      } finally {
        setLoading(false);
      }
    },
    [apiFunc, setGlobalError]
  );

  return { data, loading, error, execute, setData };
};

const EmployeeSummary = ({ details, account }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
      <h3 className="sm:text-lg font-semibold text-blue-900/90 mb-2">
        Employee Information
      </h3>
      <Detail label="Name" value={details.name} />
      <Detail label="Role" value={details.role} />
      <Detail label="CNIC" value={details.cnic} />
      <Detail label="Phone" value={details.phone} />
      <Detail label="Base Salary" value={details.salary} currency />
    </div>
    <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
      <h3 className="sm:text-lg font-semibold text-blue-900/90 mb-2">
        Account Summary
      </h3>
      <Detail
        label="Total Salary Owed"
        value={account.totalAmount || "0"}
        currency
      />
      <Detail label="Total Paid" value={account.paidAmount || "0"} currency />
      <Detail
        label="Current Balance"
        value={account.balance || "0"}
        currency
        colorClass={account.balance < 0 ? "text-red-700" : "text-green-700"}
      />
      {account.balance !== 0 && (
        <p
          className={`text-sm max-sm:text-xs mt-2 ${
            account.balance < 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          {account.balance < 0
            ? "Employee owes the company."
            : "Company owes employee."}
        </p>
      )}
    </div>
  </div>
);
const PaymentHistory = ({
  history,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onClearPayment,
}) => {
const {rowsPerPage,currentPage, setCurrentPage}=useStore();
  // Reset page to 1 when history data changes (new employee/date range)
  useEffect(() => {
    setCurrentPage(1);
  }, [history]);

  // --- Calculate current rows for the page ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentHistory = history.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-1">
        <h3 className="sm:text-lg font-semibold text-gray-800 mb-4">
          Paid Salary History
        </h3>
        <button
          onClick={onClearPayment}
          className="bg-green-600 max-sm:text-sm cursor-pointer hover:bg-green-700 text-white font-bold py-2 px-5 rounded-md transition duration-300"
        >
          Clear Payment
        </button>
      </div>
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <div>
          <label className="block text-sm max-sm:text-xs font-medium text-gray-700">
            From Date:
          </label>
          <DatePicker
            selected={startDate}
            onChange={onStartDateChange}
            className="p-2 border max-sm:text-xs rounded"
          />
        </div>
        <div>
          <label className="block text-sm max-sm:text-xs font-medium text-gray-700">
            To Date:
          </label>
          <DatePicker
            selected={endDate}
            onChange={onEndDateChange}
            className="p-2 border max-sm:text-xs rounded"
          />
        </div>
      </div>
      {history.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    S.No.
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentHistory.map((payment,index) => (
                  <tr
                    key={payment._id}
                    className="hover:bg-gray-50 text-sm max-sm:text-xs"
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                      {indexOfFirstRow + index + 1}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                      {format(new Date(payment.paymentDate), "MMM dd, yyyy")}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                      {payment.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                      {payment.referenceNumber || "N/A"}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {payment.notes || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination data={history} />
        </>
      ) : (
        <p className="text-center max-sm:text-sm text-gray-600 mt-4">
          No paid salary records found for this period.
        </p>
      )}
    </div>
  );
}
const UpdateSalaryForm = ({ initialSalary, onUpdate, loading }) => {
  const [newBaseSalary, setNewBaseSalary] = useState(initialSalary);

  useEffect(() => {
    setNewBaseSalary(initialSalary);
  }, [initialSalary]);

  const isInvalid = newBaseSalary === "" || parseFloat(newBaseSalary) < 0;
  const isDisabled = loading || isInvalid;

  const handleUpdate = () => {
    if (!isDisabled) {
      onUpdate(parseFloat(newBaseSalary));
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
      <h3 className="sm:text-lg font-semibold text-gray-800 mb-4">
        Set/Update Base Salary
      </h3>
      <div className="flex flex-row flex-wrap gap-3 items-end">
        <div className="flex-grow">
          <label
            htmlFor="newBaseSalary"
            className="block text-sm max-sm:text-xs font-medium text-gray-700 mb-1"
          >
            New Base Salary:
          </label>
          <input
            type="number"
            id="newBaseSalary"
            value={newBaseSalary}
            onChange={(e) => setNewBaseSalary(e.target.value)}
            min="0"
            className="w-full max-sm:text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 outline-none"
          />
        </div>
        <button
          onClick={handleUpdate}
          disabled={isDisabled}
          className={`px-6 py-2 max-sm:text-sm rounded-md text-white cursor-pointer font-semibold transition duration-300 ${
            isDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-900/80 hover:bg-blue-900/90"
          }`}
        >
          Update Salary
        </button>
      </div>
    </div>
  );
};

const SalaryCycleProcessor = ({ onProcess, loading }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const {employeeId} = useStore();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const {
    data: history = [],
    execute: fetchHistory,
    loading: historyLoading,
  } = useApi(EmployeeSalaryApis.getSalaryCycleHistory);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const isProcessed = useMemo(
    () => history && history.some((c) => c.year === year && c.month === month),
    [history, year, month]
  );
   const handleProcess = () => {
    onProcess(year, month, employeeId);
  };
  const isCurrentCycle = useMemo(
    () =>
      year === new Date().getFullYear() && month === new Date().getMonth() + 1,
    [year, month]
  );
  const isDisabled =
    loading || historyLoading || !isCurrentCycle || isProcessed;

 

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="sm:text-lg font-semibold text-gray-800 mb-4">
        Process Monthly Salary Cycle (For All Employees)
      </h3>
      <div className="flex flex-row flex-wrap gap-3 items-end">
        <div className="flex-grow">
          <label
            htmlFor="cycleMonth"
            className="block text-sm max-sm:text-xs font-medium text-gray-700 mb-1"
          >
            Month:
          </label>
          <select
            id="cycleMonth"
            value={month}
            disabled={isDisabled}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className={`w-full p-2 max-sm:text-sm border border-gray-300 rounded-md ${
              isDisabled ? "cursor-not-allowed" : ""
            }`}
          >
            {[...Array(12).keys()].map((i) => (
              <option key={i + 1} value={i + 1}>
                {format(new Date(2000, i, 1), "MMMM")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-grow">
          <label
            htmlFor="cycleYear"
            className="block text-sm max-sm:text-xs font-medium text-gray-700 mb-1"
          >
            Year:
          </label>
          <input
            type="number"
            disabled={isDisabled}
            id="cycleYear"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            min="2000"
            max={new Date().getFullYear()}
            className={`w-full p-2 border max-sm:text-sm border-gray-300 rounded-md ${
              isDisabled ? "cursor-not-allowed" : ""
            }`}
          />
        </div>
        <button
          onClick={handleProcess}
          disabled={isDisabled}
          className={`px-6 py-2 max-sm:text-sm rounded-md text-white font-semibold transition duration-300 ${
            isDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          Process Cycle
        </button>
      </div>
      {isProcessed && (
        <p className="text-sm max-sm:text-xs text-green-600 mt-2">
          Salaries for {format(new Date(year, month - 1), "MMMM yyyy")} have
          already been processed.
        </p>
      )}
    </div>
  );
};

export {
  EmployeeSummary,
  PaymentHistory,
  UpdateSalaryForm,
  SalaryCycleProcessor,
  useApi,
};
