import React, { useState, useEffect, useCallback, Fragment } from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import useStore from "../../store/useStore";
import AttendanceApis from "../../services/AttendanceApis";
import { Dialog, Transition } from "@headlessui/react";
import PeopleApis from "../../services/PeopleApis";

const AttendanceFormModal = ({ attendanceRecord, onClose, onSuccess }) => {
  const { setLoading, setError, loading, employees, setEmployees } = useStore();
  const [formData, setFormData] = useState({
    employeeId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    status: "Present",
    clockInTime: format(new Date(), "HH:mm"),
    clockOutTime: format(new Date(), "HH:mm"),
  });
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);

  useEffect(() => {
    if (attendanceRecord) {
      setIsEditMode(true);
      setFormData({
        employeeId: attendanceRecord.employee._id,
        date: format(new Date(attendanceRecord.date), "yyyy-MM-dd"),
        status: attendanceRecord.status,
        clockInTime: attendanceRecord.clockInTime
          ? format(new Date(attendanceRecord.clockInTime), "HH:mm")
          : "",
        clockOutTime: attendanceRecord.clockOutTime
          ? format(new Date(attendanceRecord.clockOutTime), "HH:mm")
          : "",
      });
    } else {
      setIsEditMode(false);
      setFormData({
        employeeId: "",
        date: format(new Date(), "yyyy-MM-dd"),
        status: "Present",
        clockInTime: format(new Date(), "HH:mm"),
        clockOutTime: format(new Date(), "HH:mm"),
      });
    }
    setShowModal(true);
  }, [attendanceRecord]);

  useEffect(() => {
    const fetchEmployeesForDropdown = async () => {
      if (!isEditMode && employees.length === 0) {
        setLoading(true);
        try {
          const fetchedEmployees = await PeopleApis.searchEmployees("");
          setEmployees(fetchedEmployees);
          setAvailableEmployees(fetchedEmployees);
        } catch (err) {
          toast.error("Failed to load employees for selection.");
          setError("Failed to fetch employees for selection: " + err.message);
        } finally {
          setLoading(false);
        }
      } else if (!isEditMode && employees.length > 0) {
        setAvailableEmployees(employees);
      } else if (isEditMode) {
        setAvailableEmployees([]);
      }
    };

    fetchEmployeesForDropdown();
  }, [isEditMode, employees, setEmployees, setLoading, setError]);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    if(name==="status" && (value === "Absent" || value === "Leave")) {
      setFormData((prev) => ({
        ...prev,
        status: value,
        clockInTime: "",
        clockOutTime: "",
      }));
      return;
    }
    if(name==="status" && value === "Present") {
      setFormData((prev) => ({
        ...prev,
        status: value,
        clockInTime: prev.clockInTime || format(new Date(), "HH:mm"),
        clockOutTime: prev.clockOutTime || format(new Date(), "HH:mm"),
      }));
      return; 
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();

    setLoading(true);
    setError(null);

    const { employeeId, date, status, clockInTime, clockOutTime } = formData;
    if (!isEditMode && !employeeId) {
      toast.error("Please select an employee.");
      setLoading(false);
      return;
    }

    const targetDate = isEditMode
      ? new Date(attendanceRecord.date)
      : new Date(date);

    let ciTime = null;
    if (clockInTime) {
      ciTime = new Date(targetDate);
      const [hours, minutes] = clockInTime.split(":").map(Number);
      ciTime.setHours(hours, minutes, 0, 0);
    }

    let coTime = null;
    if (clockOutTime) {
      coTime = new Date(targetDate);
      const [hours, minutes] = clockOutTime.split(":").map(Number);
      coTime.setHours(hours, minutes, 0, 0);
      if (ciTime && coTime && coTime <= ciTime) {
        toast.error(
          "Clock-In time must be before Clock-Out time."
        );
        setLoading(false);
        return;
      }
    }
    if (status === "Present" && (!ciTime || !coTime)) {
      toast.error(
        "Clock-in and Clock-out times are required for 'Present' status."
      );
      setLoading(false);
      return;
    }

    if (status !== "Present" && (ciTime || coTime)) {
      ciTime = null;
      coTime = null;
    }
    if (status === "Present" && ciTime && coTime && coTime <= ciTime) {
      toast.error("Clock-out time cannot be before or equal to clock-in time.");
      setLoading(false);
      return;
    }

    try {
      if (isEditMode) {
        const updatedRecord = {
          status,
          clockInTime: ciTime ? ciTime.toISOString() : null,
          clockOutTime: coTime ? coTime.toISOString() : null,
        };
        await AttendanceApis.updateAttendance(
          attendanceRecord._id,
          updatedRecord
        );
        toast.success("Attendance updated successfully!");
      } else {
        const existingRecordsForDate = await AttendanceApis.getAttendanceByDate(
          new Date(date)
        );
        const duplicateRecord = existingRecordsForDate.find(
          (record) => record.employee._id === employeeId
        );

        if (duplicateRecord) {
          toast.error(
            "Attendance for this employee on this date already exists."
          );
          setLoading(false);
          return;
        }
        const newRecord = {
          employeeId: employeeId,
          date: format(new Date(date), "yyyy-MM-dd"),
          status,
          clockInTime: ciTime ? ciTime.toISOString() : null,
          clockOutTime: coTime ? coTime.toISOString() : null,
        };
        await AttendanceApis.markAttendance([newRecord]);
        toast.success("New attendance record added successfully!");
      }
      onSuccess();
    } catch (err) {
      toast.error(`Failed to ${isEditMode ? "update" : "add"} attendance.`);
      setError(
        `Failed to ${isEditMode ? "update" : "add"} attendance: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setTimeout(() => onClose(), 300);
  }, [onClose]);

  if (!showModal) return null;

  return (
    <Transition appear show={showModal} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-md bg-white p-6 text-left align-middle shadow-xl transition-all border-t-4 border-blue-900/90 text-blue-900/80">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6 text-blue-900/90 mb-4"
                >
                  {isEditMode
                    ? `Edit Attendance for ${
                        attendanceRecord.employeeName || "N/A"
                      } on ${format(
                        new Date(attendanceRecord.date),
                        "MMM dd, yyyy"
                      )}`
                    : `Add New Attendance for ${format(
                        new Date(formData.date),
                        "MMM dd, yyyy"
                      )}`}
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="date"
                      className="block text-sm max-sm:text-xs font-medium text-gray-700"
                    >
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={format(new Date(formData.date), "yyyy-MM-dd")}
                      onChange={handleFormChange}
                      className="mt-1 block max-sm:text-sm w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-900/90 focus:border-blue-900/90 sm:text-sm"
                      required
                    />
                  </div>
                  {!isEditMode && (
                    <div>
                      <label
                        htmlFor="employeeId"
                        className="block text-sm max-sm:text-xs font-medium text-gray-700"
                      >
                        Select Employee
                      </label>
                      <select
                        id="employeeId"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleFormChange}
                        className="mt-1 block max-sm:text-sm w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-900/90 focus:border-blue-900/90 sm:text-sm"
                        required
                        disabled={loading}
                      >
                        <option value="">-- Select an employee --</option>
                        {availableEmployees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.name} ({emp.cnic})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm max-sm:text-xs font-medium text-gray-700"
                    >
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="mt-1 block max-sm:text-sm w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-900/90 focus:border-blue-900/90 sm:text-sm"
                      disabled={loading}
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Leave">Leave</option>
                    </select>
                  </div>

                  {formData.status === "Present" && (
                    <>
                      <div>
                        <label
                          htmlFor="clockInTime"
                          className="block text-sm max-sm:text-xs font-medium text-gray-700"
                        >
                          Clock In Time
                        </label>
                        <input
                          type="time"
                          id="clockInTime"
                          name="clockInTime"
                          value={formData.clockInTime}
                          onChange={handleFormChange}
                          className="mt-1 block max-sm:text-sm w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-900/90 focus:border-blue-900/90 sm:text-sm"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="clockOutTime"
                          className="block text-sm max-sm:text-xs font-medium text-gray-700"
                        >
                          Clock Out Time
                        </label>
                        <input
                          type="time"
                          id="clockOutTime"
                          name="clockOutTime"
                          value={formData.clockOutTime}
                          onChange={handleFormChange}
                          className="mt-1 block max-sm:text-sm w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-900/90 focus:border-blue-900/90 sm:text-sm"
                          disabled={loading}
                        />
                      </div>
                    </>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-sm max-sm:text-xs cursor-pointer font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 max-sm:text-xs cursor-pointer text-sm font-medium text-white bg-blue-900/80 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2  disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AttendanceFormModal;
