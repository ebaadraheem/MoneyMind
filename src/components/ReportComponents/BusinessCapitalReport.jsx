import React, { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import useStore from "../../store/useStore";
import api from "../../services/api";
import { renderToString } from "react-dom/server"; // Needed for iframe print
import { PrintIcon } from "../../utils/Icons";

const ProfitLossContent = React.forwardRef(
  ({ reportData, businessDetails }, ref) => {
    const primaryTextColor = "text-blue-900/80";
    const neutralBg = "bg-blue-50";
    const negativeColor = "text-red-700";
    const lightText = "text-gray-600";

    return (
      <div ref={ref} className={`p-3 sm:p-6 bg-white print:p-0 ${primaryTextColor}`}>
        <div className="text-center mb-6">
          <h1 className="text-3xl max-sm:text-lg font-bold mb-1">{businessDetails?.name || "SnapMart"}</h1>
          <p className={`text-sm max-sm:text-xs ${lightText}`}>
            Business Capital Report
          </p>
        </div>

        <table className={`w-full text-sm max-sm:text-xs border border-gray-300 ${neutralBg}`}>
          <thead>
            <tr className="bg-blue-100 text-left">
              <th className="px-4 py-2 border-b border-gray-300 font-semibold">Description</th>
              <th className="px-4 py-2 border-b border-gray-300 font-semibold">Amount (PKR)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-blue-100">
              <td className="px-4 py-2 border-b">Stock Value</td>
              <td className="px-4 py-2 border-b">{reportData?.totalStockValue || 0}</td>
            </tr>
            <tr className="hover:bg-blue-100">
              <td className="px-4 py-2 border-b">Customer Payables</td>
              <td className="px-4 py-2 border-b">{reportData?.totalCustomerPayables || 0}</td>
            </tr>
            <tr className="hover:bg-blue-100">
              <td className="px-4 py-2 border-b">Customer Receivables</td>
              <td className="px-4 py-2 border-b">{reportData?.totalCustomerReceivables || 0}</td>
            </tr>
            <tr className="hover:bg-blue-100">
              <td className="px-4 py-2 border-b">Employee Payables</td>
              <td className="px-4 py-2 border-b">{reportData?.totalEmployeePayables || 0}</td>
            </tr>
            <tr className="hover:bg-blue-100">
              <td className="px-4 py-2 border-b">Employee Receivables</td>
              <td className="px-4 py-2 border-b">{reportData?.totalEmployeeReceivables || 0}</td>
            </tr>
            <tr className="hover:bg-blue-100">
              <td className="px-4 py-2 border-b">Supplier Payables</td>
              <td className="px-4 py-2 border-b">{reportData?.totalSupplierPayables || 0}</td>
            </tr>
            <tr className="hover:bg-blue-100">
              <td className="px-4 py-2 border-b">Supplier Receivables</td>
              <td className="px-4 py-2 border-b">{reportData?.totalSupplierReceivables || 0}</td>
            </tr>
            <tr className="hover:bg-blue-100">
              <td className="px-4 py-2 border-b text-red-800 font-semibold">Total Capital</td>
              <td className={`px-4 py-2 border-b font-medium ${negativeColor}`}>
                {reportData?.totalCapital || 0}
              </td>
            </tr>
          </tbody>
          
        </table>

        <p className={`text-center text-sm max-sm:text-xs ${lightText} mt-8`}>
          Report generated on {format(new Date(), "MMM dd, yyyy hh:mm a")}
        </p>
      </div>
    );
  }
);

const BusinessCapitalReport = () => {
  const { loading, setLoading, setError,businessDetails } = useStore();
  const [reportData, setReportData] = useState(null);
  const iframeRef = useRef(); // Ref for the hidden iframe

  const fetchReport = useCallback(async () => {
    toast.dismiss();
    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const data = await api.getBusinessCapitalReport();
      setReportData(data);
    } catch (err) {
      setError(`Failed to generate report: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [ setLoading, setError]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

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
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: sans-serif;
            margin: 0;
            padding: 20mm;
            color: rgba(17, 24, 39, 0.8); /* text-blue-900/80 */
            background-color: white;
            font-size: 0.875rem; /* text-sm */
          }

          h1 {
            font-size: 1.25rem; /* text-xl */
            font-weight: 700;
            margin-bottom: 0.25rem;
            text-align: center;
          }

          p {
            text-align: center;
            color: #4b5563; /* text-gray-600 */
            margin-bottom: 1rem;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            background-color: #eff6ff; /* bg-blue-50 */
          }

          th, td {
            padding: 0.5rem 1rem;
            border: 1px solid #d1d5db; /* border-gray-300 */
            text-align: left;
          }

          thead {
            background-color: #dbeafe; /* bg-blue-100 */
          }

          tfoot {
            background-color: #ecfdf5; /* bg-green-50 */
            font-weight: bold;
          }

          .text-green {
            color: #047857; /* text-green-700 */
          }

          .text-red {
            color: #b91c1c; /* text-red-700 */
          }

          .text-gray {
            color: #374151; /* text-gray-800 */
          }

          .mt-8 {
            margin-top: 2rem;
          }

          tr:hover {
            background-color: #e0f2fe; /* hover:bg-blue-100 */
          }
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
}, [reportData]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
     <h1 className={`text-3xl max-sm:text-2xl text-center font-extrabold text-blue-900/80 mb-4`}>
        Business Capital Report
      </h1>
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
            businessDetails={businessDetails}
          />
        </>
      ) : (
        <p className="text-center max-sm:text-sm text-gray-600 py-10">
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

export default BusinessCapitalReport;
