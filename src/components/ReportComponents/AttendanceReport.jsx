import React, { useState, useEffect, useCallback, useRef } from "react";
import { format, isValid, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import { renderToString } from "react-dom/server"; // Import renderToString
import useStore from "../../store/useStore";
import AttendanceApis from "../../services/AttendanceApis";
import { PrintIcon } from "../../utils/Icons";
import Pagination from "../../hooks/usePagination";

// New component for the printable report content
const PrintableAttendanceReport = ({ data, startDate, endDate }) => (
  <div className="p-2">
    <div className="text-center mb-4">
      <h1 className="text-2xl font-bold">Attendance Report</h1>
      <p className="text-xs">
        From: {isValid(startDate) ? format(startDate, "MMM dd, yyyy") : "N/A"}{" "}
        To: {isValid(endDate) ? format(endDate, "MMM dd, yyyy") : "N/A"}
      </p>
    </div>
    <table className="w-full text-xs border-collapse">
      <thead className="border-t border-b border-black">
        <tr>
          <th className="p-1 text-left">S.No.</th>
          <th className="p-1 text-left">Employee Name</th>
          <th className="p-1 text-left">CNIC</th>

          <th className="p-1 text-left">Clock In</th>
          <th className="p-1 text-left">Clock Out</th>
          <th className="p-1 text-left">Date</th>
          <th className="p-1 text-left">Status</th>
        </tr>
      </thead>
      <tbody className="border-b border-black">
        {data && data.length > 0 ? (
          data.map((record, index) => (
            <tr key={record._id}>
              <td className="p-1">{index + 1}</td>
              <td className="p-1">{record.employee?.name || "N/A"}</td>
              <td className="p-1">{record.employee?.cnic || "N/A"}</td>

              <td className="p-1">
                {record.clockInTime
                  ? format(new Date(record.clockInTime), "hh:mm a")
                  : "N/A"}
              </td>
              <td className="p-1">
                {record.clockOutTime
                  ? format(new Date(record.clockOutTime), "hh:mm a")
                  : "N/A"}
              </td>
              <td className="p-1">
                {format(new Date(record.date), "MMM dd, yyyy")}
              </td>
              <td className="p-1">
                <span
                  // These classes need to be defined in the iframe's style block
                  className={`${
                    record.status === "Present"
                      ? "status-present"
                      : record.status === "Absent"
                      ? "status-absent"
                      : "status-leave"
                  }`}
                >
                  {record.status}
                </span>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" className="p-1 text-center">
              No attendance records found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const AttendanceReport = () => {
  const { setLoading, setError, loading , currentPage, setCurrentPage, rowsPerPage } = useStore();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reportData, setReportData] = useState([]);
  const [reportGenerated, setReportGenerated] = useState(false);
  const printIframeRef = useRef(null); 
  const fetchAttendanceReport = useCallback(async () => {
    if (!isValid(startDate) || !isValid(endDate)) {
      toast.error("Please select valid start and end dates.");
      return;
    }
    if (startDate > endDate) {
      toast.error("Start date cannot be after end date.");
      return;
    }

    setLoading(true);
    setReportData([]);
    setReportGenerated(true);

    try {
      const startDateISO = startDate.toISOString();
      const endDateISO = endDate.toISOString();
      const fetchedReport = await AttendanceApis.getAttendanceReport(
        startDateISO,
        endDateISO
      );
      setReportData(fetchedReport);
      if (fetchedReport.length === 0) {
        toast.info("No attendance records found for the selected date range.");
      } else {
        toast.success("Attendance report generated successfully!");
      }
    } catch (err) {
      setError("Failed to fetch attendance report: " + err.message);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, setLoading, setError]);

  const handleStartDateChange = useCallback((e) => {
    const localDate = new Date(e.target.value);
    if (isValid(localDate)) {
      setStartDate(localDate);
    }
  }, []);

  const handleEndDateChange = useCallback((e) => {
    const localDate = new Date(e.target.value);
    if (isValid(localDate)) {
      setEndDate(localDate);
    }
  }, []);


  // Helper to format date for input value
  const formatDateForInput = (date) =>
    isValid(date) ? format(date, "yyyy-MM-dd") : "";

  // Function to handle printing the report using an iframe and renderToString
  const handlePrint = useCallback(() => {
    if (reportData.length === 0) {
      toast.error("No data to print. Please generate a report first.");
      return;
    }

    const iframe = printIframeRef.current;
    if (!iframe) {
      toast.error("Print functionality not ready. Please try again.");
      return;
    }
    const printWindow = iframe.contentWindow;
    // Render the PrintableAttendanceReport component to an HTML string
    const reportHtml = renderToString(
      <PrintableAttendanceReport
        data={reportData}
        startDate={startDate}
        endDate={endDate}
      />
    );
    printWindow.document.open();
    printWindow.document
      .write(`<!DOCTYPE html><html><head><title>Expense Report</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>@page { size: A4; margin: 0.5in; } body { font-family: 'Inter', sans-serif; }</style>
      </head><body>${reportHtml}</body></html>`);
    printWindow.document.close();
    iframe.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }, [reportData, startDate, endDate]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentData = reportData.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl max-sm:text-xl font-bold text-blue-900/90">
          Attendance Report
        </h2>
        {reportData.length > 0 && (
          <button
            onClick={handlePrint}
            className="flex items-center cursor-pointer gap-1 sm:gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-3 sm:px-4 rounded-md"
          >
            <PrintIcon /> Print
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg">
        {/* Removed category dropdown as per request */}
        <input
          type="date"
          value={formatDateForInput(startDate)} // Use formatted date for input value
          onChange={handleStartDateChange}
          className="w-full max-sm:text-sm p-2 border rounded-md"
        />
        <input
          type="date"
          value={formatDateForInput(endDate)} // Use formatted date for input value
          onChange={handleEndDateChange}
          className="w-full max-sm:text-sm p-2 border rounded-md"
        />
        <button
          onClick={fetchAttendanceReport}
          disabled={
            loading ||
            !isValid(startDate) ||
            !isValid(endDate) ||
            startDate > endDate
          }
          className={`bg-blue-900/80 max-sm:text-sm cursor-pointer text-white font-bold py-2 px-4 rounded-md hover:bg-blue-900 ${
            loading ||
            !isValid(startDate) ||
            !isValid(endDate) ||
            startDate > endDate
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      <div className="overflow-x-auto max-h-[600px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                S.No.
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Employee Name
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 max-sm:text-xs text-sm">
            {reportData.length === 0 && reportGenerated ? (
              <tr>
                <td colSpan="7" className="text-center p-8 text-gray-500">
                  No attendance records found for the selected date range.
                </td>
              </tr>
            ) : reportData.length === 0 && !reportGenerated ? (
              <tr>
                <td colSpan="7" className="text-center p-8 text-gray-500">
                  Select a date range and click "Generate Report" to view
                  attendance data.
                </td>
              </tr>
            ) : (
              currentData.map((record, index) => (
                <tr key={record._id} className="hover:bg-gray-50">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination data={reportData} />
      </div>
      {/* Hidden iframe for printing */}
      <iframe
        ref={printIframeRef}
        style={{
          display: "none",
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
        }}
        title="Attendance Report Print Preview"
      />
    </div>
  );
};

export default AttendanceReport;
