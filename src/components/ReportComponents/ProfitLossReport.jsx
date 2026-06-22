import React, { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import useStore from "../../store/useStore";
import api from "../../services/api";
import { renderToString } from "react-dom/server"; // Needed for iframe print
import { PrintIcon } from "../../utils/Icons";


const DatePicker = ({ selected, onChange, className, ...props }) => {
  return (
    <input
      type="date"
      value={selected ? new Date(selected).toISOString().split("T")[0] : ""}
      onChange={(e) =>
        onChange(e.target.value ? new Date(e.target.value) : null)
      }
      className={className}
      {...props}
    />
  );
};

const ProfitLossContent = React.forwardRef(
  ({ reportData, startDate, endDate, businessDetails }, ref) => {
    const primaryTextColor = "text-blue-900/80";
    const neutralBg = "bg-blue-50";
    const positiveColor = "text-green-700";
    const negativeColor = "text-red-700";
    const strongText = "text-gray-800";
    const lightText = "text-gray-600";

    return (
      <div
        ref={ref}
        className={`p-3 sm:p-6 print:p-0 ${primaryTextColor} `}
      >
        <div className="text-center mb-6">
          <h1 className={`text-3xl max-sm:text-2xl font-extrabold ${primaryTextColor} mb-2`}>
            {businessDetails?.name || "SnapMart"}
          </h1>
          <p className={`text-sm max-sm:text-xs ${lightText}`}>
            For the period:{" "}
            {startDate ? format(startDate, "MMM dd, yyyy") : "N/A"} to{" "}
            {endDate ? format(endDate, "MMM dd, yyyy") : "N/A"}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className={`p-4 rounded-lg shadow-sm ${neutralBg}`}>
            <div className="flex justify-between items-center">
              <span className={`sm:text-lg font-semibold ${strongText}`}>
                Sale Profit:
              </span>
              <span
                className={`sm:text-xl font-bold ${
                  reportData?.totalSalesProfit >= 0
                    ? positiveColor
                    : negativeColor
                }`}
              >
                {reportData?.totalSalesProfit || 0}
              </span>
            </div>
          </div>

          <div className={`p-4 rounded-lg shadow-sm ${neutralBg}`}>
            <div className="flex justify-between items-center">
              <span className={`sm:text-lg font-semibold ${strongText}`}>
                Sale Return Profit:
              </span>
              <span
                className={`sm:text-xl font-bold ${
                  reportData?.totalReturnProfit >= 0
                    ? positiveColor
                    : negativeColor
                }`}
              >
                {reportData?.totalReturnProfit || 0}
              </span>
            </div>
          </div>

          <div className={`p-4 rounded-lg shadow-sm ${neutralBg}`}>
            <div className="flex justify-between items-center">
              <span className={`sm:text-lg font-semibold ${strongText}`}>
                Total Expenses:
              </span>
              <span className={`sm:text-xl font-bold ${negativeColor}`}>
                {reportData?.totalExpenses || 0}
              </span>
            </div>
          </div>

          <div className={`p-4 rounded-lg shadow-md ${neutralBg}`}>
            <div className="flex justify-between items-center">
              <span className={`text-2xl max-sm:text-xl font-extrabold ${primaryTextColor}`}>
                Profit/Loss:
              </span>
              <span
                className={`text-2xl max-sm:text-xl font-extrabold ${
                  reportData?.netProfit >= 0 ? positiveColor : negativeColor
                }`}
              >
                {reportData?.netProfit || 0}
              </span>
            </div>
          </div>
        </div>

        <p className={`text-center text-sm max-sm:text-xs ${lightText} mt-8`}>
          Report generated on {format(new Date(), "MMM dd, yyyy hh:mm a")}
        </p>
      </div>
    );
  }
);

const ProfitLossReport = () => {
  const { loading, setLoading, setError, businessDetails } = useStore();
  const [startDate, setStartDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  ); // Default to last month
  const [endDate, setEndDate] = useState(new Date());
  const [reportData, setReportData] = useState(null);
  const iframeRef = useRef(); // Ref for the hidden iframe

  const fetchReport = useCallback(async () => {
    toast.dismiss();
    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const data = await api.getProfitLossReport(startDate, endDate);
      setReportData(data);
    } catch (err) {
      setError(`Failed to generate report: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, setLoading, setError]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // --- Manual Print Function (using iframe) ---
  const handlePrint = useCallback(() => {
    if (!reportData) {
      toast.error("No report data to print.");
      return;
    }
    if (!iframeRef.current) {
      toast.error("Print iframe not ready. Please try again.");
      return;
    }

    try {
      const reportHtml = renderToString(
        <ProfitLossContent
          reportData={reportData}
          startDate={startDate}
          endDate={endDate}
          businessDetails={businessDetails}
        />
      );

      const iframe = iframeRef.current;
      let printWindow = iframe.contentWindow;

      printWindow.document.open();
      printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Profit & Loss Report</title>
                    <style>
                        /* Inject Tailwind CSS (or relevant styles) here for print */
                        /* Replace 'YOUR_MAIN_TAILWIND_CSS_PATH' with the actual path to your compiled Tailwind CSS */
                        /* Example: @import url('/index.css'); if your compiled CSS is in the root public folder */
                        /* Or manually inline critical styles */
                        @import url('YOUR_MAIN_TAILWIND_CSS_PATH'); 

                        body { font-family: sans-serif; margin: 0; padding: 20mm; }
                        @page { size: A4; margin: 20mm; } /* Set page size and margins */
                        .no-print { display: none !important; }
                        
                        /* Basic styles for the report content if Tailwind is not fully imported */
                        .text-center { text-align: center; }
                        .mb-6 { margin-bottom: 1.5rem; }
                        .font-extrabold { font-weight: 800; }
                        .text-blue-900\/80 { color: rgba(17, 24, 39, 0.8); }
                        .text-sm { font-size: 0.875rem; }
                        .text-gray-600 { color: #4b5563; }
                        .space-y-4 > *:not([hidden]) ~ *:not([hidden]) { margin-top: 1rem; }
                        .p-4 { padding: 1rem; }
                        .rounded-lg { border-radius: 0.5rem; }
                        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
                        .bg-blue-50 { background-color: #eff6ff; }
                        .flex { display: flex; }
                        .justify-between { justify-content: space-between; }
                        .items-center { align-items: center; }
                        .text-lg { font-size: 1.125rem; }
                        .font-semibold { font-weight: 600; }
                        .text-xl { font-size: 1.25rem; }
                        .font-bold { font-weight: 700; }
                        .text-green-700 { color: #047857; }
                        .text-red-700 { color: #b91c1c; }
                        .text-2xl { font-size: 1.5rem; }
                        .text-3xl { font-size: 1.875rem; }
                        .border-t-2 { border-top-width: 2px; }
                        .border-b-2 { border-bottom-width: 2px; }
                        .border-blue-900\/90 { border-color: rgba(17, 24, 39, 0.9); }
                        .mt-8 { margin-top: 2rem; }
                    </style>
                </head>
                <body>
                    ${reportHtml}
                </body>
                </html>
            `);
      printWindow.document.close();

      iframe.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    } catch (error) {
      console.error("Error during manual print:", error);
      toast.error("Failed to prepare report for printing. " + error.message);
    }
  }, [reportData, startDate, endDate]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
     <h1 className={`text-3xl max-sm:text-2xl text-center font-extrabold text-blue-900/80 mb-4`}>
        Profit & Loss Report
      </h1>

      <div className="mb-6 flex flex-wrap gap-4  items-end justify-center no-print">
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm max-sm:text-xs font-medium text-gray-700 mb-1"
          >
            Start Date:
          </label>
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            className="p-2 border max-sm:text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="endDate"
            className="block text-sm max-sm:text-xs font-medium text-gray-700 mb-1"
          >
            End Date:
          </label>
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            className="p-2 border max-sm:text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 outline-none"
          />
        </div>
       
      </div>

      {reportData ? (
        <>
          <div className="mt-6 flex justify-end no-print">
            <button
              onClick={handlePrint}
              className="flex items-center cursor-pointer gap-1 sm:gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-3 sm:px-4 rounded-md"
            >
              <PrintIcon /> Print
            </button>
          </div>
          <ProfitLossContent
            reportData={reportData}
            startDate={startDate}
            endDate={endDate}
            businessDetails={businessDetails}
          />
        </>
      ) : (
        <p className="text-center text-gray-600 py-10">
          {loading
            ? "Loading report..."
            : "Select a date range and generate the Profit & Loss Report."}
        </p>
      )}
      <iframe
        ref={iframeRef}
        title="Print Document"
        style={{
          position: "absolute",
          width: "0",
          height: "0",
          border: "0",
          top: "-1000px",
          left: "-1000px",
        }}
      />
    </div>
  );
};

export default ProfitLossReport;
