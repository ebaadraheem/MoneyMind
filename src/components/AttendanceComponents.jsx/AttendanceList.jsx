import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import useStore from "../../store/useStore";
import AttendanceApis from "../../services/AttendanceApis";
import AttendanceFormModal from "./AttendanceFormModal";
import Pagination from "../../hooks/usePagination";

const AttendanceList = () => {
  const {
    setLoading,
    setError,
    loading,
    openModal,
    employees,
    setEmployees,
    currentPage,
    setCurrentPage,
    rowsPerPage,
  } = useStore();
  const [attendances, setAttendances] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedAttendanceForEdit, setSelectedAttendanceForEdit] =
    useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAttendances = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedRecords = await AttendanceApis.getAttendanceList(
        startDate,
        endDate
      );
      setAttendances(fetchedRecords);
    } catch (err) {
      toast.error("Failed to load attendance list.");
      setError("Failed to fetch attendance list.");
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, startDate, endDate]);

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
    fetchAttendances();
  }, [fetchAttendances]);

  const handleEdit = (record) => {
    setSelectedAttendanceForEdit({
      ...record,
      employeeName: record.employee.name,
      employeeId: record.employee._id,
    });
    setIsModalOpen(true);
  };

  const handleAddNewAttendance = () => {
    setSelectedAttendanceForEdit(null);
    setIsModalOpen(true);
  };

  const handleDelete = (recordId, employeeName, attendanceDate) => {
    openModal(
      "confirm",
      `Are you sure you want to delete ${employeeName}'s attendance for ${format(
        new Date(attendanceDate),
        "MMM dd, yyyy"
      )}?`,
      async () => {
        setLoading(true);
        try {
          await AttendanceApis.deleteAttendance(recordId);
          toast.success("Attendance record deleted.");
          fetchAttendances();
        } catch (err) {
          toast.error("Failed to delete attendance record.");
          setError("Failed to delete record.");
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleAttendanceActionSuccess = () => {
    setSelectedAttendanceForEdit(null);
    setIsModalOpen(false);
    fetchAttendances();
  };

  const handleCloseModal = () => {
    setSelectedAttendanceForEdit(null);
    setIsModalOpen(false);
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentData = attendances.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4 flex justify-between flex-wrap gap-2 items-center">
        <h2 className="text-2xl max-sm:text-lg font-bold text-blue-900/90 flex items-center">
          <img
            src="/list-blue.png"
            alt="Attendance Icon"
            className="w-7 h-7 max-sm:w-6 max-sm:h-6 mr-2"
          />
          Attendance List
        </h2>

        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm max-sm:text-xs font-medium text-gray-700 mb-1"
            >
              Start Date:
            </label>
            <input
              type="date"
              id="startDate"
              value={format(startDate, "yyyy-MM-dd")}
              onChange={(e) => {
                setStartDate(new Date(e.target.value));
              }}
              className="p-2 border max-sm:text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm max-sm:text-xs  font-medium text-gray-700 mb-1"
            >
              End Date:
            </label>
            <input
              type="date"
              id="endDate"
              value={format(endDate, "yyyy-MM-dd")}
              onChange={(e) => {
                setEndDate(new Date(e.target.value));
              }}
              className="p-2 border max-sm:text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 outline-none"
            />
          </div>
          <div>
            <button
              onClick={handleAddNewAttendance}
              className="px-4 py-2 max-sm:text-sm bg-blue-900/80 cursor-pointer text-white rounded-md hover:bg-blue-900/90 transition-colors"
            >
              Add New Attendance
            </button>
          </div>
        </div>
      </div>

      {loading && attendances.length === 0 ? (
        <p className="text-center text-gray-600">
          Loading attendance records...
        </p>
      ) : (
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
                  CNIC
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Clock In
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Clock Out
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendances.length === 0 ? (
                <tr className="text-center text-gray-600 ">
                  <td colSpan="8" className=" py-4">
                    No attendance records found for selected date.
                  </td>
                </tr>
              ) : (
                currentData.map((record, index) => (
                  <tr
                    key={record._id}
                    className="hover:bg-gray-50 max-sm:text-xs text-sm"
                  >
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {indexOfFirstRow+index + 1}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  font-medium text-gray-900">
                      {record.employee?.name || "N/A"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {record.employee?.cnic || "N/A"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {record.clockInTime
                        ? format(new Date(record.clockInTime), "hh:mm a")
                        : "N/A"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {record.clockOutTime
                        ? format(new Date(record.clockOutTime), "hh:mm a")
                        : "N/A"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {format(new Date(record.date), "MMM dd, yyyy")}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === "Present"
                            ? "bg-green-100 text-green-800"
                            : record.status === "Absent"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  font-medium flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(record)}
                        className="text-blue-900/80 cursor-pointer hover:text-blue-900/95 transition-colors"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(
                            record._id,
                            record.employee?.name,
                            record.date
                          )
                        }
                        className="text-red-600 cursor-pointer hover:text-red-900 transition-colors"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination data={attendances} />
        </div>
      )}

      {isModalOpen && (
        <AttendanceFormModal
          attendanceRecord={selectedAttendanceForEdit}
          onClose={handleCloseModal}
          onSuccess={handleAttendanceActionSuccess}
        />
      )}
    </div>
  );
};

export default AttendanceList;
