import React, { useState, useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { renderToString } from "react-dom/server";
import PeopleApis from "../../../services/PeopleApis";
import SupplierApis from "../../../services/SupplierApis";
import useStore from "../../../store/useStore";
import { PrintIcon } from "../../../utils/Icons";
import Pagination from "../../../hooks/usePagination";

const PrintableReport = ({
  data,
  totals,
  startDate,
  endDate,
  supplierName,
  businessDetails,
}) => (
  <div>
    <div className="text-center mb-6">
      <h1 className="text-3xl font-extrabold text-blue-900/80 mb-2">
        {businessDetails?.name || "SnapMart"}
      </h1>
      <h2 className="text-xl font-bold text-gray-700">
        Purchase Transaction Report
      </h2>
      <p className="text-sm text-gray-600">
        Date Range: {new Date(startDate).toLocaleDateString()} -{" "}
        {new Date(endDate).toLocaleDateString()}
      </p>
      <p className="text-sm text-gray-600">
        Supplier: {supplierName || "All Suppliers"}
      </p>
    </div>
    <table className="min-w-full text-sm">
      <thead className="bg-gray-100">
        <tr className="border-b border-gray-300">
          <th className="py-2 px-3 text-left font-semibold">S.No.</th>
          <th className="py-2 px-3 text-left font-semibold">Date</th>
          <th className="py-2 px-3 text-left font-semibold">Invoice #</th>
          <th className="py-2 px-3 text-left font-semibold">Supplier</th>
          <th className="py-2 px-3 text-right font-semibold">Total Amount</th>
          <th className="py-2 px-3 text-right font-semibold">Paid Amount</th>
          <th className="py-2 px-3 text-right font-semibold">Balance</th>
        </tr>
      </thead>
      <tbody>
        {data.map((purchase, index) => (
          <tr key={purchase.invoiceNumber} className="border-b border-gray-200">
            <td className="py-2 px-3">{index + 1}</td>
            <td className="py-2 px-3">{purchase.purchaseDate.split("T")[0]}</td>
            <td className="py-2 px-3">{purchase.invoiceNumber || "N/A"}</td>
            <td className="py-2 px-3">{purchase.supplierName || "N/A"}</td>
            <td className="py-2 px-3 text-right">
              {purchase.totalAmount.toFixed(2)}
            </td>
            <td className="py-2 px-3 text-right">
              {purchase.paidAmount.toFixed(2)}
            </td>
            <td className="py-2 px-3 text-right">
              {purchase.balance.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot className="bg-gray-100 font-bold">
        <tr className="border-t-2 border-gray-300">
          <td colSpan="4" className="py-2 px-3 text-right">
            Grand Totals:
          </td>
          <td className="py-2 px-3 text-right">
            {totals.totalAmount.toFixed(2)}
          </td>
          <td className="py-2 px-3 text-right">
            {totals.paidAmount.toFixed(2)}
          </td>
          <td className="py-2 px-3 text-right">{totals.balance.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    <div className="text-center text-gray-500 text-xs mt-8">
      Report generated on {new Date().toLocaleString()}
    </div>
  </div>
);

const PurchaseTransactionReport = () => {
  const {
    setLoading,
    suppliers,
    setSuppliers,
    businessDetails,
    currentPage,
    setCurrentPage,
    rowsPerPage,
  } = useStore();
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [purchaseData, setPurchaseData] = useState([]);
  const [reportGenerated, setReportGenerated] = useState(false);
  const iframeRef = useRef(null);

  // Fetch suppliers for the dropdown
  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const response = await PeopleApis.searchSuppliers("");
        setSuppliers(response);
      } catch (error) {
        toast.error("Failed to fetch suppliers.");
        console.error("Error fetching suppliers:", error);
      } finally {
        setLoading(false);
      }
    };
    if (!suppliers || suppliers.length === 0) {
      fetchSuppliers();
    }
  }, [setLoading, setSuppliers, suppliers]);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both a start and end date.");
      return;
    }
    setLoading(true);
    setReportGenerated(false);
    setCurrentPage(1); // Reset to page 1 for new report
    try {
      const response = await SupplierApis.getPurchaseTransactionReport({
        supplierId: selectedSupplier ? selectedSupplier : "all",
        startDate,
        endDate,
      });
      setPurchaseData(response || []);
      setReportGenerated(true);
      if (!response || response.length === 0) {
        toast.success("No data found for this period.");
      }
    } catch (error) {
      toast.error("Failed to generate report.");
      console.error("Error generating report:", error);
      setPurchaseData([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals for the report footer
  const reportTotals = useMemo(() => {
    return purchaseData.reduce(
      (acc, purchase) => {
        acc.totalAmount += purchase.totalAmount || 0;
        acc.paidAmount += purchase.paidAmount || 0;
        acc.balance += purchase.balance || 0;
        return acc;
      },
      { totalAmount: 0, paidAmount: 0, balance: 0 }
    );
  }, [purchaseData]);

  // Triggers print by writing to a hidden iframe
  const handlePrint = () => {
    if (!iframeRef.current) {
      toast.error("Printing is not available right now. Please try again.");
      return;
    }

    const selectedSupplierName = selectedSupplier
      ? suppliers.find((s) => s._id === selectedSupplier)?.name
      : "All Suppliers";

    const reportHtml = renderToString(
      <PrintableReport
        data={purchaseData}
        totals={reportTotals}
        startDate={startDate}
        endDate={endDate}
        businessDetails={businessDetails}
        supplierName={selectedSupplierName}
      />
    );

    const printWindow = iframeRef.current.contentWindow;
    printWindow.document.open();
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Purchase Transaction Report</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @page {
                    size: A4;
                    margin: 1in;
                }
                body {
                    font-family: 'Inter', sans-serif;
                }
                @media print {
                tfoot {
                    display: table-row-group; /* Prevent repeating footer on every printed page */
                } 
            </style>
        </head>
        <body>
            ${reportHtml}
        </body>
        </html>
    `);
    printWindow.document.close();

    // Wait for the iframe to load its content before printing
    iframeRef.current.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  // --- Calculate current rows for the page ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentSales = purchaseData.slice(indexOfFirstRow, indexOfLastRow);

  const isGenerateDisabled = !startDate || !endDate;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl max-sm:text-lg font-bold text-blue-900/90">
          Purchase Transaction Report
        </h2>
        {reportGenerated && purchaseData.length > 0 && (
          <button
            onClick={handlePrint}
            className="flex items-center sm:gap-2 gap-1 max-sm:text-sm cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-3 sm:px-4 rounded-md transition duration-300"
          >
            <PrintIcon />
            Print
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border border-gray-200 rounded-lg">
        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="w-full p-2 max-sm:text-sm cursor-pointer border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80"
        >
          <option value="">All Suppliers</option>
          {suppliers.map((supplier) => (
            <option key={supplier._id} value={supplier._id}>
              {supplier.name} ({supplier.companyName})
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2 max-sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full p-2 max-sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80"
        />
        <button
          onClick={handleGenerateReport}
          disabled={isGenerateDisabled}
          className="bg-blue-900/80 max-sm:text-sm cursor-pointer text-white font-bold py-2 px-4 rounded-md hover:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Generate
        </button>
      </div>

      {/* Report Display Area */}
      {reportGenerated ? (
        purchaseData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-blue-50">
                <tr>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">
                    S.No.
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">
                    Invoice #
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">
                    Supplier
                  </th>
                  <th className="py-2 px-4 text-right text-sm font-semibold text-gray-700">
                    Total Amount
                  </th>
                  <th className="py-2 px-4 text-right text-sm font-semibold text-gray-700">
                    Paid Amount
                  </th>
                  <th className="py-2 px-4 text-right text-sm font-semibold text-gray-700">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentSales.map((purchase, index) => (
                  <tr
                    key={purchase.invoiceNumber}
                    className="hover:bg-gray-50 max-sm:text-xs text-sm"
                  >
                    <td className="py-2 px-4 border-b  text-gray-800">
                      {indexOfFirstRow + index + 1}
                    </td>
                    <td className="py-2 px-4 border-b  text-gray-800">
                      {purchase.purchaseDate.split("T")[0]}
                    </td>
                    <td className="py-2 px-4 border-b  text-gray-800">
                      {purchase.invoiceNumber || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b  text-gray-800">
                      {purchase.supplierName || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b text-right  text-gray-800">
                      {purchase.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b text-right text-gray-800">
                      {purchase.paidAmount.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b text-right text-gray-800">
                      {purchase.balance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-bold">
                <tr className="text-sm max-sm:text-xs">
                  <td
                    colSpan="4"
                    className="py-2 px-4 border-b text-right text-gray-800"
                  >
                    Grand Totals:
                  </td>
                  <td className="py-2 px-4 border-b text-right text-gray-800">
                    {reportTotals.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 border-b text-right text-gray-800">
                    {reportTotals.paidAmount.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 border-b text-right text-gray-800">
                    {reportTotals.balance.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
            <Pagination data={purchaseData} />
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No purchase records found for the selected criteria.</p>
          </div>
        )
      ) : (
        <div className="text-center py-10 text-gray-400">
          <p>
            Please select your filters and click "Generate" to see the report.
          </p>
        </div>
      )}

      {/* Hidden iframe for printing */}
      <iframe ref={iframeRef} style={{ display: "none" }} title="Print Frame" />
    </div>
  );
};

export default PurchaseTransactionReport;
