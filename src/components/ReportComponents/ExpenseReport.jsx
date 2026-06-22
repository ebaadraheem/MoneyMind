import React, { useState, useEffect, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { renderToString } from "react-dom/server";
import useStore from "../../store/useStore";
import { format } from "date-fns";
import ExpenseApis from "../../services/ExpenseApis";
import { PrintIcon } from "../../utils/Icons";
import Pagination from "../../hooks/usePagination";

const PrintableDetailsReport = ({
  data,
  startDate,
  endDate,
  categoryName,
  totals,
  businessDetails,
}) => (
  <div className="p-2">
    <div className="text-center mb-4">
      <h1 className="text-2xl font-bold">
        {businessDetails?.name || "SnapMart"}
      </h1>
      <h2 className="text-lg font-semibold">Detailed Expense Report</h2>
      <p className="text-xs">Category: {categoryName}</p>
      <p className="text-xs">
        From: {startDate ? format(new Date(startDate), "dd-MMM-yyyy") : "N/A"}{" "}
        To: {endDate ? format(new Date(endDate), "dd-MMM-yyyy") : "N/A"}
      </p>
    </div>
    <table className="w-full text-xs border-collapse">
      <thead className="border-t border-b border-black">
        <tr>
          <th className="p-1 text-left">S.No.</th>
          <th className="p-1 text-left">Date</th>
          <th className="p-1 text-left">Description</th>
          <th className="p-1 text-right">Amount</th>
        </tr>
      </thead>
      <tbody className="border-b border-black">
        {data &&
          data.map((item,index) => (
            <tr key={item._id}>
              <td className="p-1">{index + 1}</td>
              <td className="p-1">
                {item.expenseDate
                  ? format(new Date(item.expenseDate), "dd-MMM-yyyy")
                  : "N/A"}
              </td>
              <td className="p-1">{item.title}</td>
              <td className="p-1 text-right">
                {item.amount ? item.amount.toFixed(2) : "0.00"}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
    <div className="flex justify-between text-xs font-bold mt-2">
      <span>Total Records: {totals.recordCount}</span>
      <span>
        Grand Total: {totals.totalValue ? totals.totalValue.toFixed(2) : "0.00"}
      </span>
    </div>
  </div>
);

const PrintableSummaryReport = ({
  data,
  totals,
  startDate,
  endDate,
  businessDetails,
}) => (
  <div className="p-2">
    <div className="text-center mb-4">
      <h1 className="text-xl font-bold">
        {businessDetails?.name || "SnapMart"}
      </h1>
      <h2 className="text-lg font-semibold">Expense Summary by Category</h2>
      <p className="text-xs">
        From: {startDate ? format(new Date(startDate), "dd-MMM-yyyy") : "N/A"}{" "}
        To: {endDate ? format(new Date(endDate), "dd-MMM-yyyy") : "N/A"}
      </p>
    </div>
    <table className="w-full text-xs border-collapse">
      <thead className="border-t border-b border-black">
        <tr>
          <th className="p-1 text-left">S.No.</th>
          <th className="p-1 text-left">Category</th>
          <th className="p-1 text-right">Total Amount</th>
        </tr>
      </thead>
      <tbody className="border-b border-black">
        {data &&
          data.map((item, index) => (
            <tr key={item.categoryId}>
              <td className="p-1">{index + 1}</td>
              <td className="p-1">{item.categoryName}</td>
              <td className="p-1 text-right">
                {item.totalAmount ? item.totalAmount.toFixed(2) : "0.00"}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
    <div className="flex justify-between text-xs font-bold mt-2">
      <span>Total Records: {totals.recordCount}</span>
      <span>
        Grand Total: {totals.totalValue ? totals.totalValue.toFixed(2) : "0.00"}
      </span>
    </div>
  </div>
);

const ExpenseReport = () => {
  const {
    setLoading,
    setExpenseCategories,
    expenseCategories,
    businessDetails,
    currentPage,
    setCurrentPage,
    rowsPerPage,
  } = useStore();
  const [reportData, setReportData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all-summary");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const iframeRef = useRef(null);

  const isSummaryView = selectedCategory === "all-summary";
  const isValidSummaryData =
    isSummaryView && reportData?.[0]?.totalAmount !== undefined;
  const isValidDetailedData =
    !isSummaryView && reportData?.[0]?.amount !== undefined;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await ExpenseApis.getExpenseCategories();
        setExpenseCategories(res || []);
      } catch {
        toast.error("Failed to fetch expense categories.");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setReportData([]); // clear data when switching view types
  }, [selectedCategory]);

  const reportTotals = useMemo(() => {
    if (!reportData.length) return null;

    const totalValue = reportData.reduce((acc, item) => {
      if (isSummaryView) {
        return acc + (item.totalAmount || 0);
      } else {
        return acc + (item.amount || 0);
      }
    }, 0);

    return { recordCount: reportData.length, totalValue };
  }, [isSummaryView, reportData]);

  const handleGenerateReport = async () => {
    setLoading(true);
    setCurrentPage(1);
    try {
      const response = isSummaryView
        ? await ExpenseApis.getExpenseSummaryReport(startDate, endDate)
        : await ExpenseApis.getExpenseDetailsReport(
            selectedCategory,
            startDate,
            endDate
          );

      setReportData(response || []);
      if (!response?.length) toast.success("No data found.");
    } catch {
      toast.error("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!iframeRef.current) return;
    const printWindow = iframeRef.current.contentWindow;
    const categoryName =
      expenseCategories.find((c) => c._id === selectedCategory)?.name ||
      "All Categories";

    const reportHtml = renderToString(
      isSummaryView ? (
        <PrintableSummaryReport
          data={reportData}
          totals={reportTotals}
          startDate={startDate}
          businessDetails={businessDetails}
          endDate={endDate}
        />
      ) : (
        <PrintableDetailsReport
          data={reportData}
          startDate={startDate}
          endDate={endDate}
          categoryName={categoryName}
          businessDetails={businessDetails}
          totals={{
            recordCount: reportData.length,
            totalValue: reportData.reduce(
              (acc, item) => acc + (item.amount || 0),
              0
            ),
          }}
        />
      )
    );

    printWindow.document.open();
    printWindow.document
      .write(`<!DOCTYPE html><html><head><title>Expense Report</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>@page { size: A4; margin: 0.5in; } body { font-family: 'Inter', sans-serif; }</style>
      </head><body>${reportHtml}</body></html>`);
    printWindow.document.close();
    iframeRef.current.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  
  // --- Calculate current rows for the page ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentSales = reportData.slice(indexOfFirstRow, indexOfLastRow);


  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl max-sm:text-xl font-bold text-blue-900/90">
          Expense Report
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border rounded-lg">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2 border rounded-md cursor-pointer max-sm:text-sm"
        >
          <option value="all-summary">Summary</option>
          <option value="all">All Reports</option>
          {expenseCategories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full max-sm:text-sm p-2 border rounded-md"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full max-sm:text-sm p-2 border rounded-md"
        />
        <button
          onClick={handleGenerateReport}
          className="bg-blue-900/80 cursor-pointer max-sm:text-sm text-white font-bold py-2 px-4 rounded-md hover:bg-blue-900"
        >
          Generate
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-sm max-sm:text-xs">
          <thead className="bg-blue-50">
            {isValidSummaryData ? (
              <tr>
                <th className="p-2 text-left">S.No.</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-right">Total Amount</th>
              </tr>
            ) : isValidDetailedData ? (
              <tr>
                <th className="p-2 text-left">S.No.</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-right">Amount</th>
              </tr>
            ) : null}
          </thead>
          <tbody>
            {reportData.length > 0 ? (
              currentSales.map((item, index) => (
                <tr
                  key={item._id || item.categoryId}
                  className="border-b hover:bg-gray-50"
                >
                  {isValidSummaryData ? (
                    <>
                      <td className="p-2">{indexOfFirstRow+index + 1}</td>
                      <td className="p-2">{item.categoryName}</td>
                      <td className="p-2 text-right">
                        {item.totalAmount
                          ? item.totalAmount.toFixed(2)
                          : "0.00"}
                      </td>
                    </>
                  ) : isValidDetailedData ? (
                    <>
                      <td className="p-2">
                        {indexOfFirstRow+index + 1}
                      </td>
                      <td className="p-2">
                        {item.expenseDate
                          ? format(new Date(item.expenseDate), "dd-MMM-yyyy")
                          : "N/A"}
                      </td>
                      <td className="p-2">{item.title}</td>
                      <td className="p-2">{item.categoryName}</td>
                      <td className="p-2 text-right">
                        {item.amount ? item.amount.toFixed(2) : "0.00"}
                      </td>
                    </>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-8 text-gray-500">
                  No expenses found. Generate a report to see data.
                </td>
              </tr>
            )}
          </tbody>
          {isValidSummaryData && reportData.length > 0 ? (
            <tfoot className="bg-gray-100 font-bold">
              <tr>
                <td colSpan="2" className="p-2 text-right">
                  Grand Total:
                </td>
                <td className="p-2 text-right">
                  {reportTotals?.totalValue?.toFixed(2) ?? "0.00"}
                </td>
              </tr>
            </tfoot>
          ) : isValidDetailedData && reportData.length > 0 ? (
            <tfoot className="bg-gray-100 font-bold">
              <tr>
                <td colSpan="4" className="p-2 text-right">
                  Grand Total:
                </td>
                <td className="p-2 text-right">
                  {reportTotals?.totalValue?.toFixed(2) ?? "0.00"}
                </td>
              </tr>
            </tfoot>
          ) : null}
        </table>
        <Pagination data={reportData} />
      </div>
      <iframe ref={iframeRef} style={{ display: "none" }} title="Print Frame" />
    </div>
  );
};

export default ExpenseReport;
