import { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import useStore from "../../store/useStore";
import PeopleApis from "../../services/PeopleApis";
import AttendanceApis from "../../services/AttendanceApis";
import Pagination from "../../hooks/usePagination";

const EmployeeAttendance = () => {
  const { setLoading, setError, loading, employees, setEmployees, currentPage, setCurrentPage, rowsPerPage } = useStore();
  const [attendanceDate, setAttendanceDate] = useState(new Date());
  const [dailyAttendance, setDailyAttendance] = useState({});
  const [isCompleteAttendance, setIsCompleteAttendance] = useState(false);
  const [hasAnyExistingAttendanceForDate, setHasAnyExistingAttendanceForDate] =
    useState(false);

  const formatToISOWithDate = useCallback(
    (time) => {
      if (!time) return null;
      const date = new Date(attendanceDate);
      date.setHours(time.getHours(), time.getMinutes(), 0, 0);
      return date.toISOString();
    },
    [attendanceDate]
  );

  const fetchAttendanceRecords = useCallback(
    async (currentEmployees) => {
      if (!attendanceDate || currentEmployees.length === 0) {
        setDailyAttendance({});
        setHasAnyExistingAttendanceForDate(false);
        setIsCompleteAttendance(false);
        return;
      }
      setLoading(true);
      try {
        const existingRecords = await AttendanceApis.getAttendanceByDate(
          attendanceDate
        );

        let recordsMap;

        if (!existingRecords || existingRecords.length === 0) {
          recordsMap = Object.fromEntries(
            currentEmployees.map((emp) => [
              emp._id,
              {
                status: "Present",
                clockInTime: new Date(attendanceDate),
                clockOutTime: new Date(attendanceDate),
                _id: null,
                date: attendanceDate,
              },
            ])
          );
          setHasAnyExistingAttendanceForDate(false);
          setIsCompleteAttendance(false);
        } else {
          recordsMap = Object.fromEntries(
            existingRecords.map((record) => [
              record.employee._id,
              {
                status: record.status,
                clockInTime: record.clockInTime
                  ? new Date(record.clockInTime)
                  : null,
                clockOutTime: record.clockOutTime
                  ? new Date(record.clockOutTime)
                  : null,
                _id: record._id,
                date: record.date ? new Date(record.date) : null,
              },
            ])
          );
          setIsCompleteAttendance(
            Object.keys(recordsMap).length === currentEmployees.length
          );
          setHasAnyExistingAttendanceForDate(true);
        }

        setDailyAttendance(recordsMap);
      } catch (err) {
        toast.dismiss();
        toast.error("Failed to load existing attendance.");
        setError("Failed to fetch existing attendance: " + err.message);
        setDailyAttendance({});
        setHasAnyExistingAttendanceForDate(false);
      } finally {
        setLoading(false);
      }
    },
    [
      attendanceDate,
      setLoading,
      setError,
      setDailyAttendance,
      setHasAnyExistingAttendanceForDate,
      setIsCompleteAttendance,
    ]
  );

  useEffect(() => {
    const loadEmployees = async () => {
      if (employees.length === 0) {
        setLoading(true);
        try {
          const fetchedEmployees = await PeopleApis.searchEmployees("");
          setEmployees(fetchedEmployees);
        } catch (err) {
          setError("Failed to fetch employees: " + err.message);
        } finally {
          setLoading(false);
        }
      }
    };
    loadEmployees();
  }, [employees.length, setEmployees, setLoading, setError]);

  useEffect(() => {
    if (employees.length > 0) {
      fetchAttendanceRecords(employees); 
    }
  }, [attendanceDate, employees, fetchAttendanceRecords]);

  const handleAttendanceChange = useCallback(
    (employeeId, field, value) => {
      setDailyAttendance((prev) => {
        const current = prev[employeeId] || {
          status: "Present",
          clockInTime: null,
          clockOutTime: null,
          _id: null,
          date: attendanceDate,
        };
        let updated = { ...current, [field]: value };
        if (field === "status" && (value === "Absent" || value === "Leave")) {
          updated.clockInTime = null;
          updated.clockOutTime = null;
        } else if (
          (field === "clockInTime" || field === "clockOutTime") &&
          (updated.status === "Absent" || updated.status === "Leave") &&
          value !== null
        ) {
          updated.status = "Present";
        }
        if (field === "status" && value === "Present") {
          updated.clockInTime = updated.clockInTime || new Date(attendanceDate);
          updated.clockOutTime =
            updated.clockOutTime || new Date(attendanceDate);
        }
        return { ...prev, [employeeId]: updated };
      });
    },
    [attendanceDate]
  );

  const handleSubmitAllAttendance = useCallback(async () => {
    toast.dismiss();
    if (loading) return;

    setLoading(true);

    const todayFormatted = format(attendanceDate, "yyyy-MM-dd");
    let hasClientSideError = false;

    const recordsToCreate = [];

    for (const emp of employees) {
      const record = dailyAttendance[emp._id];
      const dataToSubmit = record || {
        status: "Present",
        clockInTime: null,
        clockOutTime: null,
      };

      const clockInIso = dataToSubmit.clockInTime
        ? formatToISOWithDate(dataToSubmit.clockInTime)
        : null;
      const clockOutIso = dataToSubmit.clockOutTime
        ? formatToISOWithDate(dataToSubmit.clockOutTime)
        : null;
      if (dataToSubmit.status === "Present") {
        if (!clockInIso || !clockOutIso) {
          toast.error(
            `Clock-in and Clock-out times are required for 'Present' status.`
          );
          hasClientSideError = true;
          break;
        }
        if (new Date(clockInIso) >= new Date(clockOutIso)) {
          toast.error(`Clock-in time must be before Clock-out time.`);
          hasClientSideError = true;
          break;
        }
      } else if (
        dataToSubmit.status === "Absent" ||
        dataToSubmit.status === "Leave"
      ) {
        if (clockInIso || clockOutIso) {
          toast.error(
            `Error: Time entries should be empty for '${dataToSubmit.status}' status.`
          );
          hasClientSideError = true;
          break;
        }
      }

      recordsToCreate.push({
        employeeId: emp._id,
        date: todayFormatted,
        status: dataToSubmit.status,
        clockInTime: clockInIso,
        clockOutTime: clockOutIso,
      });
    }

    if (hasClientSideError) {
      setLoading(false);
      return;
    }

    if (recordsToCreate.length === 0) {
      toast.info("No new attendance records to save for this date.");
      setLoading(false);
      return;
    }

    try {
      const { message, results } = await AttendanceApis.markAttendance(
        recordsToCreate
      );

      if (results.failed?.length) {
        toast.dismiss();
        toast.error(`${message} Some new records failed to save.`);
        results.errors?.forEach((e) => console.error("Error:", e));
      } else {
        toast.success(message);
      }

      await fetchAttendanceRecords(employees);
    } catch (err) {
      toast.dismiss();
      toast.error("Server error. Failed to mark attendance.");
      setError("Mark attendance failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [
    attendanceDate,
    employees,
    dailyAttendance,
    formatToISOWithDate,
    loading,
    fetchAttendanceRecords,
  ]);

  const handleDateChange = useCallback((e) => {
    setAttendanceDate(new Date(e.target.value));
  }, []);

  const handleTimeChange = useCallback(
    (employeeId, field, timeStr) => {
      if (!timeStr) {
        handleAttendanceChange(employeeId, field, null);
        return;
      }
      const [hours, minutes] = timeStr.split(":").map(Number);
      const time = new Date(attendanceDate);
      time.setHours(hours, minutes, 0, 0);
      handleAttendanceChange(employeeId, field, time);
    },
    [attendanceDate, handleAttendanceChange]
  );

  const formatDateForInput = (date) => format(date, "yyyy-MM-dd");

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentData = employees.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl max-sm:text-lg font-bold flex gap-2 text-blue-900/90 mb-4">
        <img src="/attendance-blue.png" className="w-8 h-8 max-sm:w-7 max-sm:h-7" alt="" />
        Employees Attendance
      </h2>

      <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
        <div>
          <label
            htmlFor="attendanceDate"
            className="block text-sm max-sm:text-xs font-medium text-gray-700 mb-1"
          >
            Select Date:
          </label>
          <input
            type="date"
            id="attendanceDate"
            value={formatDateForInput(attendanceDate)}
            onChange={handleDateChange}
            className="p-2 border max-sm:text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 outline-none"
            max={formatDateForInput(new Date())}
          />
        </div>

        {isCompleteAttendance ? (
          <p className="text-green-600 max-sm:text-sm font-semibold text-sm">
            All employees have attendance marked for this date.
          </p>
        ) : hasAnyExistingAttendanceForDate ? (
          <p className="text-green-600 max-sm:text-sm font-semibold text-sm mt-6">
            Some employees already have attendance marked for this date.
          </p>
        ) : (
          <></>
        )}
      </div>
      {loading && employees.length === 0 ? (
        <p className="text-center text-gray-600">Loading employees...</p>
      ) : employees.length === 0 ? (
        <p className="text-center text-gray-600">No employees found.</p>
      ) : (
        <div className="overflow-x-auto max-h-[600px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50 sticky top-0">
              <tr>
                {[
                  "S.No.",
                  "Employee Name",
                  "CNIC",
                  "Clock In",
                  "Clock Out",
                  "Status",
                ].map((label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailyAttendance &&
                currentData.map((emp,index) => {
                  const record = dailyAttendance[emp._id] || {};
                  const isEmployeeAttendanceMarked = !!record._id;

                  const isDisabledForTimes =
                    isEmployeeAttendanceMarked ||
                    record.status === "Absent" ||
                    record.status === "Leave";

                  return (
                    <tr key={emp._id} className="hover:bg-gray-50 max-sm:text-xs text-sm">
                      <td className="px-4 py-2  font-medium text-gray-900">
                        {indexOfFirstRow+index + 1}
                      </td>
                      <td className="px-4 py-2  font-medium text-gray-900">
                        {emp.name}
                      </td>
                      <td className="px-4 py-2  text-gray-700">
                        {emp.cnic || "N/A"}
                      </td>

                      {["clockInTime", "clockOutTime"].map((field) => (
                        <td
                          key={field}
                          className="px-4 py-2  text-gray-700"
                        >
                          <input
                            type="time"
                            value={
                              record[field]
                                ? format(record[field], "HH:mm")
                                : ""
                            }
                            onChange={(e) =>
                              handleTimeChange(emp._id, field, e.target.value)
                            }
                            disabled={isDisabledForTimes}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"
                          />
                        </td>
                      ))}

                      <td className="px-4 py-2  text-gray-700">
                        <select
                          value={record.status || "Present"}
                          onChange={(e) =>
                            handleAttendanceChange(
                              emp._id,
                              "status",
                              e.target.value
                            )
                          }
                          disabled={isEmployeeAttendanceMarked}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"
                        >
                          {["Present", "Absent", "Leave"].map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <Pagination data={employees} />

        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmitAllAttendance}
          disabled={loading || employees.length === 0 || isCompleteAttendance}
          className={`px-6 max-sm:px-5 py-2 max-sm:text-sm  rounded-md text-white font-semibold transition duration-300 ${
            loading || employees.length === 0 || isCompleteAttendance
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-900/80 hover:bg-blue-900/90 "
          }`}
        >
          Save New Attendance
        </button>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
