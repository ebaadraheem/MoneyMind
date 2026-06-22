import React, { useState, useEffect, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { renderToString } from "react-dom/server";
import PeopleApis from "../../../services/PeopleApis";
import CustomerApis from "../../../services/CustomerApis";
import useStore from "../../../store/useStore";
import { format } from "date-fns";
import { PrintIcon } from "../../../utils/Icons";
import Pagination from "../../../hooks/usePagination";

const PrintableSummaryReport = ({
  data,
  totals,
  startDate,
  endDate,
  customerName,
  businessDetails,
}) => (
  <div className="p-2">
    <div className="text-center mb-4">
      <h1 className="text-xl font-bold">{businessDetails?.name || "SnapMart"}</h1>
      <h2 className="text-lg font-semibold">Sales Summary</h2>
      <p className="text-xs">
        From: {format(new Date(startDate), "dd-MMM-yyyy")} To:{" "}
        {format(new Date(endDate), "dd-MMM-yyyy")}
      </p>
      <p className="text-xs">User: {customerName || "All Users"}</p>
    </div>
    <table className="w-full text-xs border-collapse">
      <thead className="border-t border-b border-black">
        <tr>
          <th className="p-1 text-left">S.No.</th>
          <th className="p-1 text-left">Product</th>
          <th className="p-1 text-right">Quantity</th>
          <th className="p-1 text-right">Sale Value</th>
        </tr>
      </thead>
      <tbody className="border-b border-black">
        {data.map((item, index) => (
          <tr key={item.productId}>
            <td className="p-1">{index + 1}</td>
            <td className="p-1">{item.productName}</td>
            <td className="p-1 text-right">{item.totalQuantity}</td>
            <td className="p-1 text-right">{item.totalValue.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="flex justify-between text-xs font-bold mt-2">
      <span>Total Records: {totals.recordCount}</span>
      <span>Total Sales: {totals.totalValue.toFixed(2)}</span>
    </div>
  </div>
);

const SalesSummaryReport = () => {
  const { setLoading, customers, setCustomers, businessDetails, currentPage, setCurrentPage, rowsPerPage } = useStore();
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [summaryData, setSummaryData] = useState([]);
  const [reportGenerated, setReportGenerated] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await PeopleApis.searchCustomers("");
        setCustomers(response);
      } catch (error) {
        toast.error("Failed to fetch customers.");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [setLoading, setCustomers]);

  const reportTotals = useMemo(() => {
    const totalValue = summaryData.reduce(
      (acc, item) => acc + item.totalValue,
      0
    );
    return {
      recordCount: summaryData.length,
      totalValue,
    };
  }, [summaryData]);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both a start and end date.");
      return;
    }
    setLoading(true);
    setReportGenerated(false);
    setCurrentPage(1); // Reset to page 1 for new report
    try {
      const response = await CustomerApis.getSalesSummaryReport({
        customerId: selectedCustomer ? selectedCustomer : "all",
        startDate,
        endDate,
      });
      setSummaryData(response || []);
      setReportGenerated(true);
      if (!response || response.length === 0) {
        toast.success("Report generated, but no data found.");
      }
    } catch (error) {
      toast.error("Failed to generate report.");
      setSummaryData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!iframeRef.current) {
      toast.error("Printing not available.");
      return;
    }
    const selectedCustomerName = selectedCustomer
      ? customers.find((c) => c._id === selectedCustomer)?.name
      : "All Users";
    const reportHtml = renderToString(
      <PrintableSummaryReport
        data={summaryData}
        totals={reportTotals}
        startDate={startDate}
        endDate={endDate}
        businessDetails={businessDetails}
        customerName={selectedCustomerName}
      />
    );
    const printWindow = iframeRef.current.contentWindow;
    printWindow.document.open();
    printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Sales Summary Report</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @page { size: A4; margin: 0.5in; }
                    body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }y
                    @media print {
                    tfoot {
                      display: table-row-group; /* Prevent repeating footer on every printed page */
                        }
                  }
                </style>
            </head>
            <body>${reportHtml}</body>
            </html>
        `);
    printWindow.document.close();
    iframeRef.current.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  // --- Calculate current rows for the page ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentSales = summaryData.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl max-sm:text-lg font-bold text-blue-900/90">
          Sales Summary Report
        </h2>
        {reportGenerated && summaryData.length > 0 && (
          <button
            onClick={handlePrint}
            className="flex items-center cursor-pointer gap-1 sm:gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-3 sm:px-4 rounded-md"
          >
            <PrintIcon /> Print
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border border-gray-200 rounded-lg">
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          className="w-full p-2 max-sm:text-sm cursor-pointer border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80"
        >
          <option value="">All Customers</option>
          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2 border max-sm:text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full p-2 border max-sm:text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80"
        />
        <button
          onClick={handleGenerateReport}
          className="bg-blue-900/80 max-sm:text-sm cursor-pointer text-white font-bold py-2 px-4 rounded-md hover:bg-blue-900 md:col-span-3"
        >
          Generate
        </button>
      </div>

      {reportGenerated ? (
        summaryData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-blue-50">
                <tr>
                  <th className="p-2 text-left font-semibold">S.No.</th>
                  <th className="p-2 text-left font-semibold">Product</th>
                  <th className="p-2 text-right font-semibold">Quantity</th>
                  <th className="p-2 text-right font-semibold">Sale Value</th>
                </tr>
              </thead>
              <tbody>
                {currentSales.map((item, index) => (
                  <tr
                    key={item.productId}
                    className="border-b hover:bg-gray-50 max-sm:text-xs"
                  >
                    <td className="p-2">{indexOfFirstRow + index + 1}</td>
                    <td className="p-2">{item.productName}</td>
                    <td className="p-2 text-right">{item.totalQuantity}</td>
                    <td className="p-2 text-right">
                      {item.totalValue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-bold max-sm:text-xs">
                <tr>
                  <td colSpan="2" className="p-2 text-left">
                    Total Records: {reportTotals.recordCount}
                  </td>
                  <td colSpan="2" className="p-2 text-right">
                    Total Sales: {reportTotals.totalValue.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
            <Pagination data={currentSales} />
          </div>
        ) : (
          <div className="text-center max-sm:text-sm py-10 text-gray-500">
            <p>No records found.</p>
          </div>
        )
      ) : (
        <div className="text-center max-sm:text-sm py-10 text-gray-400">
          <p>Please select filters and click "Generate".</p>
        </div>
      )}
      <iframe ref={iframeRef} style={{ display: "none" }} title="Print Frame" />
    </div>
  );
};

export default SalesSummaryReport;
