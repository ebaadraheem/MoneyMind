import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { renderToString } from "react-dom/server";
import useStore from "../../../store/useStore";
import { format } from "date-fns";
import { PrintIcon } from "../../../utils/Icons";
import Pagination from "../../../hooks/usePagination";

// Helper to format cell data consistently
const formatCellData = (item, col) => {
  const value = item[col.key];

  // --- Special Formatting for Nested Account Data ---
  if (col.key.includes("customer")) {
    // Safely access nested customer account data, providing a default empty object
    const account = item.customerAccount || {};
    if (col.key === "customerTotalAmount")
      return (account.totalAmount || 0).toFixed(2);
    if (col.key === "customerPaidAmount")
      return (account.paidAmount || 0).toFixed(2);
    if (col.key === "customerBalance") return (account.balance || 0).toFixed(2);
  }

  if (col.key.includes("supplier")) {
    // Safely access nested supplier account data
    const account = item.supplierAccount || {};
    if (col.key === "supplierTotalAmount")
      return (account.totalAmount || 0).toFixed(2);
    if (col.key === "supplierPaidAmount")
      return (account.paidAmount || 0).toFixed(2);
    if (col.key === "supplierBalance") return (account.balance || 0).toFixed(2);
  }

  if (col.key.includes("employee")) {
    const account = item.employeeAccount || {};
    if (col.key === "employeeTotalAmount")
      return (account.totalAmount || 0).toFixed(2);
    if (col.key === "employeePaidAmount")
      return (account.paidAmount || 0).toFixed(2);
    if (col.key === "employeeBalance") return (account.balance || 0).toFixed(2);
  }

  // --- General Formatting ---
  if (col.key === "hireDate") {
    return value ? format(new Date(value), "dd-MMM-yyyy") : "N/A";
  }
  if (col.key === "category" || col.key === "uom") {
    return value ? value.name : "N/A";
  }
  if (typeof value === "number") {
    // Check for the balance key to handle negative numbers correctly
    if (col.key.toLowerCase().includes("balance")) {
      return value.toFixed(2);
    }
    return value;
  }

  return value || "N/A";
};

const PrintableReport = ({ data, title, columns,businessDetails }) => (
  <div className="p-2">
    <div className="text-center mb-4">
      <h1 className="text-2xl font-bold">{businessDetails?.name || "SnapMart"}</h1>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-xs">As of: {format(new Date(), "dd-MMM-yyyy")}</p>
    </div>
    <table className="w-full text-xs border-collapse">
      <thead className="border-t border-b border-black">
        <tr>
          <th className="p-1 text-left">S.No.</th>
          {columns.map((col) => (
            <th key={col.key} className="p-1 text-left">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="border-b border-black">
        {data.map((item, index) => (
          <tr key={item._id}>
            <td className="p-1">{index + 1}</td>
            {columns.map((col) => (
              <td key={col.key} className="p-1">
                {formatCellData(item, col)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    <div className="text-xs font-bold mt-2">
      <span>Total Records: {data.length}</span>
    </div>
  </div>
);

const GenericListReport = ({ title, fetchApi, columns }) => {
  const { setLoading, businessDetails, currentPage, setCurrentPage, rowsPerPage } = useStore();
  const [reportData, setReportData] = useState([]);
  const iframeRef = useRef(null);
  useEffect(() => {
    toast.dismiss();
    setCurrentPage(1);
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetchApi();
        if (!response || response.error) {
          throw new Error("Failed to fetch data");
        }
        setReportData(response || []);
      } catch (error) {
        toast.error(`Failed to fetch ${title.toLowerCase()}.`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setLoading, fetchApi, title]);


  const handlePrint = () => {
    if (!iframeRef.current) return;
    const printableColumns = columns.filter((c) => c.printable);
    const reportHtml = renderToString(
      <PrintableReport
        data={reportData}
        businessDetails={businessDetails}
        title={title}
        columns={printableColumns}
      />
    );
    const printWindow = iframeRef.current.contentWindow;
    printWindow.document.open();
    printWindow.document.write(`
            <!DOCTYPE html>
            <html><head><title>${title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @page { size: A4; margin: 0.5in; }
                body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }
            </style>
            </head><body>${reportHtml}</body></html>
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
  const currentData = reportData.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl max-sm:text-xl font-bold text-blue-900/90">{title}</h2>
        {reportData.length > 0 && (
          <button
            onClick={handlePrint}
            className="flex items-center cursor-pointer gap-1 sm:gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-3 sm:px-4 rounded-md"
          >
            <PrintIcon /> Print
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-sm max-sm:text-xs">
          <thead className="bg-blue-50">
            <tr>
              <th className="p-2 text-left font-semibold">S.No.</th>
              {columns.map((col) => (
                <th key={col.key} className="p-2 text-left font-semibold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center p-8 text-gray-500"
                >
                  No records found.
                </td>
              </tr>
            )}
            {reportData &&
              currentData.map((item, index) => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{indexOfFirstRow+index + 1}</td>
                  {columns.map((col) => (
                    <td key={col.key} className="p-2">
                      {formatCellData(item, col)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
        <Pagination data={reportData} />
      </div>
      <iframe ref={iframeRef} style={{ display: "none" }} title="Print Frame" />
    </div>
  );
};

export default GenericListReport;
