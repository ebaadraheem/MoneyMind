import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import useStore from "../../../store/useStore";
import PeopleApis from "../../../services/PeopleApis";
import EmployeeSalaryApis from "../../../services/EmployeeSalaryApis";
import { PaymentHistory,EmployeeSummary,UpdateSalaryForm,SalaryCycleProcessor,useApi } from "./SingleEmployeeComponents";
import AccountPaymentForm from "../AccountPaymentForm";

const ManageSingleEmployeeSalary = () => {
  const { employeeId: loggedInUserId, openModal } = useStore();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const sixMonthsAgo = useMemo(
    () => new Date(new Date().setMonth(new Date().getMonth() - 6)),
    []
  );
  const [historyStartDate, setHistoryStartDate] = useState(sixMonthsAgo);
  const [historyEndDate, setHistoryEndDate] = useState(new Date());

  // API Hooks
  const {
    data: employees,
    loading: employeesLoading,
    execute: fetchAllEmployees,
  } = useApi(PeopleApis.searchEmployees);
  const {
    data: employeeData,
    loading: detailsLoading,
    execute: fetchEmployeeDetails,
  } = useApi(EmployeeSalaryApis.getEmployeeSalaryDetails);
  const {
    data: paidHistory,
    loading: historyLoading,
    execute: fetchPaidHistory,
    setData: setPaidHistory,
  } = useApi(EmployeeSalaryApis.getPaidSalaryHistory);
  const { execute: updateSalaryApi, loading: updateLoading } = useApi(
    EmployeeSalaryApis.updateEmployeeBaseSalary
  );
  const { execute: processCycleApi, loading: processLoading } = useApi(
    EmployeeSalaryApis.processSalaryCycle
  );

  // Initial fetch for all employees
  useEffect(() => {
    fetchAllEmployees("");
  }, [fetchAllEmployees]);

  // Set initial selected employee
  useEffect(() => {
    if (!selectedEmployeeId && employees?.length > 0) {
      setSelectedEmployeeId(employees[0]._id);
    }
  }, [employees, selectedEmployeeId]);

  // Fetch details and history when selection or date range changes
  useEffect(() => {
    if (selectedEmployeeId) {
      fetchEmployeeDetails(selectedEmployeeId);
      fetchPaidHistory(selectedEmployeeId, historyStartDate, historyEndDate);
    }
  }, [
    selectedEmployeeId,
    historyStartDate,
    historyEndDate,
    fetchEmployeeDetails,
    fetchPaidHistory,
  ]);

  const handleUpdateBaseSalary = async (newSalary) => {
    toast.dismiss();
    await updateSalaryApi(selectedEmployeeId, newSalary);
    toast.success("Base salary updated successfully!");
    fetchEmployeeDetails(selectedEmployeeId); // Re-fetch details
  };

  const handleProcessSalaryCycle = (year, month) => {
    if (!loggedInUserId) {
      return toast.error("User not logged in or ID unavailable.");
    }
    openModal(
      "confirm",
      `Process salaries for ALL employees for ${month}/${year}? This is irreversible.`,
      async () => {
        await processCycleApi(year, month);
        toast.success("Salary cycle processed successfully.");
        fetchEmployeeDetails(selectedEmployeeId);
      }
    );
  };

  const handlePaymentSuccess = useCallback(() => {
    setShowPaymentModal(false);
    fetchEmployeeDetails(selectedEmployeeId);
    fetchPaidHistory(selectedEmployeeId, historyStartDate, historyEndDate);
  }, [
    selectedEmployeeId,
    historyStartDate,
    historyEndDate,
    fetchEmployeeDetails,
    fetchPaidHistory,
  ]);

  const isLoading =
    employeesLoading ||
    detailsLoading ||
    updateLoading ||
    processLoading ||
    historyLoading;
  const employeeDetails = employeeData?.employee;
  const employeeAccount = employeeData?.employeeAccount;

  return (
    <div className=" ">

      {/* Employee Selection */}
      <div className="mb-6">
        <label
          htmlFor="employeeSelect"
          className="block text-sm max-sm:text-xs font-medium text-gray-700 mb-2"
        >
          Select Employee:
        </label>
        <select
          id="employeeSelect"
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
          className="w-full md:w-1/2 max-sm:text-xs cursor-pointer p-2 border border-gray-300 rounded-md"
          disabled={isLoading}
        >
          {employees?.length > 0 ? (
            employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name} ({emp.role})
              </option>
            ))
          ) : (
            <option disabled>
              {employeesLoading ? "Loading..." : "No employees found"}
            </option>
          )}
        </select>
      </div>

      {isLoading && !employeeDetails && (
        <p className="text-center text-gray-600 py-10">
          Loading Employee Data...
        </p>
      )}

      {!isLoading && !employeeDetails && selectedEmployeeId && (
        <p className="text-center text-gray-600 py-10">
          Could not find details for the selected employee.
        </p>
      )}

      {employeeDetails && employeeAccount && (
        <>
          <EmployeeSummary
            details={employeeDetails}
            account={employeeAccount}
          />
          <UpdateSalaryForm
            initialSalary={employeeDetails.salary || ""}
            onUpdate={handleUpdateBaseSalary}
            loading={updateLoading}
          />
          <PaymentHistory
            history={paidHistory || []}
            startDate={historyStartDate}
            onStartDateChange={setHistoryStartDate}
            endDate={historyEndDate}
            onEndDateChange={setHistoryEndDate}
            onClearPayment={() => setShowPaymentModal(true)}
          />
        </>
      )}

      <SalaryCycleProcessor
        onProcess={handleProcessSalaryCycle}
        loading={processLoading}
      />

      {showPaymentModal && employeeDetails && (
        <AccountPaymentForm
          accountId={selectedEmployeeId}
          accountName={employeeDetails.name}
          accountType={"Employee"}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default ManageSingleEmployeeSalary;
